import { Module, forwardRef } from "@nestjs/common";
import { BudgetsController } from "./controllers/budgets.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Budget } from "./entities/budget.entity";
import { BudgetsRepository } from "./repositories/typeorm/budgets-repository";
import { BudgetPlansModule } from "../budget-plans/budget-plans.module";
import { BudgetResult } from "./entities/budget-result.entity";
import { BudgetResultsRepository } from "./repositories/typeorm/budget-results-repository";
import { BudgetsService } from "./services/budgets.service";
import { BudgetResultsService } from "./services/budget-results.service";
import { CostCentersModule } from "../cost-centers/cost-centers.module";
import { BudgetResultsController } from "./controllers/budget-results.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Budget, BudgetResult]),
    forwardRef(() => BudgetPlansModule),
    forwardRef(() => CostCentersModule),
  ],
  controllers: [BudgetsController, BudgetResultsController],
  providers: [
    BudgetsService,
    BudgetResultsService,
    BudgetsRepository,
    BudgetResultsRepository,
  ],
  exports: [
    BudgetsService,
    BudgetResultsService,
    BudgetsRepository,
    BudgetResultsRepository,
  ],
})
export class BudgetsModule {}
