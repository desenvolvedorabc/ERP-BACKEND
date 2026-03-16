import { Module, forwardRef } from "@nestjs/common";
import { CostCentersController } from "./cost-centers.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CostCenter } from "./entities/cost-center.entity";
import { CostCenterCategory } from "./entities/cost-center-category.entity";
import { CostCenterSubCategory } from "./entities/cost-center-sub-category.entity";
import { CostCentersRepository } from "./repositories/typeorm/cost-centers-repository";
import { CostCenterCategoriesRepository } from "./repositories/typeorm/cost-center-categories-repository";
import { CostCenterCategoriesService } from "./services/cost-center-categories.service";
import { CostCentersService } from "./services/cost-centers.service";
import { CostCenterSubCategoriesService } from "./services/cost-center-sub-categories.service";
import { CostCenterSubCategoriesRepository } from "./repositories/typeorm/cost-center-sub-categories-repository";
import { BudgetsModule } from "../budgets/budgets.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CostCenter,
      CostCenterCategory,
      CostCenterSubCategory,
    ]),
    forwardRef(() => BudgetsModule),
  ],
  controllers: [CostCentersController],
  providers: [
    CostCentersService,
    CostCenterCategoriesService,
    CostCenterSubCategoriesService,
    CostCentersRepository,
    CostCenterCategoriesRepository,
    CostCenterSubCategoriesRepository,
  ],
  exports: [
    CostCentersService,
    CostCenterSubCategoriesService,
    CostCentersRepository,
    CostCenterCategoriesRepository,
    CostCenterSubCategoriesRepository,
  ],
})
export class CostCentersModule {}
