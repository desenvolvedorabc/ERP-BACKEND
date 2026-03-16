import { InstallmentsService } from "../../installments/installments.service";
/*
https://docs.nestjs.com/providers#services
*/

import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { IPaginationMeta, Pagination } from "nestjs-typeorm-paginate";
import { formatPayableToCsv } from "src/common/mappers/csv/format-payables-for-csv";
import { generateCsv } from "src/common/utils/lib/generate-csv";
import {
  sendEmailApprovedManyNotification,
  sendEmailApprovedNotification,
  SendEmailRejectedManyNotification,
  SendEmailRejectedNotification,
} from "src/mails";
import { Contracts } from "src/modules/contracts/entities/contracts.entity";
import { Tables } from "src/modules/files/enums";
import { Installments } from "src/modules/installments/entities/installments.entity";
import { UsersService } from "src/modules/users/users.service";
import { CollaboratorsService } from "src/modules/collaborators/collaborators.service";
import { Approvals } from "../entities/approval.entity";
import { ApprovalsRepository } from "../repositories/approval-repository";
import { ApprovalCredentialsDTO } from "../dto/approvals/approvalCredentials.dto";
import { GenerateApprovalsDTO } from "../dto/approvals/generateApprovals.dto";
import { CreatePartialPayableDTO } from "../dto/payable/createPartialPayable.dto";
import { CreatePayableDTO } from "../dto/payable/createPayable.dto";
import { PayablePaginateParams } from "../dto/payable/payablePaginateParams.dto";
import { UpdatePayableDTO } from "../dto/payable/updatePayable.dto";
import { Payables } from "../entities/payable.entity";
import { DebtorType, PayableStatus, PaymentType } from "../enums";
import {
  ApprovePayableError,
  CreatingPayableError,
  DeletingPayableError,
  FetchingPayableByIdError,
  FetchingPayableError,
  NoPayablesException,
  PayableNotFoundError,
  UpdatingPayableCategoryError,
  UpdatingPayableError,
} from "../errors/PayableErrors";
import { PayablesRepository } from "../repositories/payable-repository";
import { PayableValidator } from "../validations/PayableValidator";
import { ApprovalsService } from "./approval.service";
import { CardMovService } from "src/modules/creditCard/services/cardMov.service";
import { OnEvent } from "@nestjs/event-emitter";
import { CHECKEVENT, RESTOREEVENT } from "src/common/enums/EventsEnums";
import { UpdateInstallmentDTO } from "src/modules/installments/dto/updateInstallment.dto";
import {
  InstallmentStatus,
  InstallmentType,
} from "src/modules/installments/enum";
import { filterContracts } from "src/common/utils/filterContracts";
import { ApprovalsParamsDTO } from "../dto/approvals/ApprovalsParams.dto";
import { CategorizationService } from "src/modules/categorization/categorization.service";
import { RelationType } from "src/modules/categorization/enums";
import { omit } from "lodash";
import { UpdateCategorizationDTO } from "src/modules/categorization/dto/updateCategorization.dto";

@Injectable()
export class PayableService {
  constructor(
    private payablesRepository: PayablesRepository,
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
    private installmentsService: InstallmentsService,
    @Inject(forwardRef(() => ApprovalsService))
    private approvalService: ApprovalsService,
    private validator: PayableValidator,
    @Inject(forwardRef(() => CardMovService))
    private cardMovimentationService: CardMovService,
    private categorizationService: CategorizationService,
    @Inject(forwardRef(() => CollaboratorsService))
    private collaboratorsService: CollaboratorsService,
    private approvalsRepository: ApprovalsRepository,
  ) {}

  private readonly logger = new Logger(InstallmentsService.name);

  async create(data: CreatePayableDTO): Promise<Payables> {
    await this.validator.Duplicate(
      data.identifierCode,
      data.debtorType === DebtorType.COLLABORATOR
        ? data.collaboratorId
        : data.supplierId,
    );

    const massApprovalUsers = await this.userService.findMassApprovalUsers();
    if (massApprovalUsers.length === 0) {
      const { NoMassApprovalUserError } = await import("../errors/ApprovalsErrors");
      throw new NoMassApprovalUserError();
    }

    let newPayable: Payables;

    try {
      const { categorization, ...payable } = data;
      newPayable = await this.payablesRepository._create({
        ...payable,
        totalValue: data.liquidValue + data.taxValue,
        contractId:
          data.paymentType === PaymentType.CONTRACT ? data.contractId : null,
      });

      await this.categorizationService.create(
        categorization,
        RelationType.PAYABLE,
        newPayable.id,
      );

      await this.approvalService.generateApprovals(
        new GenerateApprovalsDTO(
          data.approvers,
          newPayable.id,
          newPayable.identifierCode,
        ),
      );
    } catch (error) {
      console.error(error);
      throw new CreatingPayableError();
    }

    return newPayable;
  }

  async createPayableResidualPayment(
    payable: Payables,
    type: "Distrato" | "Termo",
    userId: number,
    value: number,
  ) {
    try {
      await this.payablesRepository._create({
        ...payable,
        id: undefined,
        paymentType:
          type === "Distrato" ? PaymentType.DISTRATO : PaymentType.TERMO,
        totalValue: value,
        liquidValue: value,
        taxValue: 0,
        payableStatus: PayableStatus.PENDING,
        identifierCode: null,
        recurrent: false,
        recurenceData: {
          startDate: null,
          endDate: null,
          recurrenceType: null,
          dueDay: null,
        },
        dueDate: null,
        updatedAt: undefined,
        createdAt: undefined,
        updatedById: null,
        createdById: userId,
        installments: null,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createPartialPayable(data: CreatePartialPayableDTO) {
    try {
      return await this.payablesRepository._create({
        ...data,
        totalValue: data.liquidValue + data.taxValue,
        contractId:
          data.paymentType === PaymentType.CONTRACT ? data.contractId : null,
      });
    } catch (error) {
      console.error(error);
      throw new CreatingPayableError();
    }
  }

  async createCreditCardBill(data: CreatePartialPayableDTO) {
    const payable = await this.createPartialPayable(data);
    await this.installmentsService.generateInstallmentsPayables(
      payable,
      Tables.PAYABLES,
    );
    return payable;
  }

  async update(id: number, data: UpdatePayableDTO): Promise<void> {
    await this.validator.UpdateRequest(data.identifierCode, id);

    const updateData = omit(data, ["approvers", "categorization"]);

    try {
      await this.payablesRepository._update(id, {
        ...updateData,
        totalValue: data.taxValue + data.liquidValue,
        payableStatus: PayableStatus.APPROVING,
      });

      await this.categorizationService.update(
        id,
        RelationType.PAYABLE,
        data.categorization,
      );
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        console.error("Duplicate entry error:", error);
        throw new UpdatingPayableError();
      }
      console.error("Error updating payable:", error);
      throw new UpdatingPayableError();
    }

    await this.manageUpdateApprovals(id, data);
  }

  async updateCategory(id: number, data: UpdateCategorizationDTO) {
    try {
      await this.categorizationService.update(id, RelationType.PAYABLE, data);
    } catch (error) {
      console.error(error);
      throw new UpdatingPayableCategoryError();
    }
  }

  async updateAditivePayables(
    payable: Payables,
    data: UpdatePayableDTO & { lastAditiveId: number },
  ): Promise<void> {
    await this.validator.UpdateRequest(data.identifierCode, payable.id);

    try {
      await this.payablesRepository._update(payable.id, {
        ...data,
        payableStatus: PayableStatus.APPROVED,
      });
      await this.installmentsService.addNewInstallmentsPayables(
        payable,
        data.taxValue + data.liquidValue,
      );
    } catch (error) {
      console.error(error);
      throw new UpdatingPayableError();
    }
  }

  async updateStatus(payableStatus: PayableStatus, id: number): Promise<void> {
    try {
      await this.payablesRepository._update(id, { payableStatus });
    } catch (error) {
      console.error(error);
      throw new UpdatingPayableError();
    }
  }

  async updateManyInstallmentsDate(
    id: number,
    data: UpdateInstallmentDTO[],
  ): Promise<void> {
    await this.installmentsService.updateManyInstallmentsDate(data);

    try {
      const payable = await this.payablesRepository._findById(id);
      const greaterDTODate = this.getGreatestDate(
        data.map((date) => date.dueDate),
      );
      const greaterDate = payable.recurrent
        ? payable.recurenceData.endDate
        : payable.dueDate;
      let updateFields = {};
      if (
        this.validator.IsDateGreaterThanEndDate(id, greaterDTODate, greaterDate)
      ) {
        updateFields = payable.recurrent
          ? {
              recurenceData: {
                ...payable.recurenceData,
                endDate: greaterDTODate,
              },
            }
          : { dueDate: greaterDTODate };
      }
      const { generalLiquidValue, generalTaxValue } =
        await this.recalculateTotals(payable.installments, data);
      await this.payablesRepository._update(id, {
        ...updateFields,
        liquidValue: generalLiquidValue,
        taxValue: generalTaxValue,
      });
    } catch (error) {
      console.error(error);
      throw new UpdatingPayableError();
    }
  }

  async delete(id: number): Promise<void> {
    await this.validator.DeleteRequest(id);
    try {
      const isCreditCard = await this.validator.IsCreditCard(id)
      if (isCreditCard) {
        await this.cardMovimentationService.markAsUnprocessed(id);
      }
      await this.payablesRepository._delete(id);
    } catch (error) {
      throw new DeletingPayableError();
    }
  }

  async findOneByIdForApproval(
    id: number,
    data: ApprovalCredentialsDTO,
  ): Promise<Payables> {
    await this.approvalService.checkCredentials(data);

    let payload;
    try {
      payload = await this.payablesRepository._findById(id);
    } catch (error) {
      console.error(error);
      throw new FetchingPayableByIdError();
    }
    if (!payload) {
      throw new PayableNotFoundError();
    }
    return payload;
  }

  async findOneById(id: number): Promise<Payables> {
    let payload: Payables | undefined;
    let filteredContractsSupplier: Contracts[];
    let filteredContractsCollaborator: Contracts[];

    try {
      payload = await this.payablesRepository._findById(id);
      filteredContractsCollaborator = filterContracts(
        payload.collaborator?.contracts,
      );
      filteredContractsSupplier = filterContracts(
        payload.supplier?.contracts,
        payload.contractId,
      );
    } catch (error) {
      console.error(error);
      throw new FetchingPayableByIdError();
    }
    if (!payload) {
      throw new PayableNotFoundError();
    }
    return {
      ...payload,
      collaborator: {
        ...payload.collaborator,
        contracts: filteredContractsCollaborator,
      },
      supplier: {
        ...payload.supplier,
        contracts: filteredContractsSupplier,
      },
    };
  }

  async findInstallmentsByPayableId(
    id: number,
  ): Promise<Pick<Installments, "id" | "dueDate" | "status" | "value">[]> {
    return this.installmentsService.findByPayableId(id);
  }

  async findAll(
    params: PayablePaginateParams,
  ): Promise<Pagination<Payables, IPaginationMeta>> {
    try {
      return await this.payablesRepository._findAll(params);
    } catch (error) {
      console.error(error);
      throw new FetchingPayableError();
    }
  }

  async findAllForApprovlas(
    params: ApprovalsParamsDTO,
  ): Promise<Pagination<Payables, IPaginationMeta>> {
    try {
      const { user } = await this.userService.findOne(params.userId);
      
      if (user.collaboratorId) {
        return await this.payablesRepository._findAllForCollaboratorApprovals(params, user.collaboratorId);
      } else if (user.massApprovalPermission) {
        return await this.payablesRepository._findAllForMassApproval(params);
      } else {
        return await this.payablesRepository._findAllForApprovals(params);
      }
    } catch (error) {
      console.error(error);
      throw new FetchingPayableError();
    }
  }

  async approvePayable(id: number): Promise<void> {
    await this.payablesRepository._existsById(id);

    const maxRetries = 5;
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < maxRetries) {
      try {
        await this.payablesRepository._update(id, {
          payableStatus: PayableStatus.APPROVED,
        });
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const payable = await this.payablesRepository._findById(id);

        if (payable.payableStatus === PayableStatus.APPROVED) {
          await this.sendEmailsApproved([payable]);
          await this.installmentsService.generateInstallmentsPayables(payable, Tables.PAYABLES);
          return;
        }
        
        throw new Error(`Status verification failed: ${payable.payableStatus}`);
      } catch (error) {
        retryCount++;
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
        }
      }
    }

    throw new ApprovePayableError();
  }

  async approveManyPayable(
    ids: number[],
    fullyApproveds: number[],
    userId: number,
  ): Promise<void> {
    try {
      const payables = await this.payablesRepository._findRawByIds(ids);
      if (fullyApproveds.length > 0) {
        const fullyApprovedPayables = payables.filter((p) =>
          fullyApproveds.includes(p.id),
        );
        await this.payablesRepository._updateManyStatus(fullyApproveds, {
          payableStatus: PayableStatus.APPROVED,
        });
        await Promise.all(
          fullyApprovedPayables.map(
            async (p) =>
              await this.installmentsService.generateInstallmentsPayables(
                p,
                Tables.PAYABLES,
              ),
          ),
        );
        this.sendEmailsApproved(fullyApprovedPayables);
      }

      this.sendEmailApprovedForMassApprover(payables, userId);
    } catch (error) {
      console.error(error);
      throw new ApprovePayableError();
    }
  }

  async rejectPayable(id: number, comment: string): Promise<void> {
    await this.payablesRepository._existsById(id);

    try {
      await this.payablesRepository._update(id, {
        payableStatus: PayableStatus.REJECTED,
      });
      const payable = await this.payablesRepository._findById(id);
      await this.sendEmailsReproved([payable], comment);
    } catch (error) {
      throw new ApprovePayableError();
    }
  }

  async rejectManyPayable(
    ids: number[],
    comment = "",
    userId: number,
  ): Promise<void> {
    try {
      await this.payablesRepository._updateManyStatus(ids, {
        payableStatus: PayableStatus.REJECTED,
      });
      const payables = await this.payablesRepository._findRawByIds(ids);
      this.sendEmailsReproved(payables, comment);
      this.sendEmailReprovedForMassApprover(payables, comment, userId);
    } catch (error) {
      console.error(error);
      throw new ApprovePayableError();
    }
  }

  async findAllInCsv(params: PayablePaginateParams) {
    const items = await this.payablesRepository._findAndSelectAllForCSV(params);

    const data = formatPayableToCsv(items);

    if (!data?.length) {
      throw new NoPayablesException();
    }

    const { csvData } = generateCsv(data);

    return {
      csvData,
    };
  }

  @OnEvent(CHECKEVENT.CHECK_PAYABLE)
  async checkToFinish({
    itemId,
    installmentId,
  }: {
    itemId: number;
    installmentId: number;
  }) {
    try {
      const hasPending = await this.installmentsService.hasPendingInstallments(
        itemId,
        null,
        installmentId,
      );
      if (!hasPending) {
        await this.payablesRepository._update(itemId, {
          payableStatus: PayableStatus.PAID,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  async markManyAsOverdue(ids: number[]): Promise<void> {
    try {
      const affected = await this.payablesRepository._markManyAsOverdue(ids);
      this.logger.log(
        `Parcelas vencidas atualizadas com sucesso. ${affected} linhas afetadas.`,
      );
    } catch (error) {
      this.logger.log("Erro ao atualizar parcelas vencidas.", error);
    }
  }

  private async recalculateTotals(
    oldInstallments: Installments[],
    newInstallments: UpdateInstallmentDTO[],
  ) {
    const paidInstallments = oldInstallments.filter(
      (installment) => installment.status === InstallmentStatus.PAID,
    );

    const calculateTotals = (
      installments: Installments[] | UpdateInstallmentDTO[],
    ) => {
      let liquidValue = 0;
      let taxValue = 0;

      for (const installment of installments) {
        if (installment.type === InstallmentType.LIQUID) {
          liquidValue += installment.value ?? 0;
        } else if (installment.type === InstallmentType.TAX) {
          taxValue += installment.value ?? 0;
        }
      }

      return { liquidValue, taxValue };
    };

    const paidTotals = calculateTotals(paidInstallments);
    const newTotals = calculateTotals(newInstallments);

    const generalLiquidValue = Math.round(
      paidTotals.liquidValue + newTotals.liquidValue,
    );
    const generalTaxValue = Math.round(
      paidTotals.taxValue + newTotals.taxValue,
    );

    return {
      generalLiquidValue,
      generalTaxValue,
    };
  }

  @OnEvent(RESTOREEVENT.RESTORE_PAYABLE_STATUS)
  private async restoreStatus({
    itemId,
    isOverdue,
  }: {
    itemId: number;
    isOverdue: boolean;
  }) {
    try {
      await this.payablesRepository._update(itemId, {
        payableStatus: isOverdue ? PayableStatus.DUE : PayableStatus.APPROVED,
      });
    } catch (error) {
      console.error(error);
    }
  }

  private async manageUpdateApprovals(
    id: number,
    data: UpdatePayableDTO,
  ): Promise<void> {
    let approvers: number[];
    if (data.approvers) {
      approvers = data.approvers;
    } else {
      this.approvalService.getApprovers(id);
    }
    await this.approvalService.deleteAllApprovations(id);
    await this.approvalService.generateApprovals(
      new GenerateApprovalsDTO(approvers, id, data.identifierCode),
    );
  }

  private async sendEmailsApproved(payables: Payables[]) {
    const payableIds = payables.map(p => p.id);
    const approvals = await this.approvalsRepository._findByPayableIds(payableIds);
    
    const approvalsByPayable = new Map<number, Approvals[]>();
    approvals.forEach(approval => {
      if (!approvalsByPayable.has(approval.payableId)) {
        approvalsByPayable.set(approval.payableId, []);
      }
      approvalsByPayable.get(approval.payableId).push(approval);
    });

    await Promise.all(
      payables.map(async (payable) => {
        const payableApprovals = approvalsByPayable.get(payable.id) || [];
        
        await Promise.all(
          payableApprovals.map(async (approval) => {
            if (approval.collaboratorId) {
              const { collaborator } = await this.collaboratorsService.findOne(approval.collaboratorId);
              if (collaborator && collaborator.email) {
                await sendEmailApprovedNotification({
                  email: collaborator.email,
                  identifierCode: payable.identifierCode,
                });
              }
            }
          })
        );
      }),
    );
  }

  private async sendEmailApprovedForMassApprover(payables: Payables[], userId) {
    const { user } = await this.userService.findOne(userId);

    if (user) {
      await sendEmailApprovedManyNotification({
        email: user.email,
        identifierCodes: payables.map((p) => p.identifierCode),
      });
    } else {
      console.error(`User not found, User ID: ${userId}`);
    }
  }

  private async sendEmailsReproved(payables: Payables[], comment: string) {
    const uniqueUserIds = new Set(
      payables.map((p) => p.updatedById ?? p.createdById),
    );
    const users = await this.userService.findManyById(
      Array.from(uniqueUserIds),
    );

    const userMap = new Map(users.map((user) => [user.id, user]));

    await Promise.all(
      payables.map(async (payable) => {
        const userId = payable.updatedById ?? payable.createdById;
        const user = userMap.get(userId);

        if (user) {
          await SendEmailRejectedNotification({
            email: user.email,
            identifierCode: payable.identifierCode,
            comment,
          });
        } else {
          console.error(
            `User not found for payable ID: ${payable.id}, User ID: ${userId}`,
          );
        }
      }),
    );
  }

  private async sendEmailReprovedForMassApprover(
    payables: Payables[],
    comment: string,
    userId: number,
  ) {
    const { user } = await this.userService.findOne(userId);

    if (user) {
      await SendEmailRejectedManyNotification({
        email: user.email,
        identifierCodes: payables.map((p) => p.identifierCode),
        comment,
      });
    } else {
      console.error(`User not found, User ID: ${userId}`);
    }
  }

  private getGreatestDate(data: Date[]) {
    return data.sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    )[0];
  }
}
