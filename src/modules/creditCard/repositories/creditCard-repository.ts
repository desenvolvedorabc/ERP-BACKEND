import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { BaseRepository } from "src/database/typeorm/base-repository";
import { CreditCard } from "../entities/creditCard.entity";
import { CreateCreditCardDTO } from "../dtos/creditCard/createCreditCard.dto";
import { CreditCardPaginateParams } from "../dtos/creditCard/paginateParamsCreditCard.dto";
import { UpdateCreditCardDTO } from "../dtos/creditCard/updateCreditCard";
import { paginateData } from "src/common/utils/paginate-data";
import { IPaginationMeta, Pagination } from "nestjs-typeorm-paginate";
import { PayableStatus } from "src/modules/payables/enums";

@Injectable()
export class CreditCardRepository extends BaseRepository<CreditCard> {
  constructor(dataSource: DataSource) {
    super(CreditCard, dataSource);
  }

  async _create(data: CreateCreditCardDTO): Promise<void> {
    const newCard = await this.getRepository(CreditCard).create(data);
    await this.getRepository(CreditCard).save(newCard);
  }

  async _findAll({
    search,
    limit,
    page,
  }: CreditCardPaginateParams): Promise<
    Pagination<CreditCard, IPaginationMeta>
  > {
    const queryBuilder = this.getRepository(CreditCard)
      .createQueryBuilder("CreditCard")
      .orderBy("id", "DESC");

    if (search) {
      queryBuilder.andWhere("CreditCard.name LIKE :q", { q: `%${search}%` });
    }
    queryBuilder.andWhere("CreditCard.active = true");

    const data = paginateData(page, limit, queryBuilder);

    return data;
  }

  async _findById(id: number): Promise<CreditCard> {
    return await this.getRepository(CreditCard).findOne({
      where: { id, active: true },
    });
  }

  async _update(id: number, data: UpdateCreditCardDTO): Promise<void> {
    await this.getRepository(CreditCard).update(id, data);
  }

  async _delete(id: number): Promise<void> {
    await this.getRepository(CreditCard).delete({ id });
  }

  async _hasPendingPayable(id: number): Promise<boolean> {
    const count = await this.getRepository(CreditCard)
      .createQueryBuilder("CreditCard")
      .leftJoin("CreditCard.movimentations", "mov")
      .leftJoin("mov.payable", "payable")
      .where("CreditCard.id = :id", { id })
      .andWhere("NOT payable.payableStatus IN (:...status)", {
        status: [
          PayableStatus.REJECTED,
          PayableStatus.PAID,
          PayableStatus.CONCLUDED,
          PayableStatus.CONCLUDED,
        ],
      })
      .getCount();

    return count > 0;
  }

  async _toggleActive(id: number): Promise<void> {
    await this.getRepository(CreditCard)
      .createQueryBuilder()
      .update(CreditCard)
      .set({ active: () => "NOT active" })
      .where("id = :id", { id })
      .execute();
  }
}
