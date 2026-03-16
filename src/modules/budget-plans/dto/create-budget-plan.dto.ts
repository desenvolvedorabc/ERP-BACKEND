import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsInt, IsOptional } from "class-validator";

export class CreateBudgetPlanDto {
  @ApiProperty()
  @IsNotEmpty({
    message: "Informe o ano do plano orçamentário",
  })
  @Type(() => Number)
  @IsInt()
  year: number;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  yearForImport: number;

  @ApiProperty()
  @IsNotEmpty({
    message: "Informe o ID do programa",
  })
  @Type(() => Number)
  @IsInt()
  programId: number;

  version: number;

  @ApiProperty({ required: false })
  @IsOptional()
  scenarioName?: string;
}
