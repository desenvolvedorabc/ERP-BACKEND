/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { CashFlowReportRepository } from "../repositories/cashflow-reports-repository";
import { isValid, parse } from "date-fns";
import { BaseTypeCashFlow, BaseTypeCashFlowChart } from "../types/cashflow";
import { generateCsv } from "src/common/utils/lib/generate-csv";
import { FormatCashflowForCSV } from "src/common/mappers/csv/format-cashflow-for-csv";
import { NoDataToExportError } from "../errors";
import { ReportPositionParamsDTO } from "../dtos/reportFilterParams.dto";

@Injectable()
export class CashflowReportService {
  constructor(
    private readonly cashFlowReportRepository: CashFlowReportRepository,
  ) {}

  async getCashFlowReport(params: ReportPositionParamsDTO): Promise<{
    Payables: BaseTypeCashFlow[];
    Receivables: BaseTypeCashFlow[];
  }> {
    try {
      const accounts =
        await this.cashFlowReportRepository.findCashFlowReportData(params);

      return {
        Payables: [...accounts.payableData, ...accounts.cardMov],
        Receivables: accounts.receivableData,
      };
    } catch (error) {
      console.error(error);
    }
  }

  async getCashFlowReportForChart(params: ReportPositionParamsDTO) {
    try {
      const data =
        await this.cashFlowReportRepository.findCashFlowReportDataForGraph(
          params,
        );
      return this.transformCashFlowGraphData(data);
    } catch (error) {
      console.error(error);
    }
  }

  async getCashFlowCSV(params: ReportPositionParamsDTO) {
    try {
      const data =
        await this.cashFlowReportRepository.findCashFlowReportData(params);

      if (
        data.payableData.length === 0 &&
        data.receivableData.length === 0 &&
        data.cardMov.length === 0 &&
        data.bankRecon.length === 0
      ) {
        throw new NoDataToExportError();
      }
      const formattedData = FormatCashflowForCSV(data);

      const { csvData } = generateCsv(formattedData);

      return {
        csvData,
      };
    } catch (error) {
      console.error(error);
    }
  }

  private transformCashFlowGraphData(data: BaseTypeCashFlowChart[]) {
    const aggregatedData = this.aggregateDates(data);
    return this.sortDates(aggregatedData);
  }

  private aggregateDates(data: BaseTypeCashFlowChart[]) {
    const aggregateDates = data.reduce(
      (acc, curr) => {
        const currItem = acc[curr.Installments_dueDate];

        if (!currItem) {
          acc[curr.Installments_dueDate] = curr;
        } else {
          currItem.REALIZED += curr.REALIZED;
          currItem.EXPECTED += curr.EXPECTED;
        }
        return acc;
      },
      {} as { [key: string]: BaseTypeCashFlowChart },
    );

    return Object.values(aggregateDates);
  }

  private sortDates(data: BaseTypeCashFlowChart[]) {
    const refDate = new Date();
    return data.sort((a, b) => {
      try {
        const dateA = parse(a.Installments_dueDate, "dd/MM/yyyy", refDate);
        const dateB = parse(b.Installments_dueDate, "dd/MM/yyyy", refDate);

        if (isValid(dateA) && isValid(dateB)) {
          return dateA.getTime() - dateB.getTime();
        } else {
          console.error(
            "Invalid date found while sorting:",
            a.Installments_dueDate,
            b.Installments_dueDate,
          );
          return 0;
        }
      } catch (error) {
        console.error(error);
        return 0;
      }
    });
  }
}
