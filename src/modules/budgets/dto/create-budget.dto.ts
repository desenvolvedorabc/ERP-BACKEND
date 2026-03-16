import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsInt, IsOptional } from "class-validator";

export class CreateBudgetDto {
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
  partnerStateId: number;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  partnerMunicipalityId: number;
}
