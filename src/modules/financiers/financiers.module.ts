import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Financier } from "./entities/financier.entity";
import { FinanciersController } from "./financiers.controller";
import { FinanciersService } from "./financiers.service";
import { FinanciersRepository } from "./repositories/typeorm/financiers-repository";

@Module({
  imports: [TypeOrmModule.forFeature([Financier])],
  controllers: [FinanciersController],
  providers: [FinanciersService, FinanciersRepository],
})
export class FinanciersModule {}
