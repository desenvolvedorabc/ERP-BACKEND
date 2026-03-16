import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { BaseRepository } from "src/database/typeorm/base-repository";
import { Accounts } from "../entities/accounts.entity";
import { CreateAccountDTO } from "../dtos/createAccount.dto";
import { UpdateAccountDTO } from "../dtos/updateAccount.dto";
import { AccountsPaginateParams } from "../dtos/paginateParamsAccounts.dto";
import { defaultSelectAll, defaultSelectById } from "../consts";
import { AccountResponseDTO } from "../dtos/accountResponse.dto";
import { optionsBudgetPlan } from "src/modules/budget-plans/dto/optionsBudgetPlan.dto";

@Injectable()
export class AccountsRepository extends BaseRepository<Accounts> {
  constructor(dataSource: DataSource) {
    super(Accounts, dataSource);
  }

  async _create(data: CreateAccountDTO): Promise<void> {
    const newAccount = await this.getRepository(Accounts).create({
      ...data,
      systemBalance: data.initialBalance || 0,
    });
    await this.getRepository(Accounts).save(newAccount);
  }

  async _findAll({
    search,
    order,
  }: AccountsPaginateParams): Promise<AccountResponseDTO[]> {
    const queryBuilder = this.getRepository(Accounts)
      .createQueryBuilder("Accounts")
      .select([
        ...defaultSelectAll,
        // `(SELECT COUNT(*) FROM payables WHERE payables.accountId = Accounts.id AND payables.conciliated = false) +
        //  (SELECT COUNT(*) FROM receivables WHERE receivables.accountId = Accounts.id AND receivables.conciliated = false)
        //  AS pendingReconciliations`,
      ]);

    if (search) {
      queryBuilder.andWhere("Accounts.name LIKE :q", { q: `%${search}%` });
    }

    queryBuilder.orderBy("Accounts.name", order);

    const data = queryBuilder.getRawMany<AccountResponseDTO>();

    return data;
  }

  async _getOptions(): Promise<optionsBudgetPlan[]> {
    return await this.getRepository(Accounts)
      .createQueryBuilder("Accounts")
      .select(["Accounts.id AS id", "Accounts.name AS name"])
      .getRawMany();
  }

  async _findById(id: number): Promise<Accounts> {
    return await this.getRepository(Accounts).findOne({
      where: { id },
      select: defaultSelectById,
    });
  }

  async _update(id: number, data: UpdateAccountDTO): Promise<void> {
    await this.getRepository(Accounts).update(id, data);
  }

  async _updateBalance(id: number, value: number): Promise<number> {
    const queryBuilder =
      await this.getRepository(Accounts).createQueryBuilder("Account");
    await queryBuilder
      .update(Accounts)
      .set({ systemBalance: () => "systemBalance + :q" })
      .where("id = :id", { q: value, id })
      .execute();

    const updatedAccount = await this.getRepository(Accounts)
      .createQueryBuilder("Account")
      .select("Account.systemBalance")
      .where("Account.id = :id", { id })
      .getOne();

    return updatedAccount.systemBalance;
  }

  async _updateBalanceFromCnab(
    accountAgency: string,
    accountNumber: string,
    accountDig: string,
    value: number,
  ) {
    const queryBuilder =
      this.getRepository(Accounts).createQueryBuilder("Account");

    return await queryBuilder
      .update(Accounts)
      .set({ balance: value })
      .where(
        'TRIM(LEADING "0" FROM agency) = TRIM(LEADING "0" FROM :accountAgency) AND TRIM(LEADING "0" FROM accountNumber) = TRIM(LEADING "0" FROM :accountNumber) AND dv = :accountDig',
        { accountAgency, accountNumber, accountDig },
      )
      .execute();
  }

  async _updateLastReconciliation(id: number): Promise<void> {
    await this.getRepository(Accounts).update(id, {
      lastReconciliation: new Date(),
    });
  }

  async _delete(id: number): Promise<void> {
    await this.getRepository(Accounts).delete({ id });
  }
}
