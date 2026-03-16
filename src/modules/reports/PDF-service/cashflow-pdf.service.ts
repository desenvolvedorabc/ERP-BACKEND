/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { CashFlowReportRepository } from "../repositories/cashflow-reports-repository";
import { CashFlowRawData } from "../types/cashflow";
import { ifEmpty } from "src/common/mappers/csv/format-cashflow-for-csv";
import { NoDataToExportError } from "../errors";
import { ReportPositionParamsDTO } from "../dtos/reportFilterParams.dto";
import { maskMonetaryValue } from "src/common/utils/masks";
import { PDFBuilder } from "src/common/utils/pfd/pfdBuilder";
import { cashflowHeader } from "../consts/pdfHeaders";

@Injectable()
export class CashflowPDFService {
  constructor(
    private readonly cashFlowReportRepository: CashFlowReportRepository,
  ) {}

  async getPDF(params: ReportPositionParamsDTO) {
    const items =
      await this.cashFlowReportRepository.findCashFlowReportData(params);

    if (
      !items?.cardMov.length &&
      !items?.payableData.length &&
      !items?.receivableData.length
    ) {
      throw new NoDataToExportError();
    }

    const body = this.mapData(items);

    const headers = cashflowHeader;

    const pdfBuilder = new PDFBuilder(
      "portrait",
      `Fluxo de caixa`,
      headers,
      body,
    );
    const pdfBuffer = pdfBuilder.buildPDF();

    return Buffer.from(pdfBuffer);
  }

  private mapData(data: CashFlowRawData) {
    const entradas = data.receivableData
      ? data.receivableData.map((item) => [
          "ENTRADA",
          ifEmpty(item.Category_name),
          ifEmpty(item.SubCategory_name),
          maskMonetaryValue(item.REALIZED ?? 0),
          maskMonetaryValue(item.EXPECTED ?? 0),
        ])
      : [];

    const payableData = [...data.payableData, ...data.cardMov];

    const saidas = payableData
      ? payableData.map((item) => [
          "SAIDAS",
          ifEmpty(item.Category_name),
          ifEmpty(item.SubCategory_name),
          maskMonetaryValue(item.REALIZED ?? 0),
          maskMonetaryValue(item.EXPECTED ?? 0),
        ])
      : [];

    return [...entradas, ...saidas];
  }
}
