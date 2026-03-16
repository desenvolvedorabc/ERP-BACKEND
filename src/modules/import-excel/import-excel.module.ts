import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { APP_FILTER } from "@nestjs/core";
import { ImportExcelController } from "./import-excel.controller";
import { ImportExcelExceptionFilter } from "./import-excel-exception.filter";
import { ProgramsModule } from "../programs/programs.module";
import { BudgetPlansModule } from "../budget-plans/budget-plans.module";
import { BudgetsModule } from "../budgets/budgets.module";
import { CostCentersModule } from "../cost-centers/cost-centers.module";
import { UsersModule } from "../users/users.module";
import { PartnerMunicipalitiesModule } from "../partner-municipalities/partner-municipalities.module";
import { PartnerStatesModule } from "../partner-states/partner-states.module";
import { ImportExcelService } from "./import-excel.service";

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 1024 * 1024 * 10, // 10MB
      },
    }),
    ProgramsModule,
    BudgetPlansModule,
    BudgetsModule,
    CostCentersModule,
    UsersModule,
    PartnerMunicipalitiesModule,
    PartnerStatesModule,
  ],
  controllers: [ImportExcelController],
  providers: [
    ImportExcelService,
    {
      provide: APP_FILTER,
      useClass: ImportExcelExceptionFilter,
    },
  ],
})
export class ImportExcelModule {}
