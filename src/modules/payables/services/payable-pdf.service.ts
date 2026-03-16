/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { PayablesRepository } from "../repositories/payable-repository";
import { PayablePaginateParams } from "../dto/payable/payablePaginateParams.dto";
import { NoPayablesException } from "../errors/PayableErrors";
import { PDFBuilder } from "src/common/utils/pfd/pfdBuilder";
import { Payables } from "../entities/payable.entity";
import { formatDate } from "src/common/utils/date";
import { maskMonetaryValue } from "src/common/utils/masks";
import { PDFHeaders } from "../constants";

@Injectable()
export class PayablePdfService {
  constructor(private payablesRepository: PayablesRepository) {}

  async getPDF(params: PayablePaginateParams) {
    const items = await this.payablesRepository._findAndSelectAllForCSV(params);

    if (!items?.length) {
      throw new NoPayablesException();
    }

    const headers = PDFHeaders;
    const body = this.mapData(items);

    const pdfBuilder = new PDFBuilder(
      "landscape",
      "Relatório de pagamentos",
      headers,
      body,
    );
    const pdfBuffer = pdfBuilder.buildPDF();

    return Buffer.from(pdfBuffer);
  }

  private mapData(data: Payables[]) {
    return data.map((payable) => [
      payable.identifierCode ?? "N/A",
      payable.supplier?.name ?? "N/A",
      payable.payableStatus ?? "N/A",
      maskMonetaryValue((payable.liquidValue ?? 0) + (payable.taxValue ?? 0)),
      payable.paymentMethod ?? "N/A",
      payable.account?.name ?? "N/A",
      payable.contract?.contractCode ?? "N/A",
      payable.recurrent ? "SIM" : "NÃO",
      payable.recurenceData?.recurrenceType ?? "N/A",
      formatDate(payable.recurenceData?.startDate),
      formatDate(payable.recurenceData?.endDate),
      payable.recurenceData?.dueDay ?? "N/A",
      formatDate(payable.dueDate),
      formatDate(payable.competenceDate),
      payable.categorization?.program?.name ?? "N/A",
      this.buildBudgetPlan(payable),
      payable.categorization?.costCenter?.name ?? "N/A",
      payable.categorization?.costCenterCategory?.name ?? "N/A",
      payable.categorization?.costCenterSubCategory?.name ?? "N/A",
    ]);
  }

  private buildBudgetPlan({ categorization }: Payables) {
    if (categorization?.budgetPlan?.scenarioName) {
      return categorization?.budgetPlan?.scenarioName;
    }
    if (categorization?.budgetPlan) {
      return `${categorization?.budgetPlan?.year} ${categorization?.program?.name} ${categorization?.budgetPlan?.version.toFixed(1)}`;
    }
    return "N/A";
  }
}
