import { Injectable } from "@nestjs/common";
import { BudgetPlanStatus } from "src/modules/budget-plans/enum";
import { DataSource, Not, Repository } from "typeorm";
import { CreateCostCenterCategoryDto } from "../../dto/create-cost-center-category.dto";
import { optionsCategories } from "../../dto/optionsCategories";
import { UpdateCostCenterCategoryDto } from "../../dto/update-cost-center-category.dto";
import { CostCenterCategory } from "../../entities/cost-center-category.entity";

export interface ResponseCostCenterCategory {
  costCenterCategory: CostCenterCategory | null;
}
import { BaseRepository } from "src/database/typeorm/base-repository";

@Injectable()
export class CostCenterCategoriesRepository extends BaseRepository<CostCenterCategory> {
  constructor(dataSource: DataSource) {
    super(CostCenterCategory, dataSource);
  }

  async _create(
    createCostCenterCategoryDto: CreateCostCenterCategoryDto,
  ): Promise<CostCenterCategory> {
    const { costCenterId, name } = createCostCenterCategoryDto;

    const costCenterCategory = this.getRepository(CostCenterCategory).create({
      name,
      costCenterId,
    });

    return await this.getRepository(CostCenterCategory).save(
      costCenterCategory,
    );
  }

  async _findAll(): Promise<CostCenterCategory[]> {
    return await this.getRepository(CostCenterCategory).find();
  }

  async _existsByData(
    data: CreateCostCenterCategoryDto | UpdateCostCenterCategoryDto,
    id = -1,
  ) {
    const { name, costCenterId } = data;
    return await this.getRepository(CostCenterCategory).exist({
      where: {
        name,
        costCenterId,
        id: Not(id),
      },
    });
  }

  async _existsById(id: number) {
    return await this.getRepository(CostCenterCategory).exist({
      where: { id },
    });
  }

  async _duplicate(
    data: Partial<CostCenterCategory>,
  ): Promise<CostCenterCategory> {
    const costCenterCategory =
      this.getRepository(CostCenterCategory).create(data);

    return await this.getRepository(CostCenterCategory).save(
      costCenterCategory,
    );
  }

  async _findOneById(
    id: number,
    relations: string[] = [],
  ): Promise<ResponseCostCenterCategory> {
    const costCenterCategory = await this.getRepository(
      CostCenterCategory,
    ).findOne({
      where: {
        id,
      },
      relations,
    });

    return {
      costCenterCategory,
    };
  }

  async _update(id: number, data: Partial<CostCenterCategory>): Promise<void> {
    await this.getRepository(CostCenterCategory).update(id, data);
  }

  async _delete(id: number): Promise<void> {
    await this.getRepository(CostCenterCategory).delete({ id });
  }

  async _getOptions(): Promise<optionsCategories[]> {
    return await this.getRepository(CostCenterCategory)
      .createQueryBuilder("category")
      .leftJoin("category.costCenter", "costCenter")
      .leftJoin("costCenter.budgetPlan", "budgetPlan")
      .select([
        "category.id AS id",
        "category.name AS name",
        "category.costCenterId AS parentId",
      ])
      .where(
        "budgetPlan.status = :q AND costCenter.active = true AND category.active = true",
        { q: BudgetPlanStatus.APROVADO },
      )
      .getRawMany();
  }
}
