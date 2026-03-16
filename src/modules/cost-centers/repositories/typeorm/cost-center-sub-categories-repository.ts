import { Injectable } from "@nestjs/common";
import { BudgetPlanStatus } from "src/modules/budget-plans/enum";
import { DataSource, Not } from "typeorm";
import { CreateCostCenterSubCategoryDto } from "../../dto/create-cost-center-sub-category.dto";
import { optionsSubCategories } from "../../dto/optionsSubCategories";
import { UpdateCostCenterSubCategoryDto } from "../../dto/update-cost-center-sub-category.dto";
import { CostCenterSubCategory } from "../../entities/cost-center-sub-category.entity";
import { BaseRepository } from "src/database/typeorm/base-repository";

export interface ResponseCostCenterSubCategory {
  costCenterSubCategory: CostCenterSubCategory | null;
}

@Injectable()
export class CostCenterSubCategoriesRepository extends BaseRepository<CostCenterSubCategory> {
  constructor(dataSource: DataSource) {
    super(CostCenterSubCategory, dataSource);
  }

  async _create(
    createCostCenterSubCategoryDto: CreateCostCenterSubCategoryDto,
  ): Promise<CostCenterSubCategory> {
    const { costCenterCategoryId, type, name, releaseType } =
      createCostCenterSubCategoryDto;

    const costCenterSubCategory = this.getRepository(
      CostCenterSubCategory,
    ).create({
      name,
      costCenterCategoryId,
      type,
      releaseType,
    });

    return await this.getRepository(CostCenterSubCategory).save(
      costCenterSubCategory,
    );
  }

  async _existsByData(
    data: CreateCostCenterSubCategoryDto | UpdateCostCenterSubCategoryDto,
    id = -1,
  ) {
    const { name, costCenterCategoryId } = data;
    return await this.getRepository(CostCenterSubCategory).exist({
      where: {
        name,
        costCenterCategoryId,
        id: Not(id),
      },
    });
  }

  async _existsById(id: number) {
    return await this.getRepository(CostCenterSubCategory).exist({
      where: { id },
    });
  }

  async _duplicate(data: Partial<CostCenterSubCategory>): Promise<void> {
    const costCenterSubCategory = this.getRepository(
      CostCenterSubCategory,
    ).create(data);

    await this.getRepository(CostCenterSubCategory).save(costCenterSubCategory);
  }

  async _findOneById(
    id: number,
    relations: string[] = [],
  ): Promise<ResponseCostCenterSubCategory> {
    const costCenterSubCategory = await this.getRepository(
      CostCenterSubCategory,
    ).findOne({
      where: {
        id,
      },
      relations,
    });

    return {
      costCenterSubCategory,
    };
  }

  async _findAll() {
    return await this.getRepository(CostCenterSubCategory).find();
  }

  async _findManyByBudgetPlanId(budgetPlanId: number) {
    const costCenterSubCategories = await this.getRepository(
      CostCenterSubCategory,
    )
      .createQueryBuilder("CosCenterSubCategories")
      .select([
        "CosCenterSubCategories.id",
        "CosCenterSubCategories.name",
        "CosCenterSubCategories.type",
        "CosCenterSubCategories.releaseType",
        "costCenterCategory.name",
        "costCenter.name",
      ])
      .innerJoin(
        "CosCenterSubCategories.costCenterCategory",
        "costCenterCategory",
      )
      .innerJoin("costCenterCategory.costCenter", "costCenter")
      .where("costCenter.budgetPlanId = :budgetPlanId", { budgetPlanId })
      .andWhere("CosCenterSubCategories.active = true")
      .getMany();

    return {
      costCenterSubCategories,
    };
  }

  async _findOneByNameAndBudgetPlan(
    name: string,
    budgetPlanId: number,
    categoryName?: string,
    costCenterName?: string,
  ) {
    const queryBuilder = this.getRepository(CostCenterSubCategory)
      .createQueryBuilder("CosCenterSubCategories")
      .select([
        "CosCenterSubCategories.id",
        "CosCenterSubCategories.costCenterCategoryId",
      ])
      .innerJoin(
        "CosCenterSubCategories.costCenterCategory",
        "costCenterCategory",
      )
      .innerJoin("costCenterCategory.costCenter", "costCenter")
      .where("costCenter.budgetPlanId = :budgetPlanId", { budgetPlanId })
      .andWhere("CosCenterSubCategories.name = :name", { name });

    // Adicionar filtro por categoria se fornecido
    if (categoryName) {
      queryBuilder.andWhere("costCenterCategory.name = :categoryName", {
        categoryName,
      });
    }

    // Adicionar filtro por cost center se fornecido
    if (costCenterName) {
      queryBuilder.andWhere("costCenter.name = :costCenterName", {
        costCenterName,
      });
    }

    const costCenterSubCategory = await queryBuilder.getOne();

    return {
      costCenterSubCategory,
    };
  }

  async _update(
    id: number,
    data: Partial<CostCenterSubCategory>,
  ): Promise<void> {
    await this.getRepository(CostCenterSubCategory).update(id, data);
  }

  async _delete(id: number): Promise<void> {
    await this.getRepository(CostCenterSubCategory).delete(id);
  }

  async _getOptions(): Promise<optionsSubCategories[]> {
    return await this.getRepository(CostCenterSubCategory)
      .createQueryBuilder("subCategory")
      .leftJoin("subCategory.costCenterCategory", "category")
      .leftJoin("category.costCenter", "costCenter")
      .leftJoin("costCenter.budgetPlan", "budgetPlan")
      .select([
        "subCategory.id AS id",
        "subCategory.name AS name",
        "subCategory.costCenterCategoryId AS parentId",
      ])
      .where("budgetPlan.status = :q", { q: BudgetPlanStatus.APROVADO })
      .andWhere(
        "costCenter.active = true AND category.active = true AND subCategory.active = true",
      )
      .getRawMany();
  }
}
