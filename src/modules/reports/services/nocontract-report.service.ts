/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { NoContractSuppliersReportRepository } from "../repositories/no-contract-suppliers-report-repository";
import { ReportPositionParamsDTO } from "../dtos/reportFilterParams.dto";
import { NoDataToExportError } from "../errors";
import { FormatNoContractsReportForCSV } from "src/common/mappers/csv/format-noContracts-for-csv";
import { generateCsv } from "src/common/utils/lib/generate-csv";
import {
  NoContractRawData,
  TransformedNoContractsData,
} from "../types/noContracts";

@Injectable()
export class NoContractReportService {
  constructor(
    private readonly noContractSuppliersReportRepository: NoContractSuppliersReportRepository,
  ) {}

  async getNoContractSuppliersReport(params: ReportPositionParamsDTO) {
    try {
      const data =
        await this.noContractSuppliersReportRepository.findNoContractSuppliersReportData(
          params,
        );

      return this.transformNoContractsSupplierData(data);
    } catch (error) {
      console.error(error);
    }
  }

  async getNoContractsCSV(params: ReportPositionParamsDTO) {
    try {
      const data =
        await this.noContractSuppliersReportRepository.findNoContractSuppliersReportData(
          params,
        );

      if (data.length === 0) {
        throw new NoDataToExportError();
      }

      const formattedData = FormatNoContractsReportForCSV(data);

      const { csvData } = generateCsv(formattedData);

      return {
        csvData,
      };
    } catch (error) {
      console.error(error);
    }
  }

  private transformNoContractsSupplierData(rawData: Array<NoContractRawData>) {
    const uncategorized = "Não categorizado";
    const groupedData: Record<string, TransformedNoContractsData> = {};

    for (const curr of rawData) {
      const clientKey = curr.Supplier_id;

      if (!groupedData[clientKey]) {
        groupedData[clientKey] = {
          id: curr.Supplier_id,
          name: curr.Supplier_name,
          total: curr.total,
          budgetPlan: [],
        };
      } else {
        groupedData[clientKey].total += curr.total;
      }

      let budgetPlan = groupedData[clientKey].budgetPlan.find(
        (c) => c.id === (curr.BudgetPlan_id ?? uncategorized),
      );

      if (!budgetPlan) {
        budgetPlan = {
          id: curr.BudgetPlan_id ?? uncategorized,
          name: curr.budgetPlan_name ?? uncategorized,
          total: curr.total,
        };
        groupedData[clientKey].budgetPlan.push(budgetPlan);
      } else {
        budgetPlan.total += curr.total;
      }
    }

    return Object.values(groupedData).filter(
      Boolean,
    ) as Array<TransformedNoContractsData>;
  }
}
