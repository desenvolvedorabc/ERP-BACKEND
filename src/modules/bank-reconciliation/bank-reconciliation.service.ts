import {
  BadGatewayException,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { BankReconciliationRepository } from "./repositories/bank-reconciliation-repository";
import {
  NotFoundBankReconciliation,
  FindBankReconciliationError,
  CreatingBankReconciliationError,
  DeletingBankReconciliationError,
  InvalidDateBetweenRecordsError,
} from "./errors";
import {
  BankReconciliationResponse,
  TransactionRecord,
} from "./dtos/bank-reconciliation-response.dto";
import { ApiBradescoService } from "../apiBradesco/apiBradesco.service";
import { StatementResponseDTO } from "../apiBradesco/dtos/statementResponse.dto";
import { BankRecordAPIRepository } from "./repositories/bank-record-api-repository";
import { CreateBankRecordApiDTO } from "./dtos/bank-record-api.dto";
import { CreateBankReconciliationDTO } from "./dtos/bank-reconciliation.dto";
import { BankReconciliation } from "./entities/bank-reconciliation.entity";
import { balanceParamsDTO } from "../apiBradesco/dtos/balanceParams.dto";
import { statementParamsDTO } from "../apiBradesco/dtos/statementParams.dto";
import { FindByAccountIdResult } from "./interfaces/bank-reconciliation.interface";
import { AccountsService } from "../accounts/services/accounts.service";
import { UpdateBalanceDTO } from "../accounts/dtos/updateBalance.dto";
import { CreateReconciliationResponseDTO } from "./dtos/create-reconciliation-response.dto";
import { InstallmentsService } from "../installments/installments.service";
import { BankRecordApi } from "./entities/bank-record-api.entity";
import { formatDateBradesco } from "src/common/utils/formats";
import { DueBetweenDTO } from "src/common/DTOs/dueBetween.dto";
import { BankReconciliationType } from "./enums";
import { LancamentoDTO } from "../apiBradesco/dtos/statementDTOComponents/lancamento.dto";
import { format, isBefore, startOfDay } from "date-fns";
import { LancamentoMensalDTO } from "../apiBradesco/dtos/statementDTOComponents/extratoLancamentoMensal.dto";
import { parseMonetaryToNumber } from "src/common/utils/parseMonetaryToNumber";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Installments } from "../installments/entities/installments.entity";
import { CHECKEVENT, RESTOREEVENT } from "src/common/enums/EventsEnums";
import { ReceivableStatus } from "../receivables/enums";
import { PayableStatus } from "../payables/enums";
import { CategorizationService } from "src/modules/categorization/categorization.service";
import { RelationType } from "src/modules/categorization/enums";

@Injectable()
export class BankReconciliationService {
  constructor(
    private bankReconciliationRepo: BankReconciliationRepository,
    private bankRecordAPIRepository: BankRecordAPIRepository,
    private categorizationService: CategorizationService,
    private apiBradesco: ApiBradescoService,
    private accountsService: AccountsService,
    private installmentsService: InstallmentsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findOne(
    id: number,
    period: DueBetweenDTO,
  ): Promise<BankReconciliationResponse> {
    try {
      const accountWithBankReconciliation =
        await this.bankReconciliationRepo._findByAccountId(id);
      if (!accountWithBankReconciliation)
        throw new NotFoundBankReconciliation();

      const recordsApiBradesco = await this.getStatement({
        agencia: accountWithBankReconciliation.agency.split("-")[0],
        conta: accountWithBankReconciliation.account,
        dataInicio: format(period.start, "ddMMyyyy"),
        dataFim: format(period.end, "ddMMyyyy"),
        tipo: "cc",
      });

      const transactions = this.mapTransactionsExtract(
        recordsApiBradesco,
        accountWithBankReconciliation.bankReconciliations,
      );

      let futureTransactions: ReturnType<typeof this.mapRecordAPI> | null =
        null;

      if (
        recordsApiBradesco.extratoLancamentosFuturos?.listaLancamentosFuturos
      ) {
        futureTransactions = this.mapRecordAPI(
          recordsApiBradesco.extratoLancamentosFuturos.listaLancamentosFuturos,
        );
      }

      return this.buildResponse(
        accountWithBankReconciliation,
        transactions,
        futureTransactions,
      );
    } catch (error) {
      console.error(error);
      if (error instanceof BadGatewayException) {
        throw error;
      }
      throw new FindBankReconciliationError();
    }
  }

  async createConciliation(
    dataRecordAPI: CreateBankRecordApiDTO,
    dataReconciliation: CreateBankReconciliationDTO,
  ) {
    this.validateRequiredCategorization(dataRecordAPI, dataReconciliation);
    let recordSystem: Installments | null = null;
    try {
      if (
        dataReconciliation.type === BankReconciliationType.TRANSACTION_ENTRY
      ) {
        recordSystem = await this.installmentsService.findById(
          dataReconciliation.recordSystemId,
        );
      }
      const { categorization, ...recordAPi } = dataRecordAPI;
      const newBankRecord =
        await this.bankRecordAPIRepository._create(recordAPi);
      dataReconciliation.recordApiId = newBankRecord.id;

      await this.categorizationService.create(
        categorization,
        RelationType.APPOINTMENT,
        newBankRecord.id,
      );

      const newReconciliation =
        await this.bankReconciliationRepo._create(dataReconciliation);

      const newBalance = await this.updateAccountBalance(
        dataReconciliation.accountId,
        dataRecordAPI.transactionAmount,
      );

      await this.updateInstallmentStatus(
        "paid",
        dataReconciliation.recordSystemId,
      );

      const systemObject = this.buildSystemObject(
        newBankRecord,
        newReconciliation,
      );
      return new CreateReconciliationResponseDTO(systemObject, newBalance);
    } catch (error) {
      console.error(error);
      if (error instanceof InvalidDateBetweenRecordsError) {
        throw error;
      }
      throw new CreatingBankReconciliationError();
    } finally {
      if (recordSystem) {
        const event = recordSystem.payableId
          ? CHECKEVENT.CHECK_PAYABLE
          : CHECKEVENT.CHECK_RECEIVABLE;
        const itemId = recordSystem.payableId ?? recordSystem.receivableId;
        await this.eventEmitter.emit(event, {
          itemId,
          installmentId: recordSystem.id,
        } as { itemId: number; installmentId: number });
      }
    }
  }

  async deleteConciliation(id: number) {
    try {
      const exists = await this.bankReconciliationRepo._findById(id);
      if (!exists) throw new NotFoundBankReconciliation();

      await this.bankReconciliationRepo._delete(exists);

      const newBalance = await this.updateAccountBalance(
        exists.accountId,
        exists.recordApi.transactionAmount * -1,
      );

      await this.updateInstallmentStatus("pending", exists.recordSystemId);
      const { recordSystem } = exists;

      this.emmitRestoreStatusEvent(recordSystem);
      return { newBalance };
    } catch (error) {
      console.error(error);
      throw new DeletingBankReconciliationError();
    }
  }

  private async emmitRestoreStatusEvent(recordSystem: Installments) {
    try {
      if (recordSystem) {
        const payable = recordSystem.payable;
        const receivable = recordSystem.receivable;
        let event: string = "";
        let itemId: number = -1;
        if (payable && payable.payableStatus === PayableStatus.PAID) {
          event = RESTOREEVENT.RESTORE_PAYABLE_STATUS;
          itemId = payable.id;
        } else if (
          receivable &&
          receivable.receivableStatus === ReceivableStatus.RECEIVED
        ) {
          event = RESTOREEVENT.RESTORE_RECEIVABLE_STATUS;
          itemId = receivable.id;
        }
        const sysD = startOfDay(recordSystem.dueDate);
        const now = startOfDay(new Date());
        const isOverdue = isBefore(sysD, now);
        await this.eventEmitter.emit(event, {
          itemId,
          isOverdue,
        } as {
          itemId: number;
          isOverdue: boolean;
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  private async updateAccountBalance(accountId: number, amount: number) {
    return await this.accountsService.updateBalance(
      accountId,
      new UpdateBalanceDTO(amount),
    );
  }

  private async updateInstallmentStatus(
    status: "paid" | "pending",
    recordSystemId?: number,
  ) {
    if (recordSystemId) {
      if (status === "paid") {
        await this.installmentsService.markAsPaid(recordSystemId);
      } else {
        await this.installmentsService.markAsPending(recordSystemId);
      }
    }
  }

  private async getBalance(paramsBradesco: balanceParamsDTO): Promise<{
    balance: number;
  }> {
    const balance = await this.apiBradesco.getBalance(paramsBradesco);
    return balance;
  }

  private async getStatement(
    paramsStatementBradesco: statementParamsDTO,
  ): Promise<StatementResponseDTO> {
    try {
      const recordsApiBradesco = await this.apiBradesco.getStatement(
        paramsStatementBradesco,
      );
      return recordsApiBradesco;
    } catch (error) {
      console.error(error);
    }
  }

  private buildSystemObject(
    bankRecord: BankRecordApi,
    reconciliation: BankReconciliation,
  ): TransactionRecord {
    return {
      id: reconciliation.id,
      documentNumber: bankRecord.documentNumber,
      date: bankRecord.transactionDate,
      amount: bankRecord.transactionAmount,
      title: bankRecord.documentNumber,
      description: bankRecord.fullTransactionDescription,
    };
  }

  private validateRequiredCategorization(
    dataRecordAPI: CreateBankRecordApiDTO,
    dataReconciliation: CreateBankReconciliationDTO,
  ) {
    if (
      dataReconciliation.type === BankReconciliationType.TAX ||
      dataReconciliation.type === BankReconciliationType.PROFIT
    ) {
      if (!dataRecordAPI.categorization) {
        throw new HttpException(
          "Categorization is a required field",
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  private mapTransactionsExtract(
    recordsApiBradesco: StatementResponseDTO,
    bankReconciliations: FindByAccountIdResult["bankReconciliations"],
  ): BankReconciliationResponse["transactions"] {
    const bradescoData =
      recordsApiBradesco.extratoPorPeriodo?.lstLancamentoMensal;

    const bradescoTransactions = bradescoData?.length
      ? bradescoData.slice(1)
      : [];

    const recordsApi = this.mapRecordAPI(bradescoTransactions);

    if (recordsApi.length === 0) return [];

    const transactions: BankReconciliationResponse["transactions"] = [];
    // merge recordsApi with bankReconciliations
    for (const recordApi of recordsApi) {
      const reconcilied = bankReconciliations.some((br) => {
        if (br.recordApi?.documentNumber === recordApi.documentNumber) {
          let transaction: any;

          switch (br.type) {
            case BankReconciliationType.TRANSACTION_ENTRY:
              transaction = {
                reconciled: true,
                extract: recordApi,
                type: br.type,
                system: {
                  id: br.recordSystem.id,
                  documentNumber: br.recordSystem.identification,
                  date: br.recordSystem.dueDate,
                  amount: br.recordSystem.value,
                  title: br.recordSystem.identification,
                  description: br.recordSystem.aditionalDescription,
                },
              };
              break;
            case BankReconciliationType.TRANSFER:
              transaction = {
                system: {
                  id: br.id,
                },
                reconciled: true,
                extract: recordApi,
                type: br.type,
                transferedById: br.transferedById,
              };
              break;
            case BankReconciliationType.TAX:
              transaction = {
                reconciled: true,
                extract: recordApi,
                type: br.type,
                system: {
                  id: br.id,
                  documentNumber: br.recordApi.documentNumber,
                  date: br.recordApi.transactionDate,
                  amount: br.recordApi.transactionAmount,
                  title: br.recordApi.documentNumber,
                  description: br.recordApi.fullTransactionDescription,
                },
              };
              break;
            case BankReconciliationType.PROFIT:
              transaction = {
                reconciled: true,
                extract: recordApi,
                type: br.type,
                system: {
                  id: br.id,
                  documentNumber: br.recordApi.documentNumber,
                  date: br.recordApi.transactionDate,
                  amount: br.recordApi.transactionAmount,
                  title: br.recordApi.documentNumber,
                  description: br.recordApi.fullTransactionDescription,
                },
              };
              break;
            default:
              throw new Error("Invalid reconciliation type");
          }

          transactions.push(transaction);
          return true;
        }
        return false;
      });

      if (!reconcilied) {
        transactions.push({
          reconciled: false,
          extract: recordApi,
          type: BankReconciliationType.TRANSACTION_ENTRY,
        });
      }
    }

    return transactions;
  }

  private mapRecordAPI(value: LancamentoMensalDTO[] | LancamentoDTO[]) {
    if (!value) return [];
    return value.map((lancamento) => ({
      documentNumber: lancamento.numeroDocumento,
      date: lancamento.dataLancamento,
      amount: this.parseFloatWithSignal(
        lancamento.valorLancamento,
        lancamento.sinalLancamento,
      ),
      title: lancamento.descritivoLancamentoAbreviado,
      description: lancamento.descritivoLancamentoCompleto,
      beneficiary: lancamento.segundaLinhalLancamento,
    }));
  }

  private buildResponse(
    accountWithBankReconciliation: FindByAccountIdResult,
    transactions: BankReconciliationResponse["transactions"],
    futureTransactions: BankReconciliationResponse["futureTransactions"],
  ): BankReconciliationResponse {
    return {
      accountInfo: {
        name: accountWithBankReconciliation.name,
        agency: accountWithBankReconciliation.agency,
        account: accountWithBankReconciliation.account,
        balance: accountWithBankReconciliation.balance,
        balanceSystem: accountWithBankReconciliation.systemBalance,
        updatedAt: accountWithBankReconciliation.updatedAt,
      },
      transactions,
      futureTransactions,
    };
  }

  private parseFloatWithSignal(value: string, signal: string = "+") {
    return parseMonetaryToNumber(value) * (signal === "+" ? 1 : -1);
  }
}
