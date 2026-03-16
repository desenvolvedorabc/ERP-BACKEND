import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
/*
https://docs.nestjs.com/modules
*/

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ContractsModule } from "../contracts/contracts.module";
import { HistoryModule } from "../history/history.module";
import { InstallmentsModule } from "../installments/installments.module";
import { PayableModule } from "../payables/payable.module";
import { ReceivablesModule } from "../receivables/receivables.module";
import { Files } from "./entities/files.entity";
import { FilesRepository } from "./repositories/files-repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([Files]),
    InstallmentsModule,
    ReceivablesModule,
    PayableModule,
    HistoryModule,
    ContractsModule,
  ],
  controllers: [FilesController],
  exports: [FilesService],
  providers: [FilesService, FilesRepository],
})
export class FilesModule {}
