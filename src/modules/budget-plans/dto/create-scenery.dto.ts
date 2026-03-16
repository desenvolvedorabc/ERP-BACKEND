import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateSceneryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o nome do cenário",
  })
  name: string;

  @ApiProperty()
  @IsNotEmpty({
    message: "Informe o ID do plano orçamentário",
  })
  @Type(() => Number)
  @IsInt()
  budgetPlanId: number;
}
