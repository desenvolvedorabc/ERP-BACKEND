import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { ForbiddenError, InternalServerError } from "src/common/errors";
import {
  CreateBudgetPlanPayload,
  DuplicateBudgetPlanPayload,
} from "src/common/events/payloads";
import { OPTIONS_FOR_UPDATE_BUDGET_PLAN } from "src/modules/budget-plans/constants/options-for-update-budget-plan";
import { BudgetResultsService } from "src/modules/budgets/services/budget-results.service";
import {
  defaultCostCenters,
  initialCostCenters,
} from "../constants/initial-cost-center";
import { CreateCostCenterDto } from "../dto/create-cost-center.dto";
import { optionsCostCenter } from "../dto/optionsCostCenter";
import { UpdateCostCenterDto } from "../dto/update-cost-center.dto";
import { CostCenter } from "../entities/cost-center.entity";
import { DuplicatedCostCenter, NotFoundCostCenter } from "../errors";
import {
  CostCentersRepository,
  ResponseCostCenter,
} from "../repositories/typeorm/cost-centers-repository";
import { CostCenterCategoriesService } from "./cost-center-categories.service";

@Injectable()
export class CostCentersService {
  constructor(
    @Inject(forwardRef(() => BudgetResultsService))
    private budgetResultsService: BudgetResultsService,

    private readonly eventEmitter: EventEmitter2,

    private costCenterCategoriesService: CostCenterCategoriesService,

    private costCentersRepository: CostCentersRepository,
  ) {}

  async createMany({
    budgetPlanId,
    program,
  }: CreateBudgetPlanPayload): Promise<void> {
    const constCenters = initialCostCenters[program] ?? defaultCostCenters;

    try {
      await Promise.all(
        constCenters.map(async (item) => {
          const costCenter = await this.costCentersRepository._create({
            budgetPlanId,
            name: item.name,
            type: item.type,
          });

          await this.createCategories(costCenter.id, item.categories);
        }),
      );
    } catch (e) {
      console.error(e);
      throw new InternalServerError();
    }
  }

  @OnEvent("budgetPlan.duplicated", { async: false })
  async duplicateManyByOldBudgetPlanId({
    budgetPlanId,
    oldBudgetPlanId,
  }: DuplicateBudgetPlanPayload): Promise<void> {
    const { costCenters } =
      await this.costCentersRepository._findManyByBudgetPlanId(oldBudgetPlanId);

    try {
      await Promise.all(
        costCenters.map(async (item) => {
          const costCenter = await this.costCentersRepository._duplicate({
            budgetPlanId,
            name: item.name,
            active: item.active,
            type: item.type,
          });

          await this.costCenterCategoriesService.duplicateMany(
            costCenter.id,
            item.categories,
          );
        }),
      );

      this.eventEmitter.emit("budgetPlan.duplicated-budgets", {
        budgetPlanId,
        oldBudgetPlanId,
      });
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async create(data: CreateCostCenterDto): Promise<void> {
    this.validateDuplicate(data);

    await this.costCentersRepository._create(data);
  }

  async update(id: number, data: UpdateCostCenterDto): Promise<void> {
    this.validateUpdateRequest(data, id);

    await this.costCentersRepository._update(id, data);
  }

  async delete(id: number): Promise<void> {
    this.validateExists(id);

    await this.costCentersRepository._delete(id);
  }

  async removeByBudgetPlanId(budgetPlanId: number): Promise<void> {
    await this.costCentersRepository._removeByBudgetPlanId(budgetPlanId);
  }

  async getManyByBudgetPlanId(id: number) {
    const { costCenters } =
      await this.costCentersRepository._findManyByBudgetPlanId(id);

    return {
      costCenters,
    };
  }

  async getManyActiveByBudgetPlanId(id: number, isSelectSubCategories = true) {
    const { costCenters } =
      await this.costCentersRepository._findManyActiveByBudgetPlanId(
        id,
        isSelectSubCategories,
      );

    return {
      costCenters,
    };
  }

  async getManyActiveWithResultsByBudgetPlanId(id: number, isFilter = false) {
    const { costCenters } =
      await this.costCentersRepository._findManyActiveByBudgetPlanId(id, false);

    if (isFilter) {
      return {
        costCenters,
      };
    }

    const formattedCostCenters = await Promise.all(
      costCenters.map(async (costCenter) => {
        const formattedCategories = await Promise.all(
          costCenter.categories.map(async (category) => {
            const { valueInCents } =
              await this.budgetResultsService.getTotalValueByBudgetAndCategory(
                null,
                category.id,
              );

            return {
              ...category,
              valueInCents,
            };
          }),
        );

        const valueInCents = formattedCategories.reduce(
          (acc, cur) => acc + +cur.valueInCents,
          0,
        );

        return {
          ...costCenter,
          valueInCents,
          categories: formattedCategories,
        };
      }),
    );

    return {
      costCenters: formattedCostCenters,
    };
  }

  async getManyActiveWithResultsByBudgetYear(year: number) {
    const { costCenters } =
      await this.costCentersRepository._findManyActiveByBudgetYear(year);

    const formattedCostCenters = await Promise.all(
      costCenters.map(async (costCenter) => {
        const formattedCategories = await Promise.all(
          costCenter.categories.map(async (category) => {
            const { valueInCents } =
              await this.budgetResultsService.getTotalValueByBudgetAndCategory(
                null,
                category.id,
              );

            return {
              ...category,
              valueInCents,
            };
          }),
        );

        const valueInCents = formattedCategories.reduce(
          (acc, cur) => acc + +cur.valueInCents,
          0,
        );

        return {
          ...costCenter,
          valueInCents,
          categories: formattedCategories,
        };
      }),
    );

    return {
      costCenters: formattedCostCenters,
    };
  }

  async findOne(
    id: number,
    relations: string[] = [],
  ): Promise<ResponseCostCenter> {
    const { costCenter } = await this.costCentersRepository._findOneById(
      id,
      relations,
    );

    if (!costCenter) {
      throw new NotFoundCostCenter();
    }

    return {
      costCenter,
    };
  }

  async findAll(): Promise<CostCenter[]> {
    return await this.costCentersRepository._findAll();
  }

  async toggleActive(id: number): Promise<void> {
    const { costCenter } = await this.findOne(id, [
      "budgetPlan",
      "categories",
      "categories.subCategories",
    ]);

    if (
      !OPTIONS_FOR_UPDATE_BUDGET_PLAN.includes(costCenter.budgetPlan.status)
    ) {
      throw new ForbiddenError();
    }

    const newActive = !costCenter.active;

    try {
      await this.costCentersRepository._update(id, {
        active: newActive,
      });

      await this.costCenterCategoriesService.toggleActiveMany(
        costCenter.categories,
        newActive,
      );
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async getOptions(): Promise<optionsCostCenter[]> {
    return await this.costCentersRepository._getOptions();
  }

  private async createCategories(
    costCenterId: number,
    categories = [],
  ): Promise<void> {
    try {
      await Promise.all(
        categories.map(async (item) => {
          await this.costCenterCategoriesService.createWithSubcategories({
            name: item.name,
            costCenterId,
            subCategories: item.sub_categories,
          });
        }),
      );
    } catch (error) {
      console.error(error);
    }
  }

  private async validateExists(id: number): Promise<void> {
    const exists = await this.costCentersRepository._existsById(id);
    if (!exists) {
      throw new NotFoundCostCenter();
    }
  }

  private async validateDuplicate(data: CreateCostCenterDto): Promise<void> {
    const duplicated = await this.costCentersRepository._existsByData(data);
    if (duplicated) {
      throw new DuplicatedCostCenter();
    }
  }

  private async validateUpdateRequest(
    data: CreateCostCenterDto,
    id: number,
  ): Promise<void> {
    this.validateExists(id);
    this.validateDuplicate(data);
  }
}
