import { Logger, Injectable } from "@nestjs/common";
/*
https://docs.nestjs.com/providers#services
*/

import { Cron, CronExpression } from "@nestjs/schedule";
import { format, isBefore, isSameDay } from "date-fns";
import { ActionTypes } from "../../history/enums";
import { HistoryService } from "../../history/history.service";
import { InstallmentsService } from "../../installments/installments.service";
import { DebtorType, PayableStatus, PaymentType } from "../../payables/enums";
import { PayableService } from "../../payables/services/payable.service";
import { ReceivableStatus, ReceivableType } from "../../receivables/enums";
import { ReceivablesService } from "../../receivables/services/receivables.service";
import { UpdateContractDTO } from "../dto/UpdateContract.dto";
import { UpdateContractBancaryInfo } from "../dto/UpdateContractBancaryInfo";
import { CreateAditiveDTO } from "../dto/createAditive.dto";
import { CreateContractDTO } from "../dto/createContract.dto";
import { ContractPaginateParams } from "../dto/paginateParamsContract.dto";
import { Contracts } from "../entities/contracts.entity";
import { ContractStatus, ContractType } from "../enums";
import {
  ContractNotFoundError,
  CreatingAditiveError,
  CreatingContractError,
  DeletingContractError,
  FetchingContractByIdError,
  FetchingContractError,
  NoContractsException,
  UpdatingContractError,
} from "../errors";
import { ContractsRepository } from "../repositories/contracts-repository";
import { ContractsValidations } from "../validations/ContractsValidation";
import { FormatContractsForCSV } from "src/common/mappers/csv/format-contracts-for-csv";
import { generateCsv } from "src/common/utils/lib/generate-csv";

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);

  constructor(
    private contractsRepository: ContractsRepository,
    private installmentsService: InstallmentsService,
    private receivableService: ReceivablesService,
    private payableService: PayableService,
    private historyService: HistoryService,
    private validate: ContractsValidations,
  ) {}

  async create(data: CreateContractDTO): Promise<number> {
    try {
      const lastCode = await this.findLastContractCode(data.contractType);
      const contractCode = await this.generateCode(lastCode);
      return await this.contractsRepository._create(data, contractCode);
    } catch (error) {
      console.error(error);
      throw new CreatingContractError();
    }
  }

  async createAditive(data: CreateAditiveDTO): Promise<void> {
    await this.validate.CreateAditive(data.parentId);

    try {
      const lastCode = await this.FindLastAditiveCode(data.parentId);
      const aditiveCode = await this.generateCode(lastCode);
      const id = await this.contractsRepository._create(data, aditiveCode);
      this.historyService.createHistory(
        id,
        data.createdById,
        ActionTypes.INSERT,
      );
    } catch (error) {
      console.error(error);
      throw new CreatingAditiveError();
    }
  }

  async update(id: number, data: UpdateContractDTO): Promise<void> {
    await this.validate.UpdateRequest(id);

    try {
      await this.contractsRepository._update(id, data);
      this.createHistoryIfAditive(id, data.updatedBy, ActionTypes.UPDATE);
    } catch (error) {
      console.error(error);
      throw new UpdatingContractError();
    }
  }

  async updateBancaryInfo(
    id: number,
    data: UpdateContractBancaryInfo,
  ): Promise<void> {
    await this.validate.UpdateBancaryInfoRequest(id);
    try {
      await this.contractsRepository._update(id, data);
      this.createHistoryIfAditive(id, data.updatedBy, ActionTypes.UPDATE);
    } catch (error) {
      console.error(error);
      throw new UpdatingContractError();
    }
  }

  async delete(id: number): Promise<void> {
    await this.validate.ExistsAndPending(id);

    try {
      await this.contractsRepository._delete(id);
    } catch (error) {
      console.error(error);
      throw new DeletingContractError();
    }
  }

  async findOneById(id: number): Promise<Contracts> {
    let payload;
    try {
      payload = await this.contractsRepository._findById(id);
    } catch (error) {
      console.error(error);
      throw new FetchingContractByIdError();
    }
    if (!payload) {
      throw new ContractNotFoundError();
    }
    return payload;
  }

  async findPaymentHistory(id: number): Promise<Contracts> {
    let payload;
    try {
      payload = await this.contractsRepository._findPaymentHistory(id);
    } catch (error) {
      console.error(error);
      throw new FetchingContractByIdError();
    }
    if (!payload) {
      throw new ContractNotFoundError();
    }
    return payload;
  }

  async findAll(params: ContractPaginateParams) {
    try {
      return await this.contractsRepository._findAll(params);
    } catch (error) {
      console.error(error);
      throw new FetchingContractError();
    }
  }

  async findCSV(params: ContractPaginateParams) {
    try {
      const items = await this.contractsRepository._findForCSV(params);
      const data = FormatContractsForCSV(items);

      if (!data?.length) {
        throw new NoContractsException();
      }

      const { csvData } = generateCsv(data);

      return {
        csvData,
      };
    } catch (error) {
      console.error(error);
      throw new FetchingContractError();
    }
  }

  async signContract(
    id: number,
    file: Express.Multer.File,
    userId: number,
  ): Promise<void> {
    await this.validate.ExistsAndNotSigned(id);

    try {
      const today = new Date();
      await this.createHistoryIfAditive(id, userId, ActionTypes.SIGN);
      const contract = await this.contractsRepository._findById(id);
      const startsToday =
        isBefore(contract.contractPeriod.start, today) ||
        isSameDay(today, contract.contractPeriod.start);
      await this.contractsRepository._uploadSignedContract(
        id,
        file.filename,
        startsToday ? ContractStatus.ONGOING : ContractStatus.SIGNED,
      );
    } catch (error) {
      console.error(error);
      throw new UpdatingContractError();
    }
  }

  async settleContract(
    id: number,
    file: Express.Multer.File,
    userId: number,
  ): Promise<void> {
    await this.validate.ExistsAndSigned(id);

    try {
      await this.manageContractInstallments(id, "Termo", userId);
      await this.createHistoryIfAditive(id, userId, ActionTypes.SETTLE);
      await this.contractsRepository._uploadSettledTerm(id, file.filename);
    } catch (error) {
      console.error(error);
      throw new UpdatingContractError();
    }
  }

  async withdrawalContract(
    id: number,
    file: Express.Multer.File,
    userId: number,
  ): Promise<void> {
    await this.validate.ExistsAndSigned(id);

    try {
      await this.manageContractInstallments(id, "Distrato", userId);
      await this.createHistoryIfAditive(id, userId, ActionTypes.WITHDRAWAL);
      await this.contractsRepository._uploadWithdrawal(id, file.filename);
    } catch (error) {
      console.error(error);
      throw new UpdatingContractError();
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  private async manageContractsVigency(): Promise<void> {
    await this.finishAllExpiredContracts();
    await this.initContractsVigency();
  }

  private async finishAllExpiredContracts(): Promise<void> {
    try {
      const affected =
        await this.contractsRepository._finishAllExpiredContracts();
      this.logger.log(
        `Contratos expirados finalizados com sucesso. ${affected} linhas afetadas.`,
      );
    } catch (error) {
      this.logger.log("Erro ao finalizar contratos expirados.", error);
    }
  }

  private async initContractsVigency(): Promise<void> {
    try {
      const affected = await this.contractsRepository._initContractsVigency();
      this.logger.log(
        `Contratos foram iniciados com sucesso. ${affected} linhas afetadas.`,
      );
    } catch (error) {
      this.logger.log("Erro ao finalizar contratos expirados.", error);
    }
  }

  private async manageInstallmentsCancelation(
    contract: Contracts,
  ): Promise<void> {
    try {
      switch (contract.contractType) {
        case ContractType.FINANCIER:
          await this.installmentsService.cancelReceivableInstallments(
            contract.receivable[0].id,
          );
          break;
        default:
          await this.installmentsService.cancelPayableInstallments(
            contract.payable[0].id,
          );
          break;
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async manageResidualPayment(
    contract: Contracts,
    type: "Distrato" | "Termo",
    userId,
  ): Promise<void> {
    try {
      switch (contract.contractType) {
        case ContractType.FINANCIER:
          {
            const total =
              await this.installmentsService.findResidualValueReceivable(
                contract.receivable[0].id,
              );
            await this.receivableService.createReceivableResidualPayment(
              contract.receivable[0],
              type,
              total,
            );
            await this.receivableService.updateStatus(
              ReceivableStatus.CONCLUDED,
              contract.receivable[0].id,
            );
          }
          break;
        default:
          {
            const total =
              await this.installmentsService.findResidualValuePayable(
                contract.payable[0].id,
              );

            await this.payableService.createPayableResidualPayment(
              contract.payable[0],
              type,
              userId,
              total,
            );
            await this.payableService.updateStatus(
              PayableStatus.CONCLUDED,
              contract.payable[0].id,
            );
          }
          break;
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async manageContractInstallments(
    id: number,
    type: "Distrato" | "Termo",
    userId,
  ) {
    try {
      const contract = await this.contractsRepository._findFullOne(id);
      if (contract.payable.length === 0 && contract.receivable.length === 0)
        return;
      await this.manageInstallmentsCancelation(contract);
      await this.manageResidualPayment(contract, type, userId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async createHistoryIfAditive(
    id: number,
    userId: number,
    actionType: ActionTypes,
  ): Promise<void> {
    try {
      const isAditive = await this.contractsRepository._isAditive(id);
      if (!isAditive) return;

      if (actionType === ActionTypes.SIGN) {
        await this.recalculateInstallmentsAndBills(id);
      }
      await this.historyService.createHistory(id, userId, actionType);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async recalculateInstallmentsAndBills(
    aditiveId: number,
  ): Promise<void> {
    try {
      const aditive = await this.contractsRepository._findFullOne(aditiveId);
      const parent = await this.contractsRepository._findFullOne(
        aditive.parentId,
      );

      if (parent.receivable.length > 0) {
        await this.receivableService.updateAditiveReceivables(
          parent.receivable[0],
          {
            lastAditiveId: aditiveId,
            totalValue: aditive.totalValue,
          },
        );
      }

      if (parent.payable.length > 0) {
        await this.payableService.updateAditivePayables(parent.payable[0], {
          lastAditiveId: aditiveId,
          totalValue: aditive.totalValue,
          liquidValue: aditive.totalValue,
          taxValue: 0,
        });
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async findLastContractCode(
    contractType: ContractType,
  ): Promise<string | null> {
    const lastCode =
      await this.contractsRepository._findLastContractCode(contractType);
    return lastCode;
  }

  private async FindLastAditiveCode(parentId: number): Promise<string | null> {
    const lastCode =
      await this.contractsRepository._findLastAditiveCode(parentId);
    return lastCode;
  }

  private async generateCode(lastCode: string | null): Promise<string> {
    if (lastCode) {
      const nextCode = Number(lastCode.split("/")[0]) + 1;
      return nextCode.toString().padStart(9, "0") + format(new Date(), "/yyyy");
    } else {
      return "1".padStart(9, "0") + format(new Date(), "/yyyy");
    }
  }

  private async managePartialAccount(
    id: number,
    userId: number,
  ): Promise<void> {
    const contract = await this.contractsRepository._findFullOne(id);
    switch (contract.contractType) {
      case ContractType.FINANCIER:
        await this.createPartialReceivable(contract);
        break;
      default:
        await this.createPartialPayable(contract, userId);
        break;
    }
  }

  private async createPartialReceivable(contract: Contracts): Promise<void> {
    await this.receivableService.createPartialReceivable({
      contractId: contract.id,
      financierId: contract.financierId,
      receivableStatus: ReceivableStatus.PENDING,
      receivableType: ReceivableType.CONTRACT,
      totalValue: contract.totalValue,
    });
  }

  private async createPartialPayable(
    contract: Contracts,
    userId: number,
  ): Promise<void> {
    await this.payableService.createPartialPayable({
      contractId: contract.id,
      collaboratorId: contract.collaboratorId,
      supplierId: contract.supplierId,
      payableStatus: PayableStatus.PENDING,
      paymentType: PaymentType.CONTRACT,
      liquidValue: contract.totalValue,
      taxValue: 0,
      createdById: userId,
      debtorType: contract.supplierId
        ? DebtorType.SUPPLIER
        : DebtorType.COLLABORATOR,
    });
  }
}
