import { Injectable } from "@nestjs/common";
import { DataSource, ObjectLiteral } from "typeorm";
import { BaseRepository } from "src/database/typeorm/base-repository";
import { CardMovimentation } from "../entities/cardMovimentation.entity";
import { CardMovParams } from "../dtos/cardMov/paginateParamsCardMov.dto";
import { applyWhereClauses } from "src/common/utils/query/query-builder-util";
import { UpdateCardMovDTO } from "../dtos/cardMov/updateCreditCard";
import { CreateCardMovimentationDTO } from "../dtos/cardMov/createCardMov.dto";
import { MovimentationStatus } from "../enums";
import { omit } from "lodash";

@Injectable()
export class CardMovimentationRepository extends BaseRepository<CardMovimentation> {
  constructor(dataSource: DataSource) {
    super(CardMovimentation, dataSource);
  }

  async _create(
    data: Omit<CreateCardMovimentationDTO, "categorization">[],
  ): Promise<ObjectLiteral[]> {
    const newMovimentation =
      await this.getRepository(CardMovimentation).create(data);
    const result =
      await this.getRepository(CardMovimentation).insert(newMovimentation);
    return result.identifiers;
  }

  async _findAll(params: CardMovParams): Promise<CardMovimentation[]> {
    const queryBuilder = this.getRepository(CardMovimentation)
      .createQueryBuilder("CardMovimentation")
      .select(["CardMovimentation"])
      .orderBy("CardMovimentation.referenceDate", "DESC");

    applyWhereClauses(queryBuilder, params, {
      dueBetween: "CardMovimentation.referenceDate",
      cardId: "CardMovimentation.cardId",
    });

    const data = await queryBuilder.getMany();

    return data;
  }

  async _findAllForCSV(params: CardMovParams): Promise<CardMovimentation[]> {
    const queryBuilder = this.getRepository(CardMovimentation)
      .createQueryBuilder("CardMovimentation")
      .select([
        "CardMovimentation.description",
        "CardMovimentation.purchaseDate",
        "CardMovimentation.referenceDate",
        "CardMovimentation.numberOfInstallments",
        "CardMovimentation.currentInstallment",
        "CardMovimentation.hasInstallments",
        "CardMovimentation.status",
        "CardMovimentation.value",
        "CardMovimentation.cardId",
        "Categorization.budgetPlanId",
        "Categorization.programId",
        "Categorization.costCenterId",
        "Categorization.categoryId",
        "Categorization.subCategoryId",
        "Cartao.name",
      ])
      .leftJoin("CardMovimentation.categorization", "Categorization")
      .leftJoin("CardMovimentation.card", "Cartao");

    applyWhereClauses(queryBuilder, params, {
      dueBetween: "CardMovimentation.referenceDate",
      cardId: "CardMovimentation.cardId",
    });

    const data = await queryBuilder.getMany();

    return data;
  }

  async _findAllForPayable(
    params: CardMovParams,
  ): Promise<{ value: number; dueDay: number; accountId: number }> {
    const queryBuilder = this.getRepository(CardMovimentation)
      .createQueryBuilder("CardMovimentation")
      .leftJoin("CardMovimentation.card", "Card")
      .select([
        "SUM(CardMovimentation.value) AS value",
        "Card.accountId AS accountId",
        "Card.dueDay AS dueDay",
      ])
      .where("CardMovimentation.status = :q", { q: MovimentationStatus.OPEN });

    applyWhereClauses(queryBuilder, params, {
      dueBetween: "CardMovimentation.referenceDate",
      cardId: "CardMovimentation.cardId",
    });

    const data = await queryBuilder.getRawOne<{
      value: number;
      dueDay: number;
      accountId: number;
    }>();

    return data;
  }

  async _findById(id: number): Promise<CardMovimentation> {
    return await this.getRepository(CardMovimentation).findOne({
      where: { id },
      relations: {
        categorization: true,
      },
      select: {
        cardId: true,
        categorization: {
          budgetPlanId: true,
          programId: true,
          costCenterId: true,
          categoryId: true,
          subCategoryId: true,
        },
        createdAt: true,
        currentInstallment: true,
        description: true,
        hasInstallments: true,
        id: true,
        installmentId: true,
        numberOfInstallments: true,
        payableId: true,
        purchaseDate: true,
        referenceDate: true,
        status: true,
        value: true,
      },
    });
  }

  async _update(id: number, data: UpdateCardMovDTO): Promise<void> {
    const updateData = omit(data, ["hasInstallments", "currentInstallment"]);
    await this.getRepository(CardMovimentation).update(id, updateData);
  }

  async _delete(id: number): Promise<void> {
    await this.getRepository(CardMovimentation).delete({ id });
  }

  async _deleteByUUID(uuid: string): Promise<void> {
    await this.getRepository(CardMovimentation).delete({
      installmentId: uuid,
      status: MovimentationStatus.OPEN,
    });
  }

  async _markAsProcessed(params: CardMovParams, payableId: number) {
    const queryBuilder = this.getRepository(CardMovimentation)
      .createQueryBuilder("CardMov")
      .update(CardMovimentation)
      .set({ status: MovimentationStatus.PROCESSED, payableId });

    applyWhereClauses(queryBuilder, params, {
      dueBetween: "referenceDate",
      cardId: "cardId",
    });

    await queryBuilder.execute();
  }

  async _markAsUnprocessed(payableId: number) {
    const queryBuilder = this.getRepository(CardMovimentation)
      .createQueryBuilder("CardMov")
      .update(CardMovimentation)
      .set({ status: MovimentationStatus.OPEN, payableId: null })
      .where("payableId = :q AND payableId IS NOT NULL", { q: payableId });

    await queryBuilder.execute();
  }
}
