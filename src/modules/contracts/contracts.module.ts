import { TypeOrmModule } from "@nestjs/typeorm";
import { ContractsController } from "./contracts.controller";
import { ContractsService } from "./services/contracts.service";
/*
https://docs.nestjs.com/modules
*/

import { Module, forwardRef } from "@nestjs/common";
import { HistoryModule } from "../history/history.module";
import { InstallmentsModule } from "../installments/installments.module";
import { PayableModule } from "../payables/payable.module";
import { ReceivablesModule } from "../receivables/receivables.module";
import { UsersModule } from "../users/users.module";
import { Contracts } from "./entities/contracts.entity";
import { ContractsRepository } from "./repositories/contracts-repository";
import { ContractsValidations } from "./validations/ContractsValidation";
import { ContractsPdfService } from "./services/contracts-pdf.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Contracts]),
    HistoryModule,
    InstallmentsModule,
    PayableModule,
    ReceivablesModule,
    UsersModule,
  ],
  controllers: [ContractsController],
  exports: [ContractsService],
  providers: [
    ContractsService,
    ContractsRepository,
    ContractsValidations,
    ContractsPdfService,
  ],
})
export class ContractsModule {}
