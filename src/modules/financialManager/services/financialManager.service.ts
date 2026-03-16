import { PayableService } from "src/modules/payables/services/payable.service";
import { InstallmentsService } from "../../installments/installments.service";
/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, Logger, UseInterceptors } from "@nestjs/common";
import { ReceivablesService } from "src/modules/receivables/services/receivables.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import { TransactionInterceptor } from "src/common/interceptors/transaction.interceptor";

@Injectable()
export class FinancialManagerService {
  constructor(
    private readonly installmentsService: InstallmentsService,
    private readonly payablesService: PayableService,
    private readonly receivablesService: ReceivablesService,
  ) {}

  private readonly logger = new Logger(FinancialManagerService.name);

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  @UseInterceptors(TransactionInterceptor)
  private async manageOverdueAccounts() {
    try {
      const overdueAccounts =
        await this.installmentsService.manageOverdueInstallments();
      const idsPayables = overdueAccounts.flatMap(({ payableId }) => payableId);
      const idsReceivables = overdueAccounts.flatMap(
        ({ receivableId }) => receivableId,
      );
      const distinctPayablesIds = [...new Set(idsPayables)];
      const distinctReceivablesIds = [...new Set(idsReceivables)];
      await this.payablesService.markManyAsOverdue(distinctPayablesIds);
      await this.receivablesService.markManyAsOverdue(distinctReceivablesIds);
    } catch (error) {
      console.error(error);
    }
  }
}
