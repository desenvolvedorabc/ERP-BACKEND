import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class UpdateBalanceDTO {
  @ApiProperty()
  @IsNumber(undefined, {
    message: "Valor deve ser um número.",
  })
  @IsNotEmpty({
    message: "Valor é obrigatório.",
  })
  @Type(() => Number)
  value: number;

  constructor(val: number) {
    this.value = val;
  }
}
