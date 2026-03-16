import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsInt, ArrayMinSize, IsArray } from "class-validator";

export class ShareBudgetPlanDto {
  @ApiProperty({
    isArray: true,
    type: String,
  })
  @IsArray()
  @ArrayMinSize(1)
  emails: string[];

  @ApiProperty()
  @IsNotEmpty({
    message: "Informe o ID do plano orçamentário",
  })
  @Type(() => Number)
  @IsInt()
  budgetPlanId: number;
}

export class ShareBudgetPlanConsolidatedResultDto {
  @ApiProperty({
    isArray: true,
    type: String,
  })
  @IsArray()
  @ArrayMinSize(1)
  emails: string[];

  @ApiProperty()
  @IsNotEmpty({
    message: "Informe o ID(s) do plano orçamentário",
  })
  @ArrayMinSize(1)
  @IsArray()
  budgetPlanIds: number[];
}
