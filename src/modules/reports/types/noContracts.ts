export type NoContractRawData = {
  Payables_id: number;
  Supplier_id: number;
  BudgetPlan_id: number;
  Supplier_name: string;
  budgetPlan_name: string;
  total: number;
};

type BudgetPlan = {
  id: number | string;
  name: string;
  total: number;
};

export type TransformedNoContractsData = {
  id: number | string;
  name: string;
  total: number;
  budgetPlan: BudgetPlan[];
};

export type stringKeyNoContracts = {
  [key: string]: TransformedNoContractsData;
};
