/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { NoContractSuppliersReportRepository } from "../repositories/no-contract-suppliers-report-repository";
import { ReportPositionParamsDTO } from "../dtos/reportFilterParams.dto";
import { NoDataToExportError } from "../errors";
import { NoContractRawData } from "../types/noContracts";
import { maskMonetaryValue } from "src/common/utils/masks";
import { PDFBuilder } from "src/common/utils/pfd/pfdBuilder";
import { noContractsHeader } from "../consts/pdfHeaders";

@Injectable()
export class NoContractPDFService {
  constructor(
    private readonly noContractRepository: NoContractSuppliersReportRepository,
  ) {}

  async getPDF(params: ReportPositionParamsDTO) {
    const items =
      await this.noContractRepository.findNoContractSuppliersReportData(params);

    if (!items?.length) {
      throw new NoDataToExportError();
    }

    const headers = noContractsHeader;
    const body = this.mapData(items);

    const pdfBuilder = new PDFBuilder(
      "portrait",
      `Fornecedores sem contrato`,
      headers,
      body,
    );
    const pdfBuffer = pdfBuilder.buildPDF();

    return Buffer.from(pdfBuffer);
  }

  private mapData(data: NoContractRawData[]) {
    return data.map((curr) => [
      curr.Supplier_name,
      curr.budgetPlan_name,
      maskMonetaryValue(curr.total),
      maskMonetaryValue(10000 - curr.total),
    ]);
  }
}
