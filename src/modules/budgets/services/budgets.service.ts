import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { InternalServerError } from "src/common/errors";
import { DuplicateBudgetPlanPayload } from "src/common/events/payloads";
import { numbersOfMonths } from "src/common/utils/constants/months";
import { OPTIONS_FOR_UPDATE_BUDGET_PLAN } from "src/modules/budget-plans/constants/options-for-update-budget-plan";
import { BudgetPlansService } from "src/modules/budget-plans/services/budget-plans.service";
import { CostCentersService } from "src/modules/cost-centers/services/cost-centers.service";
import { CreateBudgetDto } from "../dto/create-budget.dto";
import { PaginateParamsBudgets } from "../dto/paginate-params-budgets";
import { Budget } from "../entities/budget.entity";
import { ConflictExceptionBudget, NotFoundBudget } from "../errors";
import { BudgetsRepository } from "../repositories/typeorm/budgets-repository";
import { BudgetResultsService } from "./budget-results.service";

@Injectable()
export class BudgetsService {
  constructor(
    @Inject(forwardRef(() => BudgetPlansService))
    private budgetPlansService: BudgetPlansService,

    @Inject(forwardRef(() => BudgetResultsService))
    private budgetResultsService: BudgetResultsService,

    @Inject(forwardRef(() => CostCentersService))
    private costCentersService: CostCentersService,

    private readonly eventEmitter: EventEmitter2,

    private readonly budgetsRepository: BudgetsRepository,
  ) {}

  async create(dto: CreateBudgetDto, userId: number) {
    const { budgetPlanId, partnerMunicipalityId, partnerStateId } = dto;

    if (
      (!partnerMunicipalityId && !partnerStateId) ||
      (partnerMunicipalityId && partnerStateId)
    ) {
      throw new BadRequestException(
        "Informe apenas um estado parceiro ou um município.",
      );
    }

    await this.budgetPlansService.verifyBudgetPlanByStatus(
      budgetPlanId,
      OPTIONS_FOR_UPDATE_BUDGET_PLAN,
    );

    await this.validateExistsBudgetByPartners(dto);

    try {
      const budget = await this.budgetsRepository._create(dto);

      this.eventEmitter.emit("budgetPlans.update", {
        budgetPlanId: dto.budgetPlanId,
        userId,
      });

      return {
        id: budget.id,
      };
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async findOne(id: number, relations: string[] = []) {
    const { budget } = await this.budgetsRepository._findOneById(id, relations);

    if (!budget) {
      throw new NotFoundBudget();
    }

    return {
      budget,
    };
  }

  async findOneLastYear(budgetId: number) {
    const { budget: currentBudget } = await this.findOne(budgetId, [
      "budgetPlan",
    ]);

    const lastYearBudgetPlan = currentBudget.budgetPlan.year - 1;

    const { budgetPlan: oldBudgetPlan } =
      await this.budgetPlansService.findOneByLastYear(
        lastYearBudgetPlan,
        currentBudget.budgetPlan.programId,
      );

    const { budget: oldBudget } =
      await this.budgetsRepository._findOneByBudgetPlanAndPartner(
        oldBudgetPlan.id,
        currentBudget,
      );

    if (!oldBudget) {
      throw new NotFoundBudget();
    }

    return {
      oldBudget,
    };
  }

  async findOneWithResults(id: number) {
    const { budget } = await this.budgetsRepository._findOneWithResultsById(id);

    if (!budget) {
      throw new NotFoundBudget();
    }

    return {
      budget,
    };
  }

  async remove(id: number): Promise<void> {
    const { budget } = await this.findOne(id);

    await this.budgetPlansService.verifyBudgetPlanByStatus(
      budget.budgetPlanId,
      OPTIONS_FOR_UPDATE_BUDGET_PLAN,
    );

    try {
      await this.budgetsRepository._delete(budget.id);

      this.eventEmitter.emit("budgetPlans.process-value", {
        budgetPlanId: budget.budgetPlanId,
      });
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async findAllForMonth(dto: PaginateParamsBudgets) {
    const isFilter = !!dto.partnerMunicipalityId || !!dto.partnerStateId;

    const { costCenters } =
      await this.costCentersService.getManyActiveWithResultsByBudgetPlanId(
        dto.budgetPlanId,
        isFilter,
      );

    const { budget } =
      await this.budgetsRepository._findOneByBudgetPlanAndPartner(
        dto.budgetPlanId,
        {
          partnerMunicipalityId: dto?.partnerMunicipalityId,
          partnerStateId: dto?.partnerStateId,
        },
      );

    const formattedCostCenters = await Promise.all(
      costCenters.map(async (costCenter) => {
        const formattedCategories = await Promise.all(
          costCenter.categories.map(async (category) => {
            const { formattedItems } = await this.formattedMonthsForPaginate(
              isFilter,
              budget?.id,
              category.id,
            );
            const valueInCents = formattedItems.reduce(
              (acc, cur) => acc + +cur.valueInCents,
              0,
            );

            return { valueInCents, ...category, months: formattedItems };
          }),
        );

        const valueInCents = formattedCategories.reduce(
          (acc, cur) => acc + +cur.valueInCents,
          0,
        );

        return {
          valueInCents,
          ...costCenter,
          categories: formattedCategories,
        };
      }),
    );
    console.log({
      costCenters: formattedCostCenters,
      data: { numbersOfMonths, budgetId: budget?.id },
    });
    return {
      costCenters: formattedCostCenters,
      data: { numbersOfMonths, budgetId: budget?.id },
    };
  }

  async findAll(dto: PaginateParamsBudgets) {
    if (dto.isForMonth) {
      return await this.findAllForMonth(dto);
    }

    const isFilter = !!dto.partnerMunicipalityId || !!dto.partnerStateId;

    const { costCenters } =
      await this.costCentersService.getManyActiveWithResultsByBudgetPlanId(
        dto.budgetPlanId,
        isFilter,
      );

    const data = await this.budgetsRepository._findAll(dto);

    const formattedCostCenters = await Promise.all(
      costCenters.map(async (costCenter) => {
        const formattedCategories = await Promise.all(
          costCenter.categories.map(async (category) => {
            if (!category.id) return;
            const { formattedItems } = await this.formattedBudgetsForPaginate(
              data.items,
              category.id,
            );
            const valueInCents = formattedItems.reduce(
              (acc, cur) => acc + +cur.valueInCents,
              0,
            );

            return { valueInCents, ...category, budgets: formattedItems };
          }),
        );

        const valueInCents = formattedCategories.reduce(
          (acc, cur) => acc + +cur.valueInCents,
          0,
        );

        return {
          valueInCents,
          ...costCenter,
          categories: formattedCategories,
        };
      }),
    );

    return { costCenters: formattedCostCenters, ...data };
  }

  async countPartnersByBudgetPlanId(budgetPlanId: number) {
    const { countPartnerMunicipalities } =
      await this.budgetsRepository._countPartnerMunicipalitiesByBudgetPlanId(
        budgetPlanId,
      );
    const { countPartnerStates } =
      await this.budgetsRepository._countPartnerStatesByBudgetPlanId(
        budgetPlanId,
      );

    return {
      countPartnerStates,
      countPartnerMunicipalities,
    };
  }

  async findManyByBudgetPlanId(budgetPlanId: number) {
    const data = await this.budgetsRepository._findAll({
      page: 0,
      limit: 0,
      partnerMunicipalityId: null,
      partnerStateId: null,
      budgetPlanId,
      isCsv: true,
      isForMonth: 0,
    });

    return {
      budgets: data.items,
    };
  }

  @OnEvent("budgets.process-value", { async: true })
  private async processValue({ budgetId }: { budgetId: number }) {
    const { budget } = await this.findOne(budgetId);
    const { valueInCents } =
      await this.budgetsRepository._findOneWithTotalById(budgetId);

    try {
      await this.budgetsRepository._update(budgetId, {
        valueInCents,
      });

      this.eventEmitter.emit("budgetPlans.process-value", {
        budgetPlanId: budget.budgetPlanId,
      });
    } catch (e) {
      throw new InternalServerError();
    }
  }

  @OnEvent("budgetPlan.duplicated-budgets", { async: true })
  private async duplicateManyByOldBudgetPlanId({
    budgetPlanId,
    oldBudgetPlanId,
  }: DuplicateBudgetPlanPayload): Promise<void> {
    const { budgets } =
      await this.budgetsRepository._findManyByBudgetPlanId(oldBudgetPlanId);

    try {
      await Promise.all(
        budgets.map(async (item) => {
          const budget = await this.budgetsRepository._duplicate({
            ...item,
            budgetPlanId,
          });

          this.eventEmitter.emit("budget.duplicated", {
            budgetPlanId,
            budgetId: budget.id,
            oldBudgetId: item.id,
          });
        }),
      );
    } catch (e) {
      throw new InternalServerError();
    }
  }

  private async formattedBudgetsForPaginate(
    data: Budget[],
    categoryId: number,
  ) {
    const formattedItems = await Promise.all(
      data.map(async (item) => {
        const { valueInCents } =
          await this.budgetResultsService.getTotalValueByBudgetAndCategory(
            item.id,
            categoryId,
          );

        return {
          id: item.id,
          valueInCents,
        };
      }),
    );

    return {
      formattedItems,
    };
  }

  async removeByBudgetPlanId(budgetPlanId: number): Promise<void> {
    await this.budgetsRepository._removeByBudgetPlanId(budgetPlanId);
  }

  private async formattedMonthsForPaginate(
    isFilter = false,
    budgetId: number,
    categoryId: number,
  ) {
    const formattedItems = await Promise.all(
      numbersOfMonths.map(async (month) => {
        const { valueInCents } =
          await this.budgetResultsService.getTotalValueByBudgetCategoryAndMonth(
            isFilter,
            budgetId,
            categoryId,
            month,
          );

        return {
          month,
          valueInCents,
        };
      }),
    );

    return {
      formattedItems,
    };
  }

  private async validateExistsBudgetByPartners(
    dto: CreateBudgetDto,
  ): Promise<void> {
    if (dto.partnerMunicipalityId) {
      const { budget } =
        await this.budgetsRepository._findOneByPartnerMunicipalityIdAndBudgetPlanId(
          dto.budgetPlanId,
          dto.partnerMunicipalityId,
        );

      if (budget) {
        throw new ConflictExceptionBudget();
      }
    }

    if (dto.partnerStateId) {
      const { budget } =
        await this.budgetsRepository._findOneByPartnerStateIdAndBudgetPlanId(
          dto.budgetPlanId,
          dto.partnerStateId,
        );

      if (budget) {
        throw new ConflictExceptionBudget();
      }
    }
  }
}
