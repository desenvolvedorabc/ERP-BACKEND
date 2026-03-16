import { PartialType } from "@nestjs/swagger";
import { CreateCategorizationDTO } from "./createCategorization.dto";

export class UpdateCategorizationDTO extends PartialType(
  CreateCategorizationDTO,
) {}
