/*
https://docs.nestjs.com/modules
*/

import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CollaboratorsModule } from "../collaborators/collaborators.module";
import { ContractsModule } from "../contracts/contracts.module";
import { UsersModule } from "../users/users.module";
import { Approvals } from "./entities/approval.entity";
import { Payables } from "./entities/payable.entity";
import { PayablesController } from "./payables.controller";
import { ApprovalsRepository } from "./repositories/approval-repository";
import { PayablesRepository } from "./repositories/payable-repository";
import { ApprovalsService } from "./services/approval.service";
import { PayableService } from "./services/payable.service";
import { PayableValidator } from "./validations/PayableValidator";
import { ExportCnabPayableService } from "./services/export-cnab.service";
import { CnabModule } from "src/common/gateways/cnab/cnab.module";
import { TransferFileSftpModule } from "src/common/gateways/transfer-file-sftp/transfer-file-sftp.module";
import { CardModule } from "../creditCard/card.module";
import { InstallmentsModule } from "../installments/installments.module";
import { CategorizationModule } from "../categorization/categorization.module";
import { FilesRepository } from "../files/repositories/files-repository";
import { FilesService } from "../files/files.service";
import { PayablePdfService } from "./services/payable-pdf.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Payables, Approvals]),
    CollaboratorsModule,
    forwardRef(() => UsersModule),
    CnabModule,
    InstallmentsModule,
    CategorizationModule,
    TransferFileSftpModule,
    forwardRef(() => CardModule),
    forwardRef(() => ContractsModule),
  ],
  exports: [PayableService, PayablesRepository],
  controllers: [PayablesController],
  providers: [
    PayableService,
    PayablesRepository,
    PayablePdfService,
    ApprovalsService,
    ApprovalsRepository,
    PayableValidator,
    ExportCnabPayableService,
    FilesRepository,
    FilesService,
  ],
})
export class PayableModule {}
