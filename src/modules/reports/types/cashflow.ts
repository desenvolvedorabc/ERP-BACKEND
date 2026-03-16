export type BaseTypeCashFlow = {
  Category_name: string;
  Category_id: number;
  SubCategory_name: string;
  SubCategory_id: number;
  REALIZED: number;
  EXPECTED: number;
  type?: string;
};

export type BaseTypeCashFlowChart = BaseTypeCashFlow & {
  Installments_dueDate: string;
};

export type CashFlowRawData = {
  receivableData: BaseTypeCashFlow[];
  payableData: BaseTypeCashFlow[];
  cardMov: BaseTypeCashFlow[];
  bankRecon: BaseTypeCashFlow[];
};
