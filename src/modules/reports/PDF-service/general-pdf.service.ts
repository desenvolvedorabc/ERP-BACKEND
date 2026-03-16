/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { GeneralReportRepository } from "../repositories/general-report-repository";
import { GeneralReportParamsDTO } from "../dtos/generalReportParams.dto";
import { NoDataToExportError } from "../errors";
import { generateCsv } from "src/common/utils/lib/generate-csv";
import { GeneralReportReturn } from "../types/generalReport";
import { generalHeader } from "../consts/pdfHeaders";
import { PDFBuilder } from "src/common/utils/pfd/pfdBuilder";
import { formatDate } from "src/common/utils/date";

@Injectable()
export class GeneralPDFService {
  constructor(
    private readonly generalReportsRepository: GeneralReportRepository,
  ) {}

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

  async getPDF(params: GeneralReportParamsDTO) {
    const items = await this.generalReportsRepository.unionReportCSV(params);

    if (!items?.length) {
      throw new NoDataToExportError();
    }

    const headers = Object.keys(items[0]).map((key) => generalHeader[key]);
    const body = this.mapData(items);

    const pdfBuilder = new PDFBuilder(
      "landscape",
      `Relatório geral`,
      headers,
      body,
    );
    const pdfBuffer = pdfBuilder.buildPDF();

    return Buffer.from(pdfBuffer);
  }

  private mapData(data: GeneralReportReturn[]) {
    return data.map((curr) =>
      Object.keys(curr).map((key) => {
        if (
          key === "E_ID" ||
          key === "bancary" ||
          key === "pix" ||
          key === "data"
        )
          return undefined;
        return key !== "vencimento"
          ? (curr[key] ?? "N/A")
          : (formatDate(curr[key]) ?? "N/A");
      }),
    );
  }
}
