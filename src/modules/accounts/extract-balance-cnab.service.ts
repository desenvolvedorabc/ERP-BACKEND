import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import * as _ from "lodash";
import { RetornoGateway } from "src/common/gateways/cnab/retorno.gateway";
import { TransferFileSftpGateway } from "src/common/gateways/transfer-file-sftp/transfer-file-sftp.gateway";
import { AccountsRepository } from "./repositories/accounts-repository";
import { PayablesRepository } from "src/modules/payables/repositories/payable-repository";
import { PayableStatus } from "src/modules/payables/enums";

@Injectable()
export class ExtractBalanceCnabService {
  constructor(
    private sftpGateway: TransferFileSftpGateway,
    private retorno: RetornoGateway,
    private accountsRepository: AccountsRepository,
    private payablesRepository: PayablesRepository,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  private async updateBalanceUsingCnab(): Promise<void> {
    try {
      const cnabRaw = await this.sftpGateway.retrieveFilesFromVanBradesco();
      const result = this.retorno.extract(cnabRaw);

      for (const lot of result.lots) {
        const accountAgency = `${lot.LoteTrailing.conta_agencia}-${lot.LoteTrailing.agencia_dig_verificador}`;
        const accountNumber = lot.LoteTrailing.conta_num;
        const accountDig = lot.LoteTrailing.conta_dig_verificador;

        const finalBalance = Number(lot.LoteTrailing.valor_saldo_final) / 100;

        const { affected } =
          await this.accountsRepository._updateBalanceFromCnab(
            accountAgency,
            accountNumber,
            accountDig,
            finalBalance,
          );
        if (!affected) {
          console.error(
            `Account with agency: ${accountAgency} number: ${accountNumber}-${accountDig} not found. Balance not updated.`,
          );
        } else {
          console.log(
            `Balance updated for account with agency: ${accountAgency} number: ${accountNumber}-${accountDig} with value ${finalBalance}`,
          );
        }

        for (const details of lot.details) {
          for (const segment of details) {
            const updateData = this.extractPayableDataFromSegment(segment);

            if (!updateData) {
              continue;
            }

            await this.updatePayableStatus(
              updateData.payableId,
              updateData.accountId,
              updateData.status,
              updateData.paymentDate,
            );
          }
        }
      }
    } catch (error) {
      console.error("balance cnab", error);
    }
  }

  private extractPayableDataFromSegment(segment: any): {
    payableId: number;
    accountId: number;
    status: PayableStatus;
    paymentDate: Date | null;
  } | null {
    const docEmpresa = segment.complemento?.trim();

    if (!docEmpresa?.includes("-")) {
      return null;
    }

    const [accountId, payableId] = docEmpresa.split("-").map(Number);

    if (!accountId || !payableId || isNaN(accountId) || isNaN(payableId)) {
      return null;
    }

    const statusMap: Record<string, PayableStatus> = {
      D: PayableStatus.PAID,
      C: PayableStatus.REJECTED,
      E: PayableStatus.REJECTED,
      R: PayableStatus.REJECTED,
    };

    const status = statusMap[segment.tipo_lancamento];

    if (!status) {
      return null;
    }

    return {
      payableId,
      accountId,
      status,
      paymentDate:
        status === PayableStatus.PAID
          ? new Date(segment.data_lancamento)
          : null,
    };
  }

  private async updatePayableStatus(
    payableId: number,
    accountId: number,
    newStatus: PayableStatus,
    paymentDate: Date | null,
  ): Promise<boolean> {
    try {
      const payable = await this.payablesRepository._findById(payableId);

      if (!payable || payable.accountId !== accountId) {
        console.warn(
          `Pagamento ${payableId} não encontrado ou accountId incompatível`,
        );
        return false;
      }

      if (payable.payableStatus !== PayableStatus.APPROVED) {
        console.warn(
          `Pagamento ${payableId} não está aprovado (status: ${payable.payableStatus})`,
        );
        return false;
      }

      await this.payablesRepository._update(payableId, {
        payableStatus: newStatus,
        paymentDate,
      });

      return true;
    } catch (error) {
      console.error(`Erro ao atualizar pagamento ${payableId}:`, error);
      return false;
    }
  }
}