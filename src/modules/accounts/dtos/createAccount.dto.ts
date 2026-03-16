import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

export class CreateAccountDTO {
  @ApiProperty()
  @IsString({
    message: "Nome deve ser uma string.",
  })
  @IsNotEmpty({
    message: "Nome é obrigatório.",
  })
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber(undefined, {
    message: "Saldo inicial deve ser um número.",
  })
  @Type(() => Number)
  initialBalance?: number;

  @IsString({
    message: "Banco deve ser uma string.",
  })
  @IsNotEmpty({
    message: "Banco é obrigatório.",
  })
  @Transform(() => "BRADESCO")
  @ApiProperty()
  bank: string;

  @IsString({
    message: "Agência deve ser uma string.",
  })
  @IsNotEmpty({
    message: "Agência é obrigatório.",
  })
  @ApiProperty()
  @Matches(/^\d{4}-\d{1}$/, {
    message:
      "A agência e o dv da agência devem ser informados no formato 0000-0",
  })
  agency: string;

  @IsString({
    message: "Número da conta deve ser uma string.",
  })
  @IsNotEmpty({
    message: "Número da conta é obrigatório.",
  })
  @ApiProperty()
  accountNumber: string;

  @IsString({
    message: "Dv deve ser uma string.",
  })
  @MaxLength(1)
  @IsNotEmpty({
    message: "Dv é obrigatório.",
  })
  @ApiProperty()
  dv: string;
}
