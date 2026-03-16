export type RawData = {
  Payables_id: number;
  BudgetPlan_id: number;
  CostCenter_id: number;
  CostCenter_name: string;
  BudgetPlan_name: string;
  total: number;
  monthYear: string;
};

type DefaultField = {
  id: number | string;
  name: string;
  total: number;
};

export type Item = {
  monthYear: string;
  total: number;
};

type CostCenter = DefaultField & {
  itens: Item[];
};

type BudgetPlan = DefaultField & {
  itens: Item[];
  CostCenter: CostCenter[];
};

export type TransformedAnalysisData = {
  budgetPlans: BudgetPlan[];
};

type defaultHashed = DefaultField & {
  itens: Record<string, Item | null>;
};

type HashCostCenter = Record<number, defaultHashed | null>;

type HashBudgetPlan = Record<
  string,
  defaultHashed & {
    CostCenter: HashCostCenter;
  }
>;

export type HashInitialTransformedData = HashBudgetPlan;
