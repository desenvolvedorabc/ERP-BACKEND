import { ApiProperty, OmitType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { PaginateParams } from "src/common/utils/paginate-params.dto";
import { DueBetweenDTO } from "src/common/DTOs/dueBetween.dto";
import { ValueBetweenDTO } from "src/common/DTOs/valueBetween.dto";
import { ReceivableStatus, ReceivableType } from "../enums";

export type DueBetween = {
  start: Date;
  end: Date;
};

export type ValueBetween = {
  start: number;
  end: number;
};

export class ReceivablesPaginateParams extends OmitType(PaginateParams, [
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
  @ValidateNested()
  @IsOptional()
  @IsNotEmptyObject()
  @Type(() => DueBetweenDTO)
  dueBetween: DueBetween = null;

  @ApiProperty()
  @ValidateNested()
  @IsOptional()
  @Type(() => ValueBetweenDTO)
  valueBetween: ValueBetween = null;

  @ApiProperty()
  @IsEnum(ReceivableType)
  @IsOptional()
  receivableType: ReceivableType = null;

  @ApiProperty()
  @IsNumber(undefined, {
    message: "Id da conta bancária deve ser um número.",
  })
  @IsOptional()
  @Type(() => Number)
  accountId: number = null;

  @ApiProperty()
  @IsEnum(ReceivableStatus)
  @IsOptional()
  receivableStatus: ReceivableStatus = null;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  costCenterId: number = null;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  categoryId: number = null;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  subCategoryId: number = null;
}
