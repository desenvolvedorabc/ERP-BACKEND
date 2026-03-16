import { PickType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional } from "class-validator";
import { PaginateParams } from "src/common/utils/paginate-params.dto";
import { BudgetPlanStatus } from "../enum";

export class PaginateParamsBudgetPlans extends PickType(PaginateParams, [
  "page",
  "limit",
  "search",
]) {
  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year: number;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  programId: number;

  @ApiProperty({
    enum: BudgetPlanStatus,
  })
  @IsEnum(BudgetPlanStatus)
  @IsOptional()
  status: BudgetPlanStatus;
}
