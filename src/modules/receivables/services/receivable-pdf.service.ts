/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { ReceivablesRepository } from "../repositories/receivables-repository";
import { NoReceivablesException } from "../errors";
import { ReceivablesPaginateParams } from "../dto/receivablePaginateParams.dto";
import { Receivables } from "../entities/receivables.entity";
import { PDFHeaders } from "../constants";
import { PDFBuilder } from "src/common/utils/pfd/pfdBuilder";
import { formatDate } from "src/common/utils/date";
import { maskMonetaryValue } from "src/common/utils/masks";

@Injectable()
export class ReceivablePdfService {
  constructor(private readonly receivablesRepository: ReceivablesRepository) {}

  async getPDF(params: ReceivablesPaginateParams) {
    const items =
      await this.receivablesRepository._findAndSelectAllForCSV(params);

    if (!items?.length) {
      throw new NoReceivablesException();
    }

    const headers = PDFHeaders;
    const body = this.mapData(items);

    const pdfBuilder = new PDFBuilder(
      "landscape",
      "Relatório de recebimentos",
      headers,
      body,
    );
    const pdfBuffer = pdfBuilder.buildPDF();

    return Buffer.from(pdfBuffer);
  }

  private mapData(data: Receivables[]) {
    return data.map((receivable) => [
      receivable.identifierCode ?? "N/A",
      receivable.financier.name ?? "N/A",
      receivable.receivableStatus ?? "N/A",
      receivable.receivableType ?? "N/A",
      maskMonetaryValue(receivable.totalValue) ?? "N/A",
      receivable.receiptMethod ?? "N/A",
      receivable.account?.name ?? "N/A",
      receivable.contract?.contractCode ?? "N/A",
      receivable.recurrent ? "SIM" : "NÃO",
      receivable.recurenceData?.recurrenceType ?? "N/A",
      formatDate(receivable.recurenceData?.startDate),
      formatDate(receivable.recurenceData?.endDate),
      receivable.recurenceData?.dueDay ?? "N/A",
      formatDate(receivable.dueDate),
      receivable.categorization?.program?.name ?? "N/A",
      this.buildBudgetPlan(receivable),
      receivable.categorization?.costCenter?.name ?? "N/A",
      receivable.categorization?.costCenterCategory?.name ?? "N/A",
      receivable.categorization?.costCenterSubCategory?.name ?? "N/A",
    ]);
  }

  private buildBudgetPlan({ categorization }: Receivables) {
    if (categorization?.budgetPlan?.scenarioName) {
      return categorization?.budgetPlan?.scenarioName;
    }
    if (categorization?.budgetPlan) {
      return `${categorization?.budgetPlan?.year} ${categorization?.program?.name} ${categorization?.budgetPlan?.version.toFixed(1)}`;
    }
    return "N/A";
  }
}
