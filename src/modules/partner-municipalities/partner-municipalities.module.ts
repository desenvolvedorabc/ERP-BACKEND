import { Module } from "@nestjs/common";
import { PartnerMunicipalitiesService } from "./partner-municipalities.service";
import { PartnerMunicipalitiesController } from "./partner-municipalities.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PartnerMunicipality } from "./entities/partner-municipality.entity";
import { PartnerMunicipalitiesRepository } from "./repositories/typeorm/partner-municipalities.repository";

@Module({
  imports: [TypeOrmModule.forFeature([PartnerMunicipality])],
  controllers: [PartnerMunicipalitiesController],
  providers: [PartnerMunicipalitiesService, PartnerMunicipalitiesRepository],
  exports: [PartnerMunicipalitiesRepository],
})
export class PartnerMunicipalitiesModule {}
