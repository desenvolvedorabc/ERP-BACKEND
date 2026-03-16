import { Injectable } from "@nestjs/common";
import { ForbiddenError, InternalServerError } from "src/common/errors";
import { OPTIONS_FOR_UPDATE_BUDGET_PLAN } from "src/modules/budget-plans/constants/options-for-update-budget-plan";
import { CreateCostCenterSubCategoryDto } from "../dto/create-cost-center-sub-category.dto";
import { optionsSubCategories } from "../dto/optionsSubCategories";
import { UpdateCostCenterSubCategoryDto } from "../dto/update-cost-center-sub-category.dto";
import { CostCenterSubCategory } from "../entities/cost-center-sub-category.entity";
import {
  DuplicatedSubCategory,
  NotFoundCostCenterSubCategory,
} from "../errors";
import {
  CostCenterSubCategoriesRepository,
  ResponseCostCenterSubCategory,
} from "../repositories/typeorm/cost-center-sub-categories-repository";

@Injectable()
export class CostCenterSubCategoriesService {
  constructor(
    private costCenterSubCategoriesRepository: CostCenterSubCategoriesRepository,
  ) {}

  async create(data: CreateCostCenterSubCategoryDto): Promise<void> {
    this.validateDuplicate(data);

    await this.costCenterSubCategoriesRepository._create(data);
  }

  async findOne(
    id: number,
    relations: string[] = [],
  ): Promise<ResponseCostCenterSubCategory> {
    const { costCenterSubCategory } =
      await this.costCenterSubCategoriesRepository._findOneById(id, relations);

    if (!costCenterSubCategory) {
      throw new NotFoundCostCenterSubCategory();
    }

    return {
      costCenterSubCategory,
    };
  }

  async findAll(): Promise<CostCenterSubCategory[]> {
    return await this.costCenterSubCategoriesRepository._findAll();
  }

  async update(id: number, dto: UpdateCostCenterSubCategoryDto): Promise<void> {
    const { costCenterSubCategory } =
      await this.verifyBudgetPlanValidateForUpdate(id);

    this.validateUpdateRequest(dto, id);

    await this.costCenterSubCategoriesRepository._update(
      costCenterSubCategory.id,
      {
        name: dto.name,
        type: dto.type,
      },
    );
  }

  async delete(id: number): Promise<void> {
    const { costCenterSubCategory } =
      await this.verifyBudgetPlanValidateForUpdate(id);

    this.validateExists(id);

    try {
      await this.costCenterSubCategoriesRepository._delete(
        costCenterSubCategory.id,
      );
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async findManyByBudgetPlanId(budgetPlanId: number) {
    const { costCenterSubCategories } =
      await this.costCenterSubCategoriesRepository._findManyByBudgetPlanId(
        budgetPlanId,
      );

    return {
      costCenterSubCategories,
    };
  }

  async toggleActive(id: number): Promise<void> {
    const { costCenterSubCategory } =
      await this.verifyBudgetPlanValidateForUpdate(id);

    const newActive = !costCenterSubCategory.active;

    try {
      await this.costCenterSubCategoriesRepository._update(
        costCenterSubCategory.id,
        {
          active: newActive,
        },
      );
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async toggleActiveMany(
    subCategories: CostCenterSubCategory[],
    newActive: boolean,
  ): Promise<void> {
    await Promise.all(
      subCategories.map(async (subCategory): Promise<void> => {
        await this.costCenterSubCategoriesRepository._update(subCategory.id, {
          active: newActive,
        });
      }),
    );
  }

  async getOptions(): Promise<optionsSubCategories[]> {
    return await this.costCenterSubCategoriesRepository._getOptions();
  }

  private async verifyBudgetPlanValidateForUpdate(
    costCenterSubCategoryId: number,
  ) {
    const { costCenterSubCategory } = await this.findOne(
      costCenterSubCategoryId,
      [
        "costCenterCategory",
        "costCenterCategory.costCenter",
        "costCenterCategory.costCenter.budgetPlan",
      ],
    );

    const budgetPlan =
      costCenterSubCategory.costCenterCategory.costCenter.budgetPlan;

    if (!OPTIONS_FOR_UPDATE_BUDGET_PLAN.includes(budgetPlan.status)) {
      throw new ForbiddenError();
    }

    return {
      costCenterSubCategory,
    };
  }

  async getOneByNameAndBudgetPlan(
    name: string,
    budgetPlanId: number,
    categoryName?: string,
    costCenterName?: string,
  ) {
    return await this.costCenterSubCategoriesRepository._findOneByNameAndBudgetPlan(
      name,
      budgetPlanId,
      categoryName,
      costCenterName,
    );
  }

  async duplicateMany(
    costCenterCategoryId: number,
    subCategories: CostCenterSubCategory[],
  ): Promise<void> {
    await Promise.all(
      subCategories.map(async (item): Promise<void> => {
        await this.costCenterSubCategoriesRepository._duplicate({
          name: item.name,
          costCenterCategoryId,
          type: item.type,
          active: item.active,
          releaseType: item.releaseType,
        });
      }),
    );
  }

  private async validateExists(id: number): Promise<void> {
    const exists = await this.costCenterSubCategoriesRepository._existsById(id);
    if (!exists) {
      throw new NotFoundCostCenterSubCategory();
    }
  }

  private async validateDuplicate(
    dto: UpdateCostCenterSubCategoryDto,
    id?: number,
  ): Promise<void> {
    const duplicated =
      await this.costCenterSubCategoriesRepository._existsByData(dto, id);
    if (duplicated) {
      throw new DuplicatedSubCategory();
    }
  }

  private async validateUpdateRequest(
    dto: UpdateCostCenterSubCategoryDto,
    id: number,
  ): Promise<void> {
    this.validateExists(id);
    this.validateDuplicate(dto, id);
  }
}
