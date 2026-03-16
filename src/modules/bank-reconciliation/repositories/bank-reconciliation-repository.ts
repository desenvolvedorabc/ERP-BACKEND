import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { BaseRepository } from "src/database/typeorm/base-repository";
import { BankReconciliation } from "../entities/bank-reconciliation.entity";
import { Accounts } from "src/modules/accounts/entities/accounts.entity";
import { CreateBankReconciliationDTO } from "../dtos/bank-reconciliation.dto";
import { FindByAccountIdResult } from "../interfaces/bank-reconciliation.interface";
import { BankReconciliationType } from "../enums";

@Injectable()
export class BankReconciliationRepository extends BaseRepository<BankReconciliation> {
  constructor(dataSource: DataSource) {
    super(BankReconciliation, dataSource);
  }

  async _findByAccountId(accountId: number): Promise<FindByAccountIdResult> {
    const result = await this.getRepository(Accounts)
      .createQueryBuilder("account")
      .where("account.id = :id", { id: accountId })
      .addSelect([
        "account.name",
        "account.agency",
        "account.accountNumber",
        "account.balance",
        "account.systemBalance",
        "account.updatedAt",
        "bankReconciliation.id",
        "bankReconciliation.type",
        "bankReconciliation.transferedById",
        "RecordApi.documentNumber",
        "RecordApi.transactionAmount",
        "RecordApi.transactionDate",
        "RecordApi.fullTransactionDescription",
        "Installment.installmentNumber", // TODO = add count de parcelas
        "Receivable.identifierCode",
        "Payable.identifierCode",
        "Installment.dueDate",
        "Installment.payableId",
        "Installment.value",
      ])
      .leftJoinAndMapMany(
        "account.bankReconciliations",
        BankReconciliation,
        "bankReconciliation",
        "bankReconciliation.accountId = account.id",
      )
      .leftJoin("bankReconciliation.recordSystem", "Installment")
      .leftJoin("bankReconciliation.recordApi", "RecordApi")
      .leftJoin("Installment.receivable", "Receivable")
      .leftJoin("Installment.payable", "Payable")
      .orderBy("Installment.dueDate", "ASC")
      .getOne();

    return {
      name: result.name,
      agency: result.agency,
      account: result.accountNumber,
      balance: result.balance,
      systemBalance: result.systemBalance,
      updatedAt: result.updatedAt,
      bankReconciliations: result.bankReconciliations.map((br) => ({
        id: br.id,
        type: br.type,
        transferedById: br?.transferedById,
        recordApi: br.recordApi,
        recordSystem:
          br.type === BankReconciliationType.TRANSACTION_ENTRY &&
          br.recordSystem
            ? {
                id: br.id,
                aditionalDescription: `Parcela ${br.recordSystem.installmentNumber}`, // TODO = add count de parcelas
                identification:
                  br.recordSystem?.receivable?.identifierCode ||
                  br.recordSystem?.payable?.identifierCode,
                dueDate: br.recordSystem.dueDate,
                value: br.recordSystem.payableId
                  ? br.recordSystem.value * -1
                  : br.recordSystem.value,
              }
            : undefined,
      })),
    };
  }

  async _create(
    data: CreateBankReconciliationDTO,
  ): Promise<BankReconciliation> {
    const created = await this.getRepository(BankReconciliation).insert(data);
    return await this.getRepository(BankReconciliation).findOneBy({
      id: created.identifiers[0].id,
    });
  }

  async _findById(id: number): Promise<BankReconciliation> {
    return await this.getRepository(BankReconciliation).findOne({
      where: { id },
      relations: {
        recordApi: true,
        recordSystem: {
          payable: true,
          receivable: true,
        },
      },
    });
  }

  // ! - Na data de produção deste código, há um issue aberto no typeorm em relação ao delete cascade de relações oneToOne.
  // ! - Esta issue faz com que o delete cascade não funcione em relações oneToOne, por isso o código de deleção abaixo.
  async _delete(data: BankReconciliation): Promise<void> {
    await this.manager.query(
      `
      DELETE br, bra
      FROM \`bank-reconciliation\` br
      LEFT JOIN \`bank-record-api\` bra ON br.recordApiId = bra.id
      WHERE br.id = ?
    `,
      [data.id],
    );
  }

  async _exists(id: number): Promise<boolean> {
    return await this.getRepository(BankReconciliation).existsBy({ id });
  }
}
