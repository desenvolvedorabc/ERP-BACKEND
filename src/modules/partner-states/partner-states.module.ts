import { Module } from "@nestjs/common";
import { PartnerStatesService } from "./partner-states.service";
import { PartnerStatesController } from "./partner-states.controller";
import { PartnerStatesRepository } from "./repositories/typeorm/partner-states.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PartnerState } from "./entities/partner-state.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PartnerState])],
  controllers: [PartnerStatesController],
  providers: [PartnerStatesService, PartnerStatesRepository],
  exports: [PartnerStatesService, PartnerStatesRepository],
})
export class PartnerStatesModule {}
