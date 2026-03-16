import { PartialType } from "@nestjs/swagger";
import { CreateFinancierDto } from "./create-financier.dto";

export class UpdateFinancierDto extends PartialType(CreateFinancierDto) {}
