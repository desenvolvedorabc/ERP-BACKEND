import { PartialType } from "@nestjs/swagger";
import { CreateInstallmentDTO } from "./createInstallment.dto";
import { IsNumber, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class UpdateInstallmentDTO extends PartialType(CreateInstallmentDTO) {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id: number;
}
