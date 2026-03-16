/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { AccountsRepository } from "../repositories/accounts-repository";
import {
  CreatingAccountError,
  DeletingAccountError,
  FindAccountError,
  NotFoundAccountsError,
  UpdatingAccountError,
} from "../errors";
import { CreateAccountDTO } from "../dtos/createAccount.dto";
import { Accounts } from "../entities/accounts.entity";
import { UpdateAccountDTO } from "../dtos/updateAccount.dto";
import { AccountsPaginateParams } from "../dtos/paginateParamsAccounts.dto";
import { UpdateBalanceDTO } from "../dtos/updateBalance.dto";
import { AccountResponseDTO } from "../dtos/accountResponse.dto";
import { optionsBudgetPlan } from "../../budget-plans/dto/optionsBudgetPlan.dto";

@Injectable()
export class AccountsService {
  constructor(private accountsRepository: AccountsRepository) {}

  async create(data: CreateAccountDTO) {
    try {
      await this.accountsRepository._create(data);
    } catch (error) {
      console.error(error);
      throw new CreatingAccountError();
    }
  }

  async findAll(params: AccountsPaginateParams): Promise<AccountResponseDTO[]> {
    try {
      const accounts = await this.accountsRepository._findAll(params);

      if (accounts.length === 0) throw new NotFoundAccountsError();

      return accounts;
    } catch (error) {
      console.error(error);
      throw new FindAccountError();
    }
  }

  async findById(id: number): Promise<Accounts> {
    try {
      const account = await this.accountsRepository._findById(id);

      if (!account) throw new NotFoundAccountsError();

      return account;
    } catch (error) {
      console.error(error);
      throw new FindAccountError();
    }
  }

  async update(id: number, data: UpdateAccountDTO) {
    try {
      await this.accountsRepository._update(id, data);
    } catch (error) {
      console.error(error);
      throw new UpdatingAccountError();
    }
  }

  async updateBalance(id: number, data: UpdateBalanceDTO): Promise<number> {
    try {
      return await this.accountsRepository._updateBalance(id, data.value);
    } catch (error) {
      console.error(error);
      throw new UpdatingAccountError();
    }
  }

  async updateLastReconciliation(id: number) {
    try {
      await this.accountsRepository._updateLastReconciliation(id);
    } catch (error) {
      console.error(error);
      throw new UpdatingAccountError();
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.accountsRepository._delete(id);
    } catch (error) {
      console.error(error);
      throw new DeletingAccountError();
    }
  }

  async getOptions(): Promise<optionsBudgetPlan[]> {
    return await this.accountsRepository._getOptions();
  }
}
