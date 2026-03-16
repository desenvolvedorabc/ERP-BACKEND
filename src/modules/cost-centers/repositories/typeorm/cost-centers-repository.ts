import { Injectable } from "@nestjs/common";
import { BudgetPlanStatus } from "src/modules/budget-plans/enum";
import { DataSource, Not } from "typeorm";
import { CreateCostCenterDto } from "../../dto/create-cost-center.dto";
import { optionsCostCenter } from "../../dto/optionsCostCenter";
import { UpdateCostCenterDto } from "../../dto/update-cost-center.dto";
import { CostCenter } from "../../entities/cost-center.entity";
import { BaseRepository } from "src/database/typeorm/base-repository";

export interface ResponseCostCenter {
  costCenter: CostCenter | null;
}

@Injectable()
export class CostCentersRepository extends BaseRepository<CostCenter> {
  constructor(dataSource: DataSource) {
    super(CostCenter, dataSource);
  }

  async _create(createCostCenterDto: CreateCostCenterDto): Promise<CostCenter> {
    const { budgetPlanId, name, type } = createCostCenterDto;

    const costCenter = this.getRepository(CostCenter).create({
      name,
      budgetPlanId,
      type,
    });

    return await this.getRepository(CostCenter).save(costCenter);
  }

  async _existsByData(
    data: CreateCostCenterDto | UpdateCostCenterDto,
    id = -1,
  ) {
    return await this.getRepository(CostCenter).exist({
      where: { ...data, id: Not(id) },
    });
  }

  async _existsById(id: number) {
    return await this.getRepository(CostCenter).exist({ where: { id } });
  }

  async _duplicate(data: Partial<CostCenter>): Promise<CostCenter> {
    const costCenter = this.getRepository(CostCenter).create({
      name: data.name,
      active: data.active,
      budgetPlanId: data.budgetPlanId,
      type: data.type,
    });

    return await this.getRepository(CostCenter).save(costCenter);
  }

  async _findManyByBudgetPlanId(budgetPlanId: number) {
    const costCenters = await this.getRepository(CostCenter).find({
      where: {
        budgetPlanId,
      },
      relations: ["categories", "categories.subCategories"],
    });

    return {
      costCenters,
    };
  }

  async _findManyActiveByBudgetPlanId(
    budgetPlanId: number,
    isSelectSubCategories = true,
  ) {
    const queryBuilder = this.getRepository(CostCenter)
      .createQueryBuilder("CostCenters")
      .select([
        "CostCenters.id",
        "CostCenters.name",
        "CostCenters.budgetPlanId",
        "CostCenters.type",
        "categories.id",
        "categories.name",
      ])
      .leftJoin(
        "CostCenters.categories",
        "categories",
        "categories.active = true",
      )

      .where("CostCenters.budgetPlanId = :budgetPlanId", { budgetPlanId })
      .andWhere("CostCenters.active = true");

    if (isSelectSubCategories) {
      queryBuilder
        .addSelect([
          "subCategories.id",
          "subCategories.name",
          "subCategories.type",
          "subCategories.releaseType",
        ])
        .leftJoin(
          "categories.subCategories",
          "subCategories",
          "subCategories.active = TRUE",
        );
    }

    const costCenters = await queryBuilder.getMany();

    return {
      costCenters,
    };
  }

  async _removeByBudgetPlanId(budgetPlanId: number): Promise<void> {
    await this.getRepository(CostCenter).delete({
      budgetPlanId,
    });
  }

  async _findOneById(
    id: number,
    relations: string[] = [],
  ): Promise<ResponseCostCenter> {
    const costCenter = await this.getRepository(CostCenter).findOne({
      where: {
        id,
      },
      relations,
    });

    return {
      costCenter,
    };
  }

  async _findAll(): Promise<CostCenter[]> {
    return await this.getRepository(CostCenter).find();
  }

  async _update(id: number, data: Partial<CostCenter>): Promise<void> {
    await this.getRepository(CostCenter).update(id, data);
  }

  async _delete(id: number): Promise<void> {
    await this.getRepository(CostCenter).delete({ id });
  }

  async _getOptions(): Promise<optionsCostCenter[]> {
    return await this.getRepository(CostCenter)
      .createQueryBuilder("costCenter")
      .leftJoin("costCenter.budgetPlan", "budgetPlan")
      .select([
        "costCenter.id AS id",
        "costCenter.name AS name",
        "costCenter.budgetPlanId AS parentId",
      ])
      .where("budgetPlan.status = :q AND costCenter.active = true", {
        q: BudgetPlanStatus.APROVADO,
      })
      .getRawMany();
  }

  async _findManyActiveByBudgetYear(year: number) {
    const queryBuilder = this.getRepository(CostCenter)
      .createQueryBuilder("CostCenters")
      .select([
        "CostCenters.id",
        "CostCenters.name",
        "CostCenters.budgetPlanId",
        "CostCenters.type",
        "categories.id",
        "categories.name",
      ])
      .innerJoin(
        "CostCenters.budgetPlan",
        "BudgetPlan",
        "BudgetPlan.year = :year",
        {
          year,
        },
      )
      .innerJoin(
        "CostCenters.categories",
        "categories",
        "categories.active = true",
      )

      .andWhere("CostCenters.active = true");

    const costCenters = await queryBuilder.getMany();

    return {
      costCenters,
    };
  }
}
