import { PartialType } from "@nestjs/swagger";
import { CreatePartnerStateDto } from "./create-partner-state.dto";

export class UpdatePartnerStateDto extends PartialType(CreatePartnerStateDto) {}
