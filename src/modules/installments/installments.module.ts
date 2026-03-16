/*
https://docs.nestjs.com/modules
*/

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Installments } from "./entities/installments.entity";
import { InstallmentsService } from "./installments.service";
import { InstallmentsRepository } from "./repositories/installments-repository";

@Module({
  imports: [TypeOrmModule.forFeature([Installments])],
  exports: [InstallmentsService],
  controllers: [],
  providers: [InstallmentsRepository, InstallmentsService],
})
export class InstallmentsModule {}
