import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { ForbiddenError, InternalServerError } from "src/common/errors";
import { calcTotalValueInCents } from "src/common/utils/calc-total-value-result";
import { OPTIONS_FOR_UPDATE_BUDGET_PLAN } from "src/modules/budget-plans/constants/options-for-update-budget-plan";
import { CostCenterSubCategoriesService } from "src/modules/cost-centers/services/cost-center-sub-categories.service";
import { CreateBudgetResultDto } from "../dto/create-budget-result.dto";
import { BudgetResultsRepository } from "../repositories/typeorm/budget-results-repository";
import { BudgetsService } from "./budgets.service";

@Injectable()
export class BudgetResultsService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly budgetResultsRepository: BudgetResultsRepository,

    @Inject(forwardRef(() => CostCenterSubCategoriesService))
    private readonly costCenterSubCategoriesService: CostCenterSubCategoriesService,

    @Inject(forwardRef(() => BudgetsService))
    private readonly budgetsService: BudgetsService,
  ) {}

  async createMany({
    months,
    releaseType,
    costCenterSubCategoryId,
    budgetId,
  }: CreateBudgetResultDto): Promise<void> {
    const { budget } = await this.budgetsService.findOne(budgetId, [
      "budgetPlan",
    ]);

    if (!OPTIONS_FOR_UPDATE_BUDGET_PLAN.includes(budget.budgetPlan.status)) {
      throw new ForbiddenError();
    }

    const { costCenterSubCategory } =
      await this.costCenterSubCategoriesService.findOne(
        costCenterSubCategoryId,
      );

    if (
      !costCenterSubCategory.active ||
      releaseType !== costCenterSubCategory.releaseType
    ) {
      throw new ForbiddenError();
    }

    try {
      await Promise.all(
        months.map(async (item): Promise<void> => {
          const { budgetResult } =
            await this.budgetResultsRepository._findOneByBudgetAndSubCategoryAndMonth(
              budgetId,
              costCenterSubCategoryId,
              item.month,
            );

          const totalValueInCents = calcTotalValueInCents(
            costCenterSubCategory.releaseType,
            item,
          );

          if (!budgetResult) {
            return await this.budgetResultsRepository._create({
              valueInCents: totalValueInCents,
              budgetId,
              costCenterCategoryId: costCenterSubCategory.costCenterCategoryId,
              costCenterSubCategoryId,
              month: item.month,
              data: item,
            });
          }

          await this.budgetResultsRepository._update(budgetResult.id, {
            data: item,
            valueInCents: totalValueInCents,
          });
        }),
      );

      this.eventEmitter.emit("budgets.process-value", {
        budgetId,
      });
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async findOne(id: number) {
    const { budgetResult } =
      await this.budgetResultsRepository._findOneById(id);

    if (!budgetResult) {
      throw new NotFoundException();
    }

    return {
      budgetResult,
    };
  }

  async getTotalValueByBudgetAndCategory(budgetId: number, categoryId: number) {
    const { valueInCents } =
      await this.budgetResultsRepository._getTotalInCentsByBudgetIdAndCategoryId(
        budgetId,
        categoryId,
      );

    return {
      valueInCents: valueInCents ?? 0,
    };
  }

  async getTotalValueByBudgetAndSubCategory(
    budgetId: number,
    categoryId: number,
    month: number,
  ) {
    const { budgetResult } =
      await this.budgetResultsRepository._getTotalInCentsByBudgetIdAndSubCategory(
        budgetId,
        categoryId,
        month,
      );

    return {
      valueInCents: budgetResult?.valueInCents ?? 0,
    };
  }

  async getResultLogisticsExpensesByCategory(
    budgetId: number,
    categoryId: number,
  ) {
    const { budgetResults } =
      await this.budgetResultsRepository._findManyByBudgetIdAndCategoryId(
        budgetId,
        categoryId,
      );

    const calcData = budgetResults.reduce(
      (acc, cur) => {
        const item = cur?.data;

        const totalTripsOfPeople = item?.numberOfPeople * item?.totalTrips;

        acc.totalAirfareInCents += totalTripsOfPeople * item?.airfareInCents;

        acc.totalAccommodationInCents +=
          totalTripsOfPeople *
          item?.dailyAccommodation *
          item?.accommodationInCents;

        acc.totalExpensesInCents +=
          totalTripsOfPeople * item?.dailyFood * item?.foodInCents +
          totalTripsOfPeople * item?.dailyTransport * item?.transportInCents +
          totalTripsOfPeople * item?.dailyCarAndFuel * item?.carAndFuelInCents;

        return acc;
      },
      {
        totalExpensesInCents: 0,
        totalAirfareInCents: 0,
        totalAccommodationInCents: 0,
      },
    );

    return {
      data: calcData,
    };
  }

  async getTotalValueByBudgetCategoryAndMonth(
    isFilter = false,
    budgetId: number,
    categoryId: number,
    month: number,
  ) {
    const { valueInCents } =
      await this.budgetResultsRepository._getTotalInCentsByBudgetAndCategoryAndMonth(
        isFilter,
        budgetId,
        categoryId,
        month,
      );

    return {
      valueInCents: valueInCents ?? 0,
    };
  }

  async getManyByBudgetIdAndSubCategoryId(
    budgetId: number,
    subCategoryId: number,
  ) {
    const { budgetResults } =
      await this.budgetResultsRepository._findManyByBudgetIdAndSubCategoryId(
        budgetId,
        subCategoryId,
      );

    return {
      budgetResults: budgetResults.map((item) => {
        return {
          ...item,
          ...item.data,
          data: null,
        };
      }),
    };
  }

  async remove(id: number): Promise<void> {
    const { budgetResult } = await this.findOne(id);

    const { budget } = await this.budgetsService.findOne(
      budgetResult.budgetId,
      ["budgetPlan"],
    );

    if (!OPTIONS_FOR_UPDATE_BUDGET_PLAN.includes(budget.budgetPlan.status)) {
      throw new ForbiddenError();
    }

    try {
      await this.budgetResultsRepository._delete(budgetResult.id);

      this.eventEmitter.emit("budgets.process-value", {
        budgetId: budget.id,
      });
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async getManyLastYear(budgetId: number, subCategoryId: number) {
    const { costCenterSubCategory } =
      await this.costCenterSubCategoriesService.findOne(subCategoryId, [
        "costCenterCategory",
      ]);

    const { oldBudget } = await this.budgetsService.findOneLastYear(budgetId);

    const { budgetResults } =
      await this.budgetResultsRepository._findManyByBudgetIdAndSubCategoryName(
        oldBudget.id,
        costCenterSubCategory,
      );

    return {
      budgetResults: budgetResults.map((item) => {
        return {
          ...item,
          ...item.data,
          data: null,
        };
      }),
    };
  }

  @OnEvent("budget.duplicated", { async: true })
  private async _duplicateManyByOldBudgetId({
    budgetPlanId,
    budgetId,
    oldBudgetId,
  }: {
    budgetPlanId: number;
    budgetId: number;
    oldBudgetId: number;
  }): Promise<void> {
    const { budgetResults } =
      await this.budgetResultsRepository._findManyByBudgetId(oldBudgetId);

    try {
      let duplicatedCount = 0;
      let skippedCount = 0;

      await Promise.all(
        budgetResults.map(async (item) => {
          const categoryName =
            item.costCenterSubCategory?.costCenterCategory?.name;
          const costCenterName =
            item.costCenterSubCategory?.costCenterCategory?.costCenter?.name;

          const { costCenterSubCategory } =
            await this.costCenterSubCategoriesService.getOneByNameAndBudgetPlan(
              item.costCenterSubCategory.name,
              budgetPlanId,
              categoryName,
              costCenterName,
            );

          if (costCenterSubCategory) {
            await this.budgetResultsRepository._duplicate({
              ...item,
              budgetId,
              costCenterCategoryId: costCenterSubCategory.costCenterCategoryId,
              costCenterSubCategoryId: costCenterSubCategory.id,
            });
            duplicatedCount++;
          } else {
            skippedCount++;
            console.error(
              `[DUPLICAÇÃO BUDGET RESULTS] Subcategoria não encontrada: "${item.costCenterSubCategory.name}" ` +
                `(Categoria: "${categoryName}", Cost Center: "${costCenterName}", BudgetPlan: ${budgetPlanId})`,
            );
          }
        }),
      );

      console.log(
        `[DUPLICAÇÃO BUDGET RESULTS] Concluída: ${duplicatedCount} duplicados, ${skippedCount} ignorados`,
      );
    } catch (e) {
      console.error(
        `[DUPLICAÇÃO BUDGET RESULTS] Erro durante duplicação:`,
        e,
      );
      throw new InternalServerError();
    }
  }
}
