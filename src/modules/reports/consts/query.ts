export const queryFieldsReceivable = {
  budgetPlanId: "Receivable.budgetPlanId",
  dueBetween: "Installments.dueDate",
  accountId: "Receivable.accountId",
  status: "Receivable.receivableStatus",
  costCenterId: "Receivable.costCenterId",
  categoryId: "Receivable.categoryId",
  subCategoryId: "Receivable.subCategoryId",
  programId: "Receivable.programid",
};

export const queryFieldsPayable = {
  budgetPlanId: "Payable.budgetPlanId",
  dueBetween: "Installments.dueDate",
  accountId: "Payable.accountId",
  status: "Payable.payableStatus",
  costCenterId: "Payable.costCenterId",
  categoryId: "Payable.categoryId",
  subCategoryId: "Payable.subCategoryId",
  programId: "Payable.programId",
};

export const queryFieldsCardMov = {
  ...queryFieldsPayable,
  dueBetween: "Payable.dueDate",
  costCenterId: "CardMovimentation.costCenterId",
  categoryId: "CardMovimentation.categoryId",
  subCategoryId: "CardMovimentation.subCategoryId",
  programId: "CardMovimentation.programId",
};

export const queryFieldsContractsP = {
  ...queryFieldsPayable,
  dueBetween: undefined,
};

export const queryFieldsContractsR = {
  ...queryFieldsReceivable,
  dueBetween: undefined,
};
