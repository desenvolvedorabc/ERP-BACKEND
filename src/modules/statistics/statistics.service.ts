import { getPeriod } from "./../../common/utils/date";
import { Injectable } from "@nestjs/common";
import {
  StatisticsRepository,
  GroupedTotal,
} from "./repositories/statistics-repository";
import {
  calculatePercentage,
  calculateVariation,
} from "src/common/utils/calculate-variation";
import {
  CostCentersData,
  Expenses,
  Revenue,
  TopCostCenters,
  TopFinanciers,
} from "./dtos/dashboard-statistics.dto";
import { subMonths } from "date-fns";

@Injectable()
export class StatisticsService {
  constructor(private readonly statisticsRepository: StatisticsRepository) {}

  async getCostCentersStats(): Promise<
    Expenses &
      TopCostCenters & {
        barChartCostCenterPayment: Array<CostCentersData>;
      }
  > {
    const stats = await this.getStats(
      this.statisticsRepository.getTotalCostCenters.bind(
        this.statisticsRepository,
      ),
    );

    return {
      totalExpenses: stats.totalCurrent,
      expensesVariation: stats.variationResult.variation,
      expensesVariationSignal: stats.variationResult.signal,

      nameTopCostCenter: stats.topCurrent?.id || "",
      totalTopCostCentersExpenses: stats.topCurrent?.total,
      topCostCentersVariation: stats.topVariation.variation,
      topCostCentersVariationExpensesSignal: stats.topVariation.signal,
      barChartCostCenterPayment: stats.groupedCurrent.map(({ id, total }) => {
        let percentage = (total / stats.totalCurrent) * 100;
        if (isNaN(percentage) || !isFinite(percentage)) {
          percentage = 0;
        }
        return {
          name: id as string,
          percentage,
        };
      }),
    };
  }

  async getFinanciersStats(): Promise<Revenue & TopFinanciers> {
    const stats = await this.getStats(
      this.statisticsRepository.getTotalFinaciers.bind(
        this.statisticsRepository,
      ),
    );

    return {
      totalRevenue: stats.totalCurrent,
      revenueVariation: stats.variationResult.variation,
      revenueVariationSignal: stats.variationResult.signal,

      nameTopFinancier: stats.topCurrent?.id || "",
      totalTopFinanciers: calculatePercentage(
        stats.topCurrent?.total || 0,
        stats?.totalCurrent || 0,
      ),
      topFinanciersVariation: stats.topVariation.variation,
      topFinanciersVariationSignal: stats.topVariation.signal,
    };
  }

  private async getStats(
    getTotalFunction: (
      startDate: Date,
      endDate: Date,
    ) => Promise<GroupedTotal[]>,
  ): Promise<{
    groupedCurrent: GroupedTotal[];
    totalCurrent: number;
    totalPrevious: number;
    variationResult: { variation: string; signal: string };
    topCurrent: GroupedTotal;
    topPrevious: GroupedTotal;
    topVariation: { variation: string; signal: string };
  }> {
    const currentDate = new Date();
    const { startDate, endDate } = getPeriod(currentDate);
    const previousStartDate = subMonths(startDate, 2);
    const previousEndDate = subMonths(endDate, 2);

    const [current, previous] = await Promise.all([
      getTotalFunction(subMonths(startDate, 1), subMonths(endDate, 1)),
      getTotalFunction(previousStartDate, previousEndDate),
    ]);

    const totalCurrent = this.calculateTotal<GroupedTotal>(current, "total");
    const totalPrevious = this.calculateTotal<GroupedTotal>(previous, "total");
    const variationResult = calculateVariation(totalCurrent, totalPrevious);

    const topCurrent = current[0];
    const topPrevious = previous[0];
    const topVariation = calculateVariation(
      topCurrent?.total || 0,
      topPrevious?.total,
    );

    return {
      groupedCurrent: current,
      totalCurrent,
      totalPrevious,
      variationResult,
      topCurrent,
      topPrevious,
      topVariation,
    };
  }

  private calculateTotal<T>(items: T[], key: keyof T): number {
    return items.reduce((acc, item) => acc + Number(item[key]), 0);
  }
}
