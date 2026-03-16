/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { GeneralReportRepository } from "../repositories/general-report-repository";
import { GeneralReportParamsDTO } from "../dtos/generalReportParams.dto";
import { NoDataToExportError } from "../errors";
import { generateCsv } from "src/common/utils/lib/generate-csv";

@Injectable()
export class GeneralReportService {
  constructor(
    private readonly generalReportsRepository: GeneralReportRepository,
  ) {}

  async getGeneralReport(params: GeneralReportParamsDTO) {
    try {
      return await this.generalReportsRepository.unifiedReport(params);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async exportCSV(params: GeneralReportParamsDTO) {
    try {
      const data = await this.generalReportsRepository.unionReportCSV(params);

      if (!data?.length) {
        throw new NoDataToExportError();
      }

      const { csvData } = generateCsv(data);

      return {
        csvData,
      };
    } catch (error) {
      console.error(error);
    }
  }
}
