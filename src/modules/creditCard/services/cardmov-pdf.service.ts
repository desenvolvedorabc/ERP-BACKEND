/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { PDFBuilder } from "src/common/utils/pfd/pfdBuilder";
import { formatDate } from "src/common/utils/date";
import { maskMonetaryValue } from "src/common/utils/masks";
import { CardMovParams } from "../dtos/cardMov/paginateParamsCardMov.dto";
import { NotFoundMovimentationsError } from "../errors";
import { CardMovimentationRepository } from "../repositories/cardMov-repository";
import { CardMovimentation } from "../entities/cardMovimentation.entity";

@Injectable()
export class CardMovPDFService {
  constructor(private cardMovRepository: CardMovimentationRepository) {}

  async getPDF(params: CardMovParams) {
    const items = await this.cardMovRepository._findAllForCSV(params);

    if (!items?.length) {
      throw new NotFoundMovimentationsError();
    }

    const headers = [
      "DESCRIÇÃO",
      "DATA DE COMPRA",
      "DATA REFERÊNCIA",
      "PARCELADO",
      "NÚMERO DE PARCELAS",
      "PARCELA NÚMERO",
      "VALOR",
      "CARTÃO",
    ];
    const body = this.mapData(items);

    const pdfBuilder = new PDFBuilder(
      "portrait",
      `Relatório de movimentações do cartão ${items[0].card?.name}`,
      headers,
      body,
    );
    const pdfBuffer = pdfBuilder.buildPDF();

    return Buffer.from(pdfBuffer);
  }

  private mapData(data: CardMovimentation[]) {
    return data.map((mov) => [
      mov.description ?? "N/A",
      formatDate(mov.purchaseDate),
      formatDate(mov.referenceDate),
      mov.hasInstallments ? "SIM" : "NÃO",
      mov.numberOfInstallments,
      mov.currentInstallment,
      maskMonetaryValue(mov.value),
      mov.card?.name ?? "N/A",
      mov.status,
    ]);
  }
}
