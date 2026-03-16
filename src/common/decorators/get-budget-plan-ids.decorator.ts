import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetBudgetPlanIds = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request?.user?.budgetPlansIds;
  },
);
