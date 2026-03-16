import { SeedingModule } from "./modules/seed/seeding.module";
import { GuardsModule } from "./common/guards/guards.module";
import { MiddlewareConsumer, Module, OnModuleInit } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { MulterModule } from "@nestjs/platform-express";
import { ScheduleModule } from "@nestjs/schedule";
import { ServeStaticModule } from "@nestjs/serve-static";
import * as fs from "fs";
import * as path from "path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import LogsMiddleware from "./common/middleware/logs.middleware";
import configuration from "./config/typeorm/configuration";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BudgetPlansModule } from "./modules/budget-plans/budget-plans.module";
import { BudgetsModule } from "./modules/budgets/budgets.module";
import { CollaboratorsModule } from "./modules/collaborators/collaborators.module";
import { ContractsModule } from "./modules/contracts/contracts.module";
import { CostCentersModule } from "./modules/cost-centers/cost-centers.module";
import { FilesModule } from "./modules/files/files.module";
import { FinanciersModule } from "./modules/financiers/financiers.module";
import { HistoryModule } from "./modules/history/history.module";
import { InstallmentsModule } from "./modules/installments/installments.module";
import { PartnerMunicipalitiesModule } from "./modules/partner-municipalities/partner-municipalities.module";
import { PartnerStatesModule } from "./modules/partner-states/partner-states.module";
import { PayableModule } from "./modules/payables/payable.module";
import { ProgramsModule } from "./modules/programs/programs.module";
import { ReceivablesModule } from "./modules/receivables/receivables.module";
import { SuppliersModule } from "./modules/suppliers/suppliers.module";
import { UsersModule } from "./modules/users/users.module";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { ApiBradescoModule } from "./modules/apiBradesco/apiBradesco.module";
import { BankReconciliationModule } from "./modules/bank-reconciliation/bank-reconciliation.module";
import { TokenModule } from "./modules/token/token.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { CardModule } from "./modules/creditCard/card.module";
import { ParseNumericIdPipe } from "./common/pipes/ParseNumericIdPipe ";
import { StatisticsModule } from "./modules/statistics/statistics.module";
import { FinancialManagerModule } from "./modules/financialManager/financialManager.module";
import { SeedingService } from "./modules/seed/seeding.service";
import { ImportExcelModule } from "./modules/import-excel/import-excel.module";

const UPLOAD_PATHS = [
  "uploads/contracts/anexos",
  "uploads/contracts/settle",
  "uploads/contracts/signedContracts",
  "uploads/contracts/withdrawal",
  "uploads/models",
  "uploads/payables",
  "uploads/receivables",
];

@Module({
  imports: [
    SeedingModule,
    AccountsModule,
    ApiBradescoModule,
    AuthModule,
    BudgetPlansModule,
    BudgetsModule,
    CardModule,
    CollaboratorsModule,
    ContractsModule,
    CostCentersModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
    }),
    DatabaseModule,
    EventEmitterModule.forRoot(),
    FilesModule,
    FinanciersModule,
    FinancialManagerModule,
    GuardsModule,
    HistoryModule,
    InstallmentsModule,
    MulterModule.register({
      dest: "../uploads",
      limits: { fileSize: 10 * 1048576 }, // 10MB
    }),
    PartnerMunicipalitiesModule,
    PartnerStatesModule,
    PayableModule,
    ProgramsModule,
    ReceivablesModule,
    ReportsModule,
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, "..", "public"),
      exclude: ["/api/(.*)"],
    }),
    ScheduleModule.forRoot(),
    TokenModule,
    UsersModule,
    BankReconciliationModule,
    StatisticsModule,
    ImportExcelModule,
  ],
  controllers: [AppController],
  providers: [AppService, ParseNumericIdPipe],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly seedingService: SeedingService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes("*");
  }

  async onModuleInit() {
    this.ensureUploadDirectories();
    this.seedingService.seed();
  }

  private ensureUploadDirectories() {
    UPLOAD_PATHS.forEach((folder) => {
      const fullPath = path.join(__dirname, "..", folder);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`Created folder: ${fullPath}`);
      }
    });
  }
}
