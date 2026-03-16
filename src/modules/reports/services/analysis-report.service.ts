/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { ReportPositionParamsDTO } from "../dtos/reportFilterParams.dto";
import { AnalysisReportRepository } from "../repositories/analysis-report-repository";
import {
  HashInitialTransformedData,
  Item,
  RawData,
  TransformedAnalysisData,
} from "../types/analysis";
import { DueBetweenDTO } from "src/common/DTOs/dueBetween.dto";
import { eachMonthOfInterval, format } from "date-fns";
import { NoDataToExportError } from "../errors";
import { FormatAnalysisForCSV } from "src/common/mappers/csv/format-analysis-for-csv";
import { generateCsv } from "src/common/utils/lib/generate-csv";

@Injectable()
export class AnalysisReportService {
  constructor(private readonly repo: AnalysisReportRepository) {}

  async getAnalysisReceivables(params: ReportPositionParamsDTO) {
    try {
      const data = await this.repo.findReceivables(params);

      return this.transformData(data, params.dueBetween);
    } catch (error) {
      console.error(error);
    }
  }

  async chartReceivables() {
    try {
      const data = await this.repo.groupByFinanciers();

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  async getAnalysisPayables(params: ReportPositionParamsDTO) {
    try {
      const data = await this.repo.findPayables(params);

      return this.transformData(data, params.dueBetween);
    } catch (error) {
      console.error(error);
    }
  }

  async exportCSV(params: ReportPositionParamsDTO, type: "r" | "p") {
    try {
      let data =
        type === "p"
          ? await this.repo.findPayables(params)
          : await this.repo.findReceivables(params);

      const bankReconData =
        await this.repo.findBankReconciliationReport(params);

      data = [...data, ...bankReconData];

      if (!data?.length) {
        throw new NoDataToExportError();
      }

      const formmatedData = FormatAnalysisForCSV(data);

      const { csvData } = generateCsv(formmatedData);

      return {
        csvData,
      };
    } catch (error) {
      console.error(error);
    }
  }

  private transformData(rawData: Array<RawData>, dueBetween: DueBetweenDTO) {
    const cloneMonthsBetween = (
      monthsBetween: Record<string, Item>,
    ): Record<string, Item> => {
      return Object.keys(monthsBetween).reduce(
        (acc, key) => {
          acc[key] = { ...monthsBetween[key] };
          return acc;
        },
        {} as Record<string, Item>,
      );
    };

    const groupedData: HashInitialTransformedData = {};
    const monthsBetween: Record<string, Item> = {} as Record<string, Item>;
    const uncategorized = "Não categorizado";

    let totalValueOfPeriod = 0;
    eachMonthOfInterval(dueBetween)
      .sort((a, b) => b.getTime() - a.getTime())
      .forEach((month) => {
        const monthYear = format(month, "MM/yy");
        monthsBetween[monthYear] = {
          monthYear,
          total: 0,
        };
      });

    for (const curr of rawData) {
      let currentBudget = groupedData[curr.BudgetPlan_id];
      if (!currentBudget) {
        groupedData[curr.BudgetPlan_id ?? uncategorized] = {
          id: curr.BudgetPlan_id ?? uncategorized,
          name: curr.BudgetPlan_name ?? uncategorized,
          total: 0,
          itens: cloneMonthsBetween(monthsBetween),
          CostCenter: {},
        };
        currentBudget = groupedData[curr.BudgetPlan_id ?? uncategorized];
      }
      currentBudget.total += curr.total;
      totalValueOfPeriod += curr.total;

      const currentBudgetItem = currentBudget.itens[curr.monthYear];
      currentBudgetItem.total += curr.total;

      let currentCostCenter = currentBudget.CostCenter[curr.CostCenter_id];
      if (!currentCostCenter) {
        currentBudget.CostCenter[curr.CostCenter_id ?? uncategorized] = {
          id: curr.CostCenter_id ?? uncategorized,
          name: curr.CostCenter_name ?? uncategorized,
          total: 0,
          itens: cloneMonthsBetween(monthsBetween),
        };
        currentCostCenter =
          currentBudget.CostCenter[curr.CostCenter_id ?? uncategorized];
      }

      currentCostCenter.total += curr.total;

      const currentCostCenterItem = currentCostCenter.itens[curr.monthYear];
      currentCostCenterItem.total += curr.total;
    }

    return {
      totalValueOfPeriod,
      data: this.transformHashToArrays(groupedData),
    };
  }

  private transformHashToArrays(
    hash: HashInitialTransformedData,
  ): TransformedAnalysisData["budgetPlans"] {
    const result: TransformedAnalysisData["budgetPlans"] = [];

    Object.values(hash).forEach((budgetPlan) => {
      const costCenterArray = Object.values(budgetPlan.CostCenter).map(
        (costCenter) => ({
          ...costCenter,
          itens: Object.values(costCenter.itens),
        }),
      );

      result.push({
        ...budgetPlan,
        CostCenter: costCenterArray,
        itens: Object.values(budgetPlan.itens),
      });
    });

    return result;
  }
}
