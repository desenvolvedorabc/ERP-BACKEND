import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Categorization } from "./entities/categorization.entity";
import { CategorizationService } from "./categorization.service";
import { CategorizationRepository } from "./repositories/categorization-repository";

@Module({
  imports: [TypeOrmModule.forFeature([Categorization])],
  exports: [CategorizationService],
  controllers: [],
  providers: [CategorizationService, CategorizationRepository],
})
export class CategorizationModule {}
