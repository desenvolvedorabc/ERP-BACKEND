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
import { PayableStatus, PaymentType } from "../../enums";
import { DueBetweenDTO } from "../../../../common/DTOs/dueBetween.dto";
import { ValueBetweenDTO } from "../../../../common/DTOs/valueBetween.dto";

export class PayablePaginateParams extends OmitType(PaginateParams, [
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
  @IsOptional()
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => DueBetweenDTO)
  dueBetween: DueBetweenDTO;

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => ValueBetweenDTO)
  valueBetween: ValueBetweenDTO;

  @ApiProperty()
  @IsEnum(PaymentType)
  @IsOptional()
  paymentType: PaymentType = null;

  @ApiProperty()
  @IsNumber(undefined, {
    message: "Id da conta bancária deve ser um número.",
  })
  @IsOptional()
  @Type(() => Number)
  accountId: number = null;

  @ApiProperty()
  @IsEnum(PayableStatus)
  @IsOptional()
  payableStatus: PayableStatus = null;

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

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  approver: number = null;
}
