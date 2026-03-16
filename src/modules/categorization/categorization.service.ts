import { Injectable } from "@nestjs/common";
import { CreateCategorizationDTO } from "./dto/createCategorization.dto";
import { Categorization } from "./entities/categorization.entity";
import {
  CategorizationNotFoundException,
  CreatingCategorizationError,
  DeletingCategorizationError,
  FetchingCategorizationByIdError,
} from "./errors";
import { CategorizationRepository } from "./repositories/categorization-repository";
import { UpdateCategorizationDTO } from "./dto/updateCategorization.dto";
import { RelationType } from "./enums";

@Injectable()
export class CategorizationService {
  constructor(private categorizationRepository: CategorizationRepository) {}

  async create(
    data: CreateCategorizationDTO | UpdateCategorizationDTO,
    relationType: RelationType,
    relationalId: number,
  ): Promise<void> {
    try {
      const newCategorization = new Categorization(data);
      this.asignId(newCategorization, relationType, relationalId);
      await this.categorizationRepository._create(newCategorization);
    } catch (error) {
      console.error(error);
      throw new CreatingCategorizationError();
    }
  }

  async createMany(
    data: CreateCategorizationDTO,
    relationType: RelationType,
    relationalIds: number[],
  ): Promise<void> {
    try {
      const newCategorizations = relationalIds.map((id) => {
        const newCategorization = new Categorization(data);
        this.asignId(newCategorization, relationType, id);
        return newCategorization;
      });

      await this.categorizationRepository._createMany(newCategorizations);
    } catch (error) {
      console.error(error);
      throw new CreatingCategorizationError();
    }
  }

  async update(
    relationalId: number,
    relationType: RelationType,
    data: UpdateCategorizationDTO,
  ): Promise<void> {
    const exists = await this.categorizationRepository._existsByRelationId(
      relationalId,
      relationType,
    );
    if (exists) {
      this.categorizationRepository._update(relationalId, relationType, data);
    } else {
      this.create(data, relationType, relationalId);
    }
  }

  async delete(id: number): Promise<void> {
    await this.validateExists(id);
    try {
      await this.categorizationRepository._delete(id);
    } catch (error) {
      throw new DeletingCategorizationError();
    }
  }

  async deleteByRelation(
    id: number,
    relationType: RelationType,
  ): Promise<void> {
    await this.validateExistsByRelation(id, relationType);
    try {
      await this.categorizationRepository._deleteByRelationalId(
        id,
        relationType,
      );
    } catch (error) {
      throw new DeletingCategorizationError();
    }
  }

  async findOneById(id: number): Promise<Categorization> {
    let payload: Categorization;
    try {
      payload = await this.categorizationRepository._findById(id);
    } catch (error) {
      console.error(error);
      throw new FetchingCategorizationByIdError();
    }
    if (!payload) {
      throw new CategorizationNotFoundException();
    }
    return payload;
  }

  private asignId(
    categorization: Categorization,
    relationType: RelationType,
    relationalId,
  ) {
    switch (relationType) {
      case RelationType.PAYABLE:
        categorization.payableRelationalId = relationalId;
        break;
      case RelationType.RECEIVABLE:
        categorization.receivableRelationalId = relationalId;
        break;
      case RelationType.CARDMOV:
        categorization.cardMovRelationalId = relationalId;
        break;
      case RelationType.APPOINTMENT:
        categorization.bankRecordApiId = relationalId;
        break;
    }
  }

  private async validateExistsByRelation(
    id: number,
    relationType: RelationType,
  ): Promise<void> {
    const exists = await this.categorizationRepository._existsByRelationId(
      id,
      relationType,
    );
    if (!exists) {
      throw new CategorizationNotFoundException();
    }
  }

  private async validateExists(id: number): Promise<void> {
    const exists = await this.categorizationRepository._existsById(id);
    if (!exists) {
      throw new CategorizationNotFoundException();
    }
  }
}
