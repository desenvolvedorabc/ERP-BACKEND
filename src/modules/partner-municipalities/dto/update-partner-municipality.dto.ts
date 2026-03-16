import { PartialType } from "@nestjs/swagger";
import { CreatePartnerMunicipalityDto } from "./create-partner-municipality.dto";

export class UpdatePartnerMunicipalityDto extends PartialType(
  CreatePartnerMunicipalityDto,
) {}
