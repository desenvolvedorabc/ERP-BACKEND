import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsInt, Min, Max } from "class-validator";
import { SubCategoryReleaseType } from "src/modules/cost-centers/enum";
import { BudgetResultData } from "../repositories/typeorm/budget-results-repository";

export class CreateBudgetResultMonthDto {
  @IsNotEmpty({
    message: "Informe o mês do resultado",
  })
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;
}

export class CreateBudgetResultDto {
  @ApiProperty()
  @IsNotEmpty({
    message: "Informe o ID do orçamento.",
  })
  @Type(() => Number)
  @IsInt()
  budgetId: number;

  releaseType: SubCategoryReleaseType;

  @ApiProperty()
  @IsNotEmpty({
    message: "Informe o ID da subcategoria",
  })
  @Type(() => Number)
  @IsInt()
  costCenterSubCategoryId: number;

  months: Partial<BudgetResultData>[];
}
