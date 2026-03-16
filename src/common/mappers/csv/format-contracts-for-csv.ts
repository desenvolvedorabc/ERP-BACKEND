import { formatDate } from "src/common/utils/date";
import { maskMonetaryValue } from "src/common/utils/masks";

export function FormatContractsForCSV(contracts: any[]) {
  return contracts.map((contract) => ({
    id: contract.Contracts_id ?? "N/A",
    codigo: contract.Contracts_contractCode ?? "N/A",
    contrato_original_Codigo: contract.Parent_contractCode ?? "N/A",
    tipo: contract.Contracts_contractType ?? "N/A",
    objeto: contract.Contracts_object ?? "N/A",
    inicio: formatDate(contract.Contracts_contractPeriodStart) ?? "N/A",
    fim: formatDate(contract.Contracts_contractPeriodEnd) ?? "N/A",
    valor_total: maskMonetaryValue(contract.Contracts_totalValue) ?? "N/A",
    pendente: maskMonetaryValue(contract.pending) ?? "N/A",
    status: contract.Contracts_contractStatus ?? "N/A",
    acordo: contract.Contracts_agreement ?? "N/A",
    financiador: contract.Financier_name ?? "N/A",
    fornecedor: contract.Supplier_name ?? "N/A",
    colaborador: contract.Collaborator_name ?? "N/A",
    programa: contract.Program_name ?? "N/A",
    plano_orcamentario:
      [
        contract.BudgetPlan_year,
        contract.Program_name,
        contract.BudgetPlan_version?.toFixed(1),
      ].join(" ") ?? "N/A",
  }));
}
