/*
https://docs.nestjs.com/modules
*/

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Accounts } from "./entities/accounts.entity";
import { AccountsRepository } from "./repositories/accounts-repository";
import { AccountsController } from "./accounts.controller";
import { AccountsService } from "./services/accounts.service";
import { TransferFileSftpModule } from "src/common/gateways/transfer-file-sftp/transfer-file-sftp.module";
import { ExtractBalanceCnabService } from "./extract-balance-cnab.service";
import { CnabModule } from "src/common/gateways/cnab/cnab.module";
import { PayablesRepository } from "src/modules/payables/repositories/payable-repository";
import { Payables } from "src/modules/payables/entities/payable.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Accounts, Payables]),
    CnabModule,
    TransferFileSftpModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService, ExtractBalanceCnabService, AccountsRepository, PayablesRepository],
  exports: [AccountsService],
})
export class AccountsModule {}
