/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, Logger } from "@nestjs/common";
import { IPaginationMeta, Pagination } from "nestjs-typeorm-paginate";
import { formatReceivableToCsv } from "src/common/mappers/csv/format-receivables-for-csv";
import { generateCsv } from "src/common/utils/lib/generate-csv";
import { Tables } from "src/modules/files/enums";
import { Installments } from "src/modules/installments/entities/installments.entity";
import { CreatePartialReceivableDTO } from "../dto/createPartialReceivable.dto";
import { CreateReceivableDTO } from "../dto/createReceivable.dto";
import { ReceivablesPaginateParams } from "../dto/receivablePaginateParams.dto";
import { UpdateReceivableDTO } from "../dto/updateReceivable.dto";
import { Receivables } from "../entities/receivables.entity";
import { ReceivableStatus, ReceivableType } from "../enums";
import {
  CreatingReceivableError,
  DeletingReceivableError,
  FetchingReceivableByIdError,
  FetchingReceivableError,
  NoReceivablesException,
  ReceivableNotFoundError,
  UpdatingReceivableCategoryError,
  UpdatingReceivableError,
} from "../errors";
import { ReceivablesRepository } from "../repositories/receivables-repository";
import { ReceivableValidator } from "../validators/ReceivableValidator";
import { InstallmentsService } from "./../../installments/installments.service";
import { OnEvent } from "@nestjs/event-emitter";
import { CHECKEVENT, RESTOREEVENT } from "src/common/enums/EventsEnums";
import { UpdateInstallmentDTO } from "src/modules/installments/dto/updateInstallment.dto";
import { filterContracts } from "src/common/utils/filterContracts";
import { Contracts } from "src/modules/contracts/entities/contracts.entity";
import { CategorizationService } from "src/modules/categorization/categorization.service";
import { RelationType } from "src/modules/categorization/enums";
import { UpdateCategorizationDTO } from "src/modules/categorization/dto/updateCategorization.dto";
import { isNotEmptyObject } from "class-validator";

@Injectable()
export class ReceivablesService {
  constructor(
    private receivablesRepository: ReceivablesRepository,
    private installmentsService: InstallmentsService,
    private categorizationService: CategorizationService,
    private validator: ReceivableValidator,
  ) {}

  private readonly logger = new Logger(ReceivablesService.name);

  async create(data: CreateReceivableDTO | Receivables): Promise<Receivables> {
    await this.validator.Duplicate(data.identifierCode, data.financierId);
    try {
      const { categorization, ...createData } = data;
      const newReceivable =
        await this.receivablesRepository._create(createData);
      await this.installmentsService.generateInstallmentsReceivables(
        newReceivable,
        Tables.RECEIVABLES,
      );

      if (categorization) {
        await this.categorizationService.create(
          categorization,
          RelationType.RECEIVABLE,
          newReceivable.id,
        );
      }

      return newReceivable;
    } catch (error) {
      throw new CreatingReceivableError();
    }
  }

  async markManyAsOverdue(ids: number[]) {
    try {
      const { affected } =
        await this.receivablesRepository._markManyAsOverdue(ids);
      this.logger.log(
        `Status dos pagamentos vencidos atualizados com sucesso. ${affected} linhas afetadas.`,
      );
    } catch (error) {
      this.logger.log(
        "Erro ao atualizar status dos pagamentos vencidos.",
        error,
      );
    }
  }

  async createReceivableResidualPayment(
    receivable: Receivables,
    type: "Distrato" | "Termo",
    value: number,
  ) {
    try {
      await this.receivablesRepository._create({
        ...receivable,
        id: undefined,
        receivableType:
          type === "Distrato" ? ReceivableType.DISTRATO : ReceivableType.TERMO,
        totalValue: value,
        receivableStatus: ReceivableStatus.PENDING,
        identifierCode: null,
        recurrent: false,
        recurenceData: {
          startDate: null,
          endDate: null,
          recurrenceType: null,
          dueDay: null,
        },
        updatedAt: undefined,
        createdAt: undefined,
        dueDate: null,
        installments: null,
      } as Receivables);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createPartialReceivable(data: CreatePartialReceivableDTO) {
    try {
      await this.receivablesRepository._create(data);
    } catch (error) {
      console.error(error);
      throw new CreatingReceivableError();
    }
  }

  async update(id: number, data: UpdateReceivableDTO): Promise<void> {
    await this.validator.UpdateRequest(id, data.identifierCode);

    try {
      const { categorization, ...updateData } = data;
      await this.receivablesRepository._update(id, {
        ...updateData,
        receivableStatus: ReceivableStatus.APPROVED,
      });
      if (categorization) {
        await this.categorizationService.update(
          id,
          RelationType.RECEIVABLE,
          categorization,
        );
      } else {
        await this.categorizationService.deleteByRelation(
          id,
          RelationType.RECEIVABLE,
        );
      }
      await this.installmentsService.generateInstallmentsReceivables(
        { ...updateData, id } as Receivables,
        Tables.RECEIVABLES,
        id,
      );
    } catch (error) {
      console.error(error);
      throw new UpdatingReceivableError();
    }
  }

  async updateCategory(
    id: number,
    data: UpdateCategorizationDTO,
  ): Promise<void> {
    try {
      if (isNotEmptyObject(data)) {
        await this.categorizationService.update(
          id,
          RelationType.RECEIVABLE,
          data,
        );
      } else {
        await this.categorizationService.deleteByRelation(
          id,
          RelationType.RECEIVABLE,
        );
      }
    } catch (error) {
      console.error(error);
      throw new UpdatingReceivableCategoryError();
    }
  }

  async updateAditiveReceivables(
    receivable: Receivables,
    data: UpdateReceivableDTO & { lastAditiveId: number },
  ): Promise<void> {
    await this.validator.UpdateRequest(receivable.id, data.identifierCode);

    try {
      const { categorization, ...updateData } = data;
      await this.receivablesRepository._update(receivable.id, {
        ...updateData,
        receivableStatus: ReceivableStatus.APPROVED,
      });
      await this.categorizationService.update(
        receivable.id,
        RelationType.RECEIVABLE,
        categorization,
      );
      await this.installmentsService.addNewInstallmentsReceivables(
        receivable,
        data.totalValue,
      );
    } catch (error) {
      console.error(error);
      throw new UpdatingReceivableError();
    }
  }

  async updateStatus(
    receivableStatus: ReceivableStatus,
    id: number,
  ): Promise<void> {
    try {
      await this.receivablesRepository._update(id, { receivableStatus });
    } catch (error) {
      console.error(error);
      throw new UpdatingReceivableError();
    }
  }

  async updateManyInstallmentsDate(
    id: number,
    data: UpdateInstallmentDTO[],
  ): Promise<void> {
    await this.installmentsService.updateManyInstallmentsDate(data);

    const receivable = await this.receivablesRepository._findById(id);
    const greaterDTODate = this.getGreatestDate(
      data.map((date) => date.dueDate),
    );
    const greaterDate = receivable.recurrent
      ? receivable.recurenceData.endDate
      : receivable.dueDate;

    if (
      this.validator.IsDateGreaterThanEndDate(id, greaterDTODate, greaterDate)
    ) {
      const updateFields = receivable.recurrent
        ? {
            recurenceData: {
              ...receivable.recurenceData,
              endDate: greaterDTODate,
            },
          }
        : { dueDate: greaterDTODate };

      this.receivablesRepository._update(id, updateFields);
    }
  }

  async delete(id: number): Promise<void> {
    await this.validator.DeleteRequest(id);

    try {
      await this.receivablesRepository._delete(id);
    } catch (error) {
      throw new DeletingReceivableError();
    }
  }

  async findOneById(id: number): Promise<Receivables> {
    let payload: Receivables | undefined;
    let filteredContractsFinancier: Contracts[];

    try {
      payload = await this.receivablesRepository._findById(id);
      filteredContractsFinancier = filterContracts(
        payload.financier?.contracts,
        payload.contractId,
      );
    } catch (error) {
      console.error(error);
      throw new FetchingReceivableByIdError();
    }
    if (!payload) {
      throw new ReceivableNotFoundError();
    }
    return {
      ...payload,
      financier: {
        ...payload.financier,
        contracts: filteredContractsFinancier,
      },
    };
  }

  async findInstallmentsByReceivableId(
    id: number,
  ): Promise<Pick<Installments, "id" | "dueDate" | "status" | "value">[]> {
    return await this.installmentsService.findByReceivableId(id);
  }

  async findAll(
    params: ReceivablesPaginateParams,
  ): Promise<Pagination<Receivables, IPaginationMeta>> {
    try {
      return await this.receivablesRepository._findAll(params);
    } catch (error) {
      throw new FetchingReceivableError();
    }
  }

  async findAllInCsv(params: ReceivablesPaginateParams) {
    const items =
      await this.receivablesRepository._findAndSelectAllForCSV(params);

    const data = formatReceivableToCsv(items);

    if (!data?.length) {
      throw new NoReceivablesException();
    }

    const { csvData } = generateCsv(data);

    return {
      csvData,
    };
  }

  @OnEvent(CHECKEVENT.CHECK_RECEIVABLE)
  async checkToFinish({
    itemId,
    installmentId,
  }: {
    itemId: number;
    installmentId: number;
  }) {
    try {
      const hasPending = await this.installmentsService.hasPendingInstallments(
        null,
        itemId,
        installmentId,
      );
      if (!hasPending) {
        await this.receivablesRepository._update(itemId, {
          receivableStatus: ReceivableStatus.RECEIVED,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  @OnEvent(RESTOREEVENT.RESTORE_RECEIVABLE_STATUS)
  private async restoreStatus({
    itemId,
    isOverdue,
  }: {
    itemId: number;
    isOverdue: boolean;
  }) {
    try {
      await this.receivablesRepository._update(itemId, {
        receivableStatus: isOverdue
          ? ReceivableStatus.DUE
          : ReceivableStatus.APPROVED,
      });
    } catch (error) {
      console.error(error);
    }
  }

  private getGreatestDate(data: Date[]) {
    return data.sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    )[0];
  }
}
