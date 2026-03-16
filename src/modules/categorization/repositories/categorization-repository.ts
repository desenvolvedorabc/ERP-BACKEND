import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Categorization } from "../entities/categorization.entity";

import { BaseRepository } from "src/database/typeorm/base-repository";
import { UpdateCategorizationDTO } from "../dto/updateCategorization.dto";
import { RelationType } from "../enums";

@Injectable()
export class CategorizationRepository extends BaseRepository<Categorization> {
  constructor(dataSource: DataSource) {
    super(Categorization, dataSource);
  }

  async _create(data: Categorization): Promise<void> {
    const newContract = await this.getRepository(Categorization).create(data);
    await this.getRepository(Categorization).insert(newContract);
  }

  async _createMany(data: Array<Categorization>): Promise<void> {
    const newContract = await this.getRepository(Categorization).create(data);
    await this.getRepository(Categorization).insert(newContract);
  }

  async _findById(id: number): Promise<Categorization> {
    return await this.getRepository(Categorization).findOne({
      where: { id },
    });
  }

  async _update(
    relationalId: number,
    relationType: RelationType,
    data: UpdateCategorizationDTO,
  ): Promise<void> {
    const queryBuilder =
      await this.getRepository(Categorization).createQueryBuilder(
        "Categorization",
      );

    switch (relationType) {
      case RelationType.PAYABLE:
        queryBuilder.where("payableRelationalId = :id");
        break;
      case RelationType.RECEIVABLE:
        queryBuilder.where("receivableRelationalId = :id");
        break;
      case RelationType.CARDMOV:
        queryBuilder.where("receivableRelationalId = :id");
        break;
    }

    queryBuilder.update().set(data).setParameter("id", relationalId).execute();
  }

  async _delete(id: number): Promise<void> {
    await this.getRepository(Categorization).delete({ id });
  }

  async _deleteByRelationalId(
    id: number,
    relationType: RelationType,
  ): Promise<void> {
    const queryBuilder =
      await this.getRepository(Categorization).createQueryBuilder(
        "Categorization",
      );

    switch (relationType) {
      case RelationType.PAYABLE:
        queryBuilder.where("payableRelationalId = :id");
        break;
      case RelationType.RECEIVABLE:
        queryBuilder.where("receivableRelationalId = :id");
        break;
      case RelationType.CARDMOV:
        queryBuilder.where("cardMovRelationalId = :id");
        break;
      case RelationType.APPOINTMENT:
        queryBuilder.where("bankRecordApiId = :id");
        break;
    }

    await queryBuilder.delete().setParameter("id", id).execute();
  }

  async _existsById(id: number): Promise<boolean> {
    return await this.getRepository(Categorization).exists({ where: { id } });
  }

  async _existsByRelationId(
    id: number,
    relationType: RelationType,
  ): Promise<boolean> {
    const queryBuilder =
      await this.getRepository(Categorization).createQueryBuilder(
        "Categorization",
      );

    switch (relationType) {
      case RelationType.PAYABLE:
        queryBuilder.where("payableRelationalId = :id");
        break;
      case RelationType.RECEIVABLE:
        queryBuilder.where("receivableRelationalId = :id");
        break;
      case RelationType.CARDMOV:
        queryBuilder.where("cardMovRelationalId = :id");
        break;
      case RelationType.APPOINTMENT:
        queryBuilder.where("bankRecordApiId = :id");
        break;
    }
    return await queryBuilder.setParameter("id", id).getExists();
  }
}
