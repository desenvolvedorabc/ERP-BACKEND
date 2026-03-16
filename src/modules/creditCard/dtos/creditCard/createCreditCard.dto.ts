import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Max, Min } from "class-validator";

export class CreateCreditCardDTO {
  @ApiProperty()
  @IsString({
    message: "Nome deve ser uma string.",
  })
  @IsNotEmpty({
    message: "Nome é obrigatório.",
  })
  name: string;

  @ApiProperty()
  @IsString({
    message: "Últimos dígitos deve ser uma string.",
  })
  @IsNotEmpty({
    message: "Últimos dígitos é obrigatório.",
  })
  lastDigits: string;

  @ApiProperty()
  @IsString({
    message: "Nome do responsável deve ser uma string.",
  })
  @IsNotEmpty({
    message: "Nome do responsável é obrigatório.",
  })
  responsible: string;

  @ApiProperty()
  @IsString({
    message: "Instituição deve ser uma string.",
  })
  @IsNotEmpty({
    message: "Instituição é obrigatório.",
  })
  instituition: string;

  @ApiProperty()
  @IsNumber(undefined, {
    message: "Conta deve ser um número.",
  })
  @IsNotEmpty({
    message: "Conta é obrigatório.",
  })
  accountId: number;

  @ApiProperty()
  @IsNumber(undefined, {
    message: "Dia de vencimento deve ser um número.",
  })
  @Min(0, { message: "Dia de vencimento deve ser um número entre 1 e 31." })
  @Max(31, { message: "Dia de vencimento deve ser um número entre 1 e 31." })
  @IsNotEmpty({
    message: "Dia de vencimento é obrigatório.",
  })
  dueDay: number;
}
