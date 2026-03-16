import { SuppliersRepository } from "../suppliers/repositories/typeorm/suppliers-repository";
import { SeedingService } from "./seeding.service";
/*
https://docs.nestjs.com/modules
*/

import { Module } from "@nestjs/common";

@Module({
  imports: [],
  controllers: [],
  providers: [SeedingService, SuppliersRepository],
  exports: [SeedingService],
})
export class SeedingModule {}
