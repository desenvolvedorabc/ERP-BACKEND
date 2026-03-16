import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  isNotEmptyObject,
  IsNumber,
  IsString,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { BancaryInfo } from "../../../common/DTOs/bancaryInfo.entity";
import { PixInfo } from "../../../common/DTOs/pixInfo.entity";
import { ContractModel, ContractType } from "../enums";
import { ContractPeriodDTO } from "./contractPeriod.dto";

export class CreateContractDTO {
  @ApiProperty()
  @IsEnum(ContractType)
  @IsNotEmpty({
    message: "Tipo do contrato é obrigatório.",
  })
  contractType: ContractType;

  @ApiProperty()
  @IsEnum(ContractModel)
  @IsNotEmpty({
    message: "Modelo do contrato é obrigatório.",
  })
  contractModel: ContractModel;

  @ApiProperty()
  @IsString({
    message: "Objeto deve ser uma string.",
  })
  @IsNotEmpty({
    message: "Objeto é obrigatório.",
  })
  object: string;

  @ApiProperty()
  @IsNumber(undefined, {
    message: "Valor total do contrato deve ser um número.",
  })
  @IsNotEmpty({
    message: "Valor total do contrato é obrigatório.",
  })
  @Type(() => Number)
  totalValue: number;

  @ApiProperty()
  @IsBoolean({
    message: "Acordo deve ser um booleano.",
  })
  @IsNotEmpty({
    message: "Acordo é obrigatório.",
  })
  @Type(() => Boolean)
  agreement: boolean;

  @ApiProperty()
  @ValidateIf((c) => c.contractType !== ContractType.FINANCIER)
  @IsNumber(undefined, {
    message: "Id do budget plan deve ser um número.",
  })
  @IsNotEmpty({
    message: "Id do budget plan é obrigatório.",
  })
  @Type(() => Number)
  budgetPlanId: number;

  @ApiProperty()
  @IsNotEmpty({
    message: "Periodo do contrato é obrigatório.",
  })
  contractPeriod: ContractPeriodDTO;

  @ApiProperty()
  @ValidateIf((c) => c.contractType === ContractType.SUPPLIER)
  @IsNumber(undefined, {
    message: "Id do fornecedor deve ser um número.",
  })
  @IsNotEmpty({
    message: "Id do fornecedor é obrigatório.",
  })
  @Type(() => Number)
  supplierId: number;

  @ApiProperty()
  @ValidateIf((c) => c.contractType !== ContractType.FINANCIER)
  @IsNumber(undefined, {
    message: "Id do programa deve ser um número.",
  })
  @IsNotEmpty({
    message: "Id do programa é obrigatório.",
  })
  @Type(() => Number)
  programId: number;

  @ApiProperty()
  @ValidateIf((c) => c.contractType === ContractType.FINANCIER)
  @IsNumber(undefined, {
    message: "Id do financiador deve ser um número.",
  })
  @IsNotEmpty({
    message: "Id do financiador é obrigatório.",
  })
  @Type(() => Number)
  financierId: number;

  @ApiProperty()
  @ValidateIf((c) => c.contractType === ContractType.COLLABORATOR)
  @IsNumber(undefined, {
    message: "Id do colaborador deve ser um número.",
  })
  @IsNotEmpty({
    message: "Id do colaborador é obrigatório.",
  })
  @Type(() => Number)
  collaboratorId: number;

  @ApiProperty()
  @ValidateIf((c) => c.contractType !== ContractType.FINANCIER)
  @ValidateIf((o) => isNotEmptyObject(o))
  @ValidateNested()
  @Type(() => BancaryInfo)
  bancaryInfo: BancaryInfo;

  @ApiProperty()
  @ValidateIf((o) => isNotEmptyObject(o))
  @ValidateNested()
  @Type(() => PixInfo)
  pixInfo: PixInfo;
}
