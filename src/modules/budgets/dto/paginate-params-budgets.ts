import { PickType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional } from "class-validator";
import { PaginateParams } from "src/common/utils/paginate-params.dto";

export class PaginateParamsBudgets extends PickType(PaginateParams, [
  "page",
  "limit",
  "isCsv",
]) {
  @ApiProperty()
  @IsNotEmpty({
    message: "Informe o ID do plano orçamentário.",
  })
  @Type(() => Number)
  @IsInt()
  budgetPlanId: number;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  partnerStateId: number = null;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  partnerMunicipalityId: number = null;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  isForMonth = 0;
}
