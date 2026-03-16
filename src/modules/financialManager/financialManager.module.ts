/*
https://docs.nestjs.com/modules
*/

import { Module } from "@nestjs/common";
import { FinancialManagerService } from "./services/financialManager.service";
import { PayableModule } from "../payables/payable.module";
import { InstallmentsModule } from "../installments/installments.module";
import { ReceivablesModule } from "../receivables/receivables.module";

@Module({
  imports: [PayableModule, InstallmentsModule, ReceivablesModule],
  exports: [],
  controllers: [],
  providers: [FinancialManagerService],
})
export class FinancialManagerModule {}
