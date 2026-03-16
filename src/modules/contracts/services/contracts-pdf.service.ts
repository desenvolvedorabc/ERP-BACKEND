/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { PDFHeaders } from "../constants";
import { PDFBuilder } from "src/common/utils/pfd/pfdBuilder";
import { formatDate } from "src/common/utils/date";
import { maskMonetaryValue } from "src/common/utils/masks";
import { ContractPaginateParams } from "../dto/paginateParamsContract.dto";
import { ContractsRepository } from "../repositories/contracts-repository";
import { NoContractsException } from "../errors";

@Injectable()
export class ContractsPdfService {
  constructor(private readonly contractsRepository: ContractsRepository) {}

  async getPDF(params: ContractPaginateParams) {
    const items = await this.contractsRepository._findForCSV(params);

    if (!items?.length) {
      throw new NoContractsException();
    }

    const headers = PDFHeaders;
    const body = this.mapData(items);

    const pdfBuilder = new PDFBuilder(
      "landscape",
      "Relatório de contratos",
      headers,
      body,
    );
    const pdfBuffer = pdfBuilder.buildPDF();

    return Buffer.from(pdfBuffer);
  }

  private mapData(data: any[]) {
    return data.map((contract) => [
      contract.Contracts_id ?? "N/A",
      contract.Contracts_contractCode ?? "N/A",
      contract.Parent_contractCode ?? "N/A",
      contract.Contracts_contractType ?? "N/A",
      contract.Contracts_object ?? "N/A",
      formatDate(contract.Contracts_contractPeriodStart) ?? "N/A",
      formatDate(contract.Contracts_contractPeriodEnd) ?? "N/A",
      maskMonetaryValue(contract.Contracts_totalValue) ?? "N/A",
      contract.pending ? maskMonetaryValue(contract.pending) : "N/A",
      contract.Contracts_contractStatus ?? "N/A",
      contract.Contracts_agreement ?? "N/A",
      contract.Financier_name ?? "N/A",
      contract.Supplier_name ?? "N/A",
      contract.Collaborator_name ?? "N/A",
      contract.Program_name ?? "N/A",
      [
        contract.BudgetPlan_year,
        contract.Program_name,
        contract.BudgetPlan_version?.toFixed(1),
      ].join(" ") ?? "N/A",
    ]);
  }
}
