import { PartialType } from "@nestjs/swagger";
import { CreatePayableDTO } from "./createPayable.dto";

export class UpdatePayableDTO extends PartialType(CreatePayableDTO) {}
