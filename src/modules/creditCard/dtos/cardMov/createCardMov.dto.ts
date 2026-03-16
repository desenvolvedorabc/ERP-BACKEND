/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { CreateCategorizationDTO } from "src/modules/categorization/dto/createCategorization.dto";

export class CreateCardMovimentationDTO {
  @ApiProperty()
  @IsString({
    message: "Descrição deve ser uma string.",
  })
  @IsOptional()
  description: string;

  @IsOptional()
  @Type(() => Date)
  referenceDate: Date;

  @IsOptional()
  installmentId: string;

  @ApiProperty()
  @IsDate({
    message: "Data da compra deve ser uma Data.",
  })
  @IsNotEmpty({
    message: "Data da compra é obrigatório.",
  })
  @Type(() => Date)
  purchaseDate: Date;

  @ApiProperty()
  @IsBoolean({
    message: "Parcelamento deve ser um boolean.",
  })
  @IsNotEmpty({
    message: "Parcelamento é obrigatório.",
  })
  @Type(() => Boolean)
  hasInstallments: boolean;

  @ApiProperty()
  @ValidateIf((o) => o.installments)
  @IsNumber(undefined, {
    message: "Número de parcelas deve ser um número.",
  })
  @IsNotEmpty({
    message: "Número de parcelas é obrigatório.",
  })
  @Type(() => Number)
  numberOfInstallments: number;

  @IsOptional()
  @Type(() => Number)
  currentInstallment: number;

  @ApiProperty()
  @IsNumber(undefined, {
    message: "Valor deve ser um número.",
  })
  @IsNotEmpty({
    message: "Valor é obrigatório.",
  })
  @Type(() => Number)
  value: number;

  @ApiProperty()
  @IsNumber(undefined, {
    message: "ID do cartão deve ser um número.",
  })
  @IsNotEmpty({
    message: "Id do cartão é obrigatório.",
  })
  @Type(() => Number)
  cardId: number;

  @ApiProperty()
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => CreateCategorizationDTO)
  categorization: CreateCategorizationDTO;
}
