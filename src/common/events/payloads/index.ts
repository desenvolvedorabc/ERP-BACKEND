export interface DuplicateBudgetPlanPayload {
  budgetPlanId: number;
  oldBudgetPlanId: number;
}

export interface CreateBudgetPlanPayload {
  budgetPlanId: number;
  program: string;
}
