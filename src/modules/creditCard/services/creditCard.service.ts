/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { CreditCardRepository } from "../repositories/creditCard-repository";
import { CreateCreditCardDTO } from "../dtos/creditCard/createCreditCard.dto";
import {
  CreatingCreditCardError,
  DeletingCreditCardError,
  FindCreditCardError,
  NotFoundCreditCard,
  NotFoundCreditCardsError,
  UpdatingCreditCardError,
} from "../errors";
import { CreditCardPaginateParams } from "../dtos/creditCard/paginateParamsCreditCard.dto";
import { CreditCard } from "../entities/creditCard.entity";
import { UpdateCreditCardDTO } from "../dtos/creditCard/updateCreditCard";
import { CreditCardValidator } from "../validations/creditCard.validate";
import { IPaginationMeta, Pagination } from "nestjs-typeorm-paginate";

@Injectable()
export class CreditCardService {
  constructor(
    private creditCardRepository: CreditCardRepository,
    private validator: CreditCardValidator,
  ) {}

  async create(data: CreateCreditCardDTO) {
    try {
      await this.creditCardRepository._create(data);
    } catch (error) {
      console.error(error);
      throw new CreatingCreditCardError();
    }
  }

  async findAll(
    params: CreditCardPaginateParams,
  ): Promise<Pagination<CreditCard, IPaginationMeta>> {
    try {
      const accounts = await this.creditCardRepository._findAll(params);

      if (accounts.meta.totalItems === 0) throw new NotFoundCreditCardsError();

      return accounts;
    } catch (error) {
      console.error(error);
      throw new FindCreditCardError();
    }
  }

  async findById(id: number): Promise<CreditCard> {
    await this.validator.Exists(id);

    try {
      const account = await this.creditCardRepository._findById(id);

      if (!account) throw new NotFoundCreditCard();

      return account;
    } catch (error) {
      console.error(error);
      throw new FindCreditCardError();
    }
  }

  async update(id: number, data: UpdateCreditCardDTO) {
    await this.validator.Exists(id);
    try {
      await this.creditCardRepository._update(id, data);
    } catch (error) {
      console.error(error);
      throw new UpdatingCreditCardError();
    }
  }

  async toggleCreditCard(id: number): Promise<void> {
    await this.validator.Exists(id);
    await this.validator.hasPendingPayable(id);
    try {
      await this.creditCardRepository._toggleActive(id);
    } catch (error) {
      console.error(error);
      throw new DeletingCreditCardError();
    }
  }
}
