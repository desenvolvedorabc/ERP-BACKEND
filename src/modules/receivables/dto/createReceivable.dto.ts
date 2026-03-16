import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { parseISO } from "date-fns";
import { RecurenceDataDTO } from "src/common/DTOs/recurrenceData.dto";
import { DOCType, ReceiptMethod, ReceivableType } from "../enums";
import { IsStartDateGreatherThanEndDate } from "src/common/decorators/isStartDateGreather.decorator";
import { CreateCategorizationDTO } from "src/modules/categorization/dto/createCategorization.dto";

export class CreateReceivableDTO {
  @ApiProperty()
  @IsString({
    message: "Codigo identificador deve ser uma string.",
  })
  @IsNotEmpty({
    message: "Codigo identificador é obrigatório.",
  })
  identifierCode: string;

  @ApiProperty()
  @IsString({
    message: "A descrição deve ser uma string.",
  })
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsNotEmpty({
    message: "Financiador é obrigatório.",
  })
  @Type(() => Number)
  financierId: number;

  @ApiProperty()
  @IsEnum(ReceivableType)
  @IsNotEmpty({
    message: "Tipo de recebimento é obrigatório.",
  })
  receivableType: ReceivableType;

  @ApiProperty()
  @IsNumber(undefined, {
    message: "Valor total deve ser um número.",
  })
  @IsNotEmpty({
    message: "Valor total é obrigatório.",
  })
  @Type(() => Number)
  totalValue: number;

  @ApiProperty()
  @IsEnum(ReceiptMethod)
  @IsNotEmpty({
    message: "Método de recebimento é obrigatório.",
  })
  receiptMethod: ReceiptMethod;

  @ApiProperty()
  @IsEnum(DOCType)
  @IsNotEmpty({
    message: "Tipo de documento é obrigatório.",
  })
  docType: DOCType;

  @ApiProperty()
  @IsNumber(undefined, {
    message: "Id da conta bancária deve ser um número.",
  })
  @IsNotEmpty({
    message: "Id da conta bancária é obrigatório.",
  })
  @Type(() => Number)
  accountId: number;

  @ApiProperty()
  @ValidateIf((e) => e.receivableType === ReceivableType.CONTRACT)
  @IsNumber(undefined, {
    message: "Id do contrato deve ser um número.",
  })
  @IsNotEmpty({
    message: "A conta precisa está associado a um contrato.",
  })
  @Type(() => Number)
  contractId: number;

  @ApiProperty()
  @IsBoolean({
    message: "Recorrente deve ser um booleano.",
  })
  @IsNotEmpty({
    message: "Recorrente é obrigatória.",
  })
  @Type(() => Boolean)
  recurrent: boolean;

  @ApiProperty()
  @ValidateIf((e) => e.recurrent)
  @ValidateNested()
  @IsNotEmptyObject(undefined, {
    message: "Dados de recorrência são obrigatórios.",
  })
  @Type(() => RecurenceDataDTO)
  @IsStartDateGreatherThanEndDate()
  recurenceData: RecurenceDataDTO;

  @ApiProperty()
  @ValidateIf((e) => !e.recurrent)
  @IsDate({
    message: "Data de vencimento deve ser uma data.",
  })
  @IsNotEmpty({
    message: "Data de vencimento é obrigatória.",
  })
  @Transform(({ value }) => parseISO(value))
  dueDate: Date;

  @ApiProperty()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => CreateCategorizationDTO)
  categorization: CreateCategorizationDTO;
}
