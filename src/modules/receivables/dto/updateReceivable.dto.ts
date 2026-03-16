import { PartialType } from "@nestjs/swagger";
import { CreateReceivableDTO } from "./createReceivable.dto";

export class UpdateReceivableDTO extends PartialType(CreateReceivableDTO) {}
