import { Module, forwardRef } from "@nestjs/common";
import { BudgetPlansService } from "./services/budget-plans.service";
import { BudgetPlansController } from "./controllers/budget-plans.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BudgetPlan } from "./entities/budget-plan.entity";
import { BudgetPlansRepository } from "./repositories/typeorm/budget-plans-repository";
import { ProgramsModule } from "../programs/programs.module";
import { BudgetsModule } from "../budgets/budgets.module";
import { CostCentersModule } from "../cost-centers/cost-centers.module";
import { ShareBudgetPlan } from "./entities/share-budget-plan.entity";
import { ShareBudgetPlansService } from "./services/share-budget-plans.service";
import { ShareBudgetPlansRepository } from "./repositories/typeorm/share-budget-plans-repository";
import { ShareBudgetPlansController } from "./controllers/share-budget-plans.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([BudgetPlan, ShareBudgetPlan]),
    ProgramsModule,
    CostCentersModule,
    forwardRef(() => BudgetsModule),
  ],
  controllers: [BudgetPlansController, ShareBudgetPlansController],
  providers: [
    BudgetPlansService,
    BudgetPlansRepository,
    ShareBudgetPlansService,
    ShareBudgetPlansRepository,
  ],
  exports: [BudgetPlansService, ShareBudgetPlansService, BudgetPlansRepository],
})
export class BudgetPlansModule {}
