import { NoContractRawData } from "src/modules/reports/types/noContracts";

type returnData = {
  Fornecedor: string;
  BudgetPlan: string;
  Total: number;
};

export function FormatNoContractsReportForCSV(
  accounts: Array<NoContractRawData>,
) {
  const data = accounts.reduce((acc, curr) => {
    acc.push({
      Fornecedor: curr.Supplier_name,
      BudgetPlan: curr.budgetPlan_name,
      Total: curr.total,
    });

    return acc;
  }, [] as Array<returnData>);

  return data;
}
