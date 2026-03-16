/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { PositionReportsRepository } from "../repositories/position-reports-repository";
import { ReportPositionParamsDTO } from "../dtos/reportFilterParams.dto";
import { RawData } from "../types/positions";
import { NoDataToExportError } from "../errors";
import { maskMonetaryValue } from "src/common/utils/masks";
import { PDFBuilder } from "src/common/utils/pfd/pfdBuilder";
import { positionsHeader } from "../consts/pdfHeaders";

@Injectable()
export class PositionsPDFService {
  constructor(
    private readonly positionReportsRepository: PositionReportsRepository,
  ) {}

  async getPDF(params: ReportPositionParamsDTO, type: "r" | "p") {
    let items: RawData[];
    if (type === "p") {
      const dataPayables =
        await this.positionReportsRepository.findPayablesPositionReportData(
          params,
        );
      const dataCardMov =
        await this.positionReportsRepository.findCardMovPositionReportData(
          params,
        );
      items = [...dataPayables, ...dataCardMov];
    } else {
      items =
        await this.positionReportsRepository.findReceivablesPositionReportData(
          params,
        );
    }

    if (!items?.length) {
      throw new NoDataToExportError();
    }

    const headers = positionsHeader(type);
    const body = this.mapData(items);

    const pdfBuilder = new PDFBuilder(
      "portrait",
      `Posicao de ${type === "p" ? "pagamentos" : "recebimentos"}`,
      headers,
      body,
    );
    const pdfBuffer = pdfBuilder.buildPDF();

    return Buffer.from(pdfBuffer);
  }

  private mapData(data: RawData[]) {
    return data.map((curr) => [
      curr.name ?? "Não categorizado",
      curr.CostCenter_name ?? "Não categorizado",
      curr.Category_name ?? "Não categorizado",
      maskMonetaryValue(curr.PENDENTE ?? 0),
      maskMonetaryValue(curr.PAGO ?? 0),
      maskMonetaryValue(curr.ATRASADO ?? 0),
    ]);
  }
}
