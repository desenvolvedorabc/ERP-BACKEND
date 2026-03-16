import { Injectable } from "@nestjs/common";
import { ForbiddenError, InternalServerError } from "src/common/errors";
import { OPTIONS_FOR_UPDATE_BUDGET_PLAN } from "src/modules/budget-plans/constants/options-for-update-budget-plan";
import { CreateCostCenterCategoryDto } from "../dto/create-cost-center-category.dto";
import { optionsCategories } from "../dto/optionsCategories";
import { UpdateCostCenterCategoryDto } from "../dto/update-cost-center-category.dto";
import { CostCenterCategory } from "../entities/cost-center-category.entity";
import { CostCenterSubCategory } from "../entities/cost-center-sub-category.entity";
import { DuplicatedCategory, NotFoundCostCenterCategory } from "../errors";
import { CostCenterCategoriesRepository } from "../repositories/typeorm/cost-center-categories-repository";
import { CostCenterSubCategoriesService } from "./cost-center-sub-categories.service";

@Injectable()
export class CostCenterCategoriesService {
  constructor(
    private costCenterSubCategoriesService: CostCenterSubCategoriesService,

    private costCenterCategoriesRepository: CostCenterCategoriesRepository,
  ) {}

  async createWithSubcategories(
    dto: CreateCostCenterCategoryDto,
  ): Promise<void> {
    try {
      const costCenter = await this.costCenterCategoriesRepository._create(dto);

      await this.createSubCategories(costCenter.id, dto.subCategories);
    } catch (e) {
      console.error(e);
      throw new InternalServerError();
    }
  }

  async create(data: CreateCostCenterCategoryDto): Promise<void> {
    this.validateDuplicate(data);

    await this.costCenterCategoriesRepository._create(data);
  }

  async findOne(id: number, relations: string[] = []) {
    const { costCenterCategory } =
      await this.costCenterCategoriesRepository._findOneById(id, relations);

    if (!costCenterCategory) {
      throw new NotFoundCostCenterCategory();
    }

    return {
      costCenterCategory,
    };
  }

  async findAll() {
    return await this.costCenterCategoriesRepository._findAll();
  }

  async toggleActive(id: number): Promise<void> {
    const { costCenterCategory } =
      await this.verifyBudgetPlanValidateForUpdate(id);

    const newActive = !costCenterCategory.active;

    try {
      await this.costCenterCategoriesRepository._update(id, {
        active: newActive,
      });

      this.costCenterSubCategoriesService.toggleActiveMany(
        costCenterCategory.subCategories,
        newActive,
      );
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async toggleActiveMany(
    categories: CostCenterCategory[],
    newActive: boolean,
  ): Promise<void> {
    await Promise.all(
      categories.map(async (category): Promise<void> => {
        await this.costCenterCategoriesRepository._update(category.id, {
          active: newActive,
        });

        await this.costCenterSubCategoriesService.toggleActiveMany(
          category.subCategories,
          newActive,
        );
      }),
    );
  }

  async verifyBudgetPlanValidateForUpdate(costCenterCategoryId: number) {
    const { costCenterCategory } = await this.findOne(costCenterCategoryId, [
      "subCategories",
      "costCenter",
      "costCenter.budgetPlan",
    ]);

    if (
      !OPTIONS_FOR_UPDATE_BUDGET_PLAN.includes(
        costCenterCategory.costCenter.budgetPlan.status,
      )
    ) {
      throw new ForbiddenError();
    }

    return {
      costCenterCategory,
    };
  }

  async duplicateMany(
    costCenterId: number,
    categories: CostCenterCategory[] = [],
  ): Promise<void> {
    await Promise.all(
      categories.map(async (item) => {
        const costCenterCategory =
          await this.costCenterCategoriesRepository._duplicate({
            name: item.name,
            costCenterId,
            active: item.active,
          });

        await this.costCenterSubCategoriesService.duplicateMany(
          costCenterCategory.id,
          item.subCategories,
        );
      }),
    );
  }

  async getOptions(): Promise<optionsCategories[]> {
    return await this.costCenterCategoriesRepository._getOptions();
  }

  private async createSubCategories(
    costCenterCategoryId: number,
    subCategories: Partial<CostCenterSubCategory>[],
  ): Promise<void> {
    try {
      await Promise.all(
        subCategories.map(async (item): Promise<void> => {
          await this.costCenterSubCategoriesService.create({
            name: item.name,
            costCenterCategoryId,
            type: item.type,
            releaseType: item.releaseType,
          });
        }),
      );
    } catch (error) {
      console.error(error);
    }
  }

  async update(id: number, data: UpdateCostCenterCategoryDto): Promise<void> {
    this.validateUpdateRequest(data, id);

    await this.costCenterCategoriesRepository._update(id, data);
  }

  async delete(id: number): Promise<void> {
    this.validateExists(id);

    await this.costCenterCategoriesRepository._delete(id);
  }

  private async validateExists(id: number): Promise<void> {
    const exists = await this.costCenterCategoriesRepository._existsById(id);
    if (!exists) {
      throw new NotFoundCostCenterCategory();
    }
  }

  private async validateDuplicate(
    data: UpdateCostCenterCategoryDto,
    id?: number,
  ): Promise<void> {
    const duplicated = await this.costCenterCategoriesRepository._existsByData(
      data,
      id,
    );
    if (duplicated) {
      throw new DuplicatedCategory();
    }
  }

  private async validateUpdateRequest(
    data: UpdateCostCenterCategoryDto,
    id: number,
  ): Promise<void> {
    this.validateExists(id);
    this.validateDuplicate(data, id);
  }
}
