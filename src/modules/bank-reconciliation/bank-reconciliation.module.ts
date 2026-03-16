import { Module } from "@nestjs/common";
import { BankReconciliationService } from "./bank-reconciliation.service";
import { BankReconciliationController } from "./bank-reconciliation.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BankReconciliation } from "./entities/bank-reconciliation.entity";
import { BankRecordApi } from "./entities/bank-record-api.entity";
import { BankReconciliationRepository } from "./repositories/bank-reconciliation-repository";
import { HttpService } from "../apiBradesco/http.service";
import { InstallmentsModule } from "../installments/installments.module";
import { BankRecordAPIRepository } from "./repositories/bank-record-api-repository";
import { AccountsModule } from "../accounts/accounts.module";
import { ApiBradescoModule } from "../apiBradesco/apiBradesco.module";
import { CategorizationModule } from "../categorization/categorization.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([BankReconciliation, BankRecordApi]),
    InstallmentsModule,
    AccountsModule,
    ApiBradescoModule,
    CategorizationModule,
  ],
  controllers: [BankReconciliationController],
  providers: [
    BankReconciliationService,
    BankReconciliationRepository,
    BankRecordAPIRepository,
    HttpService,
  ],
})
export class BankReconciliationModule {}
