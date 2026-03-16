import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { DueBetweenDTO } from "src/common/DTOs/dueBetween.dto";
import { ReceivableStatus } from "../../receivables/enums";
import { PayableStatus } from "src/modules/payables/enums";

const StatusUnion = { ...ReceivableStatus, ...PayableStatus };
type Status = typeof StatusUnion;

export class ReportPositionParamsDTO {
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
  dueBetween: DueBetweenDTO = null;

  @ApiProperty()
  @IsNumber(undefined, {
    message: "Id da conta bancária deve ser um número.",
  })
  @IsOptional()
  @Type(() => Number)
  accountId: number = null;

  @ApiProperty()
  @IsEnum([...Object.values(StatusUnion)])
  @IsOptional()
  status: Status = null;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  costCenterId: number = null;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  programId: number = null;

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
  entityId: number = null;
}
