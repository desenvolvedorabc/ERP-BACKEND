import { TypeOrmModule } from "@nestjs/typeorm";
import { Receivables } from "src/modules/receivables/entities/receivables.entity";
import { FilesService } from "../files/files.service";
import { FilesRepository } from "../files/repositories/files-repository";
import { ReceivablesController } from "./receivables.controller";
import { ReceivablesRepository } from "./repositories/receivables-repository";
import { ReceivablesService } from "./services/receivables.service";
import { forwardRef, Module } from "@nestjs/common";
import { ContractsModule } from "../contracts/contracts.module";
import { ValidateTotalValuePipe } from "../contracts/pipes/validateTotalValue.pipe";
import { ReceivableValidator } from "./validators/ReceivableValidator";
import { InstallmentsModule } from "../installments/installments.module";
import { CategorizationModule } from "../categorization/categorization.module";
import { ReceivablePdfService } from "./services/receivable-pdf.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Receivables]),
    forwardRef(() => ContractsModule),
    InstallmentsModule,
    CategorizationModule,
  ],
  exports: [ReceivablesService],
  controllers: [ReceivablesController],
  providers: [
    ReceivablesService,
    ReceivablesRepository,
    ReceivablePdfService,
    FilesRepository,
    FilesService,
    ValidateTotalValuePipe,
    ReceivableValidator,
  ],
})
export class ReceivablesModule {}
