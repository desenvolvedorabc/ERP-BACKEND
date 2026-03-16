/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { ReportPositionParamsDTO } from "../dtos/reportFilterParams.dto";
import { AnalysisReportRepository } from "../repositories/analysis-report-repository";
import { RawData } from "../types/analysis";
import { NoDataToExportError } from "../errors";
import { PDFBuilder } from "src/common/utils/pfd/pfdBuilder";
import { analysisHeader } from "../consts/pdfHeaders";
import { maskMonetaryValue } from "src/common/utils/masks";

@Injectable()
export class AnalysisPDFService {
  constructor(private readonly repo: AnalysisReportRepository) {}

  async getPDF(params: ReportPositionParamsDTO, type: "r" | "p") {
    const items =
      type === "p"
        ? await this.repo.findPayables(params)
        : await this.repo.findReceivables(params);

    if (!items?.length) {
      throw new NoDataToExportError();
    }

    const headers = analysisHeader;
    const body = this.mapData(items, type);

    const pdfBuilder = new PDFBuilder(
      "portrait",
      `Analise de ${type === "p" ? "Pagamentos" : "Recebimentos"}`,
      headers,
      body,
    );
    const pdfBuffer = pdfBuilder.buildPDF();

    return Buffer.from(pdfBuffer);
  }

  private mapData(data: RawData[], type: "r" | "p") {
    return data.map((curr) => [
      type === "r" ? "Receber" : "Pagar",
      curr.BudgetPlan_name ?? "Não categorizado",
      curr.CostCenter_name ?? "Não categorizado",
      maskMonetaryValue(curr.total ?? 0),
      curr.monthYear ?? "Não categorizado",
    ]);
  }
}
