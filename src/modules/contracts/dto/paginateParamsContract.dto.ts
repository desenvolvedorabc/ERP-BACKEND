import { ApiProperty, OmitType } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { PaginateParams } from "src/common/utils/paginate-params.dto";
import { ContractStatus, ContractType } from "../enums";
import { ContractPeriodDTO } from "./contractPeriod.dto";

export class ContractPaginateParams extends OmitType(PaginateParams, [
  "active",
  "isCsv",
  "uf",
]) {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  budgetPlanId: number = null;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => Boolean(Number(value)))
  agreement: boolean = null;

  @ApiProperty()
  @IsEnum(ContractType)
  @IsOptional()
  contractType: ContractType = null;

  @ApiProperty()
  @IsEnum(ContractStatus)
  @IsOptional()
  contractStatus: ContractStatus = null;

  @ApiProperty()
  @ValidateNested()
  @IsOptional()
  @IsNotEmptyObject()
  @Type(() => ContractPeriodDTO)
  contractPeriod: ContractPeriodDTO = null;
}
