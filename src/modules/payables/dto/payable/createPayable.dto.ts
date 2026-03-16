import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
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
import { RecurenceDataDTO } from "../../../../common/DTOs/recurrenceData.dto";
import { DebtorType, DOCType, PaymentMethod } from "../../enums";
import { PaymentType } from "./../../enums/index";
import { IsBarCodeRequired } from "src/common/decorators/IsBarcoderequired";
import { IsStartDateGreatherThanEndDate } from "src/common/decorators/isStartDateGreather.decorator";
import { CreateCategorizationDTO } from "src/modules/categorization/dto/createCategorization.dto";

export class CreatePayableDTO {
  @ApiProperty()
  @IsString({
    message: "Codigo identificador deve ser uma string.",
  })
  @IsNotEmpty({
    message: "Codigo identificador é obrigatório.",
  })
  identifierCode: string;

  @ApiProperty()
  @IsEnum(DebtorType)
  @IsNotEmpty({
    message: "Tipo de devedor é obrigatório.",
  })
  debtorType: DebtorType;

  @ApiProperty()
  @ValidateIf((e) => e.debtorType === DebtorType.SUPPLIER)
  @IsNotEmpty({
    message: "Colaborador ou fornecedor é obrigatório.",
  })
  @Type(() => Number)
  supplierId: number;

  @ApiProperty()
  @ValidateIf((e) => e.debtorType === DebtorType.COLLABORATOR)
  @IsNotEmpty({
    message: "Colaborador ou fornecedor é obrigatório.",
  })
  @Type(() => Number)
  collaboratorId: number;

  @ApiProperty()
  @IsArray()
  @IsNumber(undefined, { each: true })
  @ArrayMinSize(1, {
    message: "Aprovadores são obrigatórios.",
  })
  @Type(() => Number)
  approvers: number[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  obs: string;

  @ApiProperty()
  @IsEnum(PaymentType)
  @IsNotEmpty({
    message: "Tipo de pagamento é obrigatório.",
  })
  paymentType: PaymentType;

  @ApiProperty()
  @IsNumber(undefined, {
    message: "Valor total deve ser um número.",
  })
  @IsOptional()
  @Type(() => Number)
  totalValue: number;

  @ApiProperty()
  @IsNumber(undefined, {
    message: "Valor liquido deve ser um número.",
  })
  @IsNotEmpty({
    message: "Valor liquido é obrigatório.",
  })
  @Type(() => Number)
  liquidValue: number;

  @ApiProperty()
  @IsNumber(undefined, {
    message: "Valor de impostos deve ser um número.",
  })
  @IsNotEmpty({
    message: "Valor de impostos é obrigatório.",
  })
  @Type(() => Number)
  taxValue: number;

  @ApiProperty()
  @IsEnum(PaymentMethod)
  @IsNotEmpty({
    message: "Método de pagamento é obrigatório.",
  })
  paymentMethod: PaymentMethod;

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
  @ValidateIf((e) => e.paymentType === PaymentType.CONTRACT)
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
  @ValidateIf((e) => {
    return !e.recurrent;
  })
  @IsNotEmpty({
    message: "Data de vencimento é obrigatória.",
  })
  @Transform(({ value }) => parseISO(value))
  @IsDate({
    message: "Data de vencimento deve ser uma data.",
  })
  dueDate: Date;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => (value ? parseISO(value) : null))
  @IsDate({
    message: "Data de competência deve ser uma data válida.",
  })
  competenceDate?: Date;

  @ApiProperty()
  @IsOptional()
  @IsDate({
    message: "Data de pagamento deve ser uma data.",
  })
  @IsNotEmpty({
    message: "Data de pagamento é obrigatória.",
  })
  @Type(() => Date)
  paymentDate: Date;

  @ApiProperty()
  @IsNotEmpty({
    message: "Criado por é obrigatório.",
  })
  @Type(() => Number)
  createdById: number;

  @ApiProperty()
  @ValidateIf((object, value) => value !== null)
  @Type(() => Number)
  updatedById: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsBarCodeRequired()
  barcode: string;

  @ApiProperty()
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => CreateCategorizationDTO)
  @ValidateIf((e) => e.paymentType !== PaymentType.CARDBILL)
  categorization: CreateCategorizationDTO;
}
