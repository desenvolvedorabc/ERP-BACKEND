import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { CostCenterType } from "../enum";

export class UpdateCostCenterDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({
    message: "Informe o budgetPlanID.",
  })
  budgetPlanId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o nome do centro de custo.",
  })
  name: string;

  @ApiProperty()
  @IsEnum(CostCenterType)
  @IsNotEmpty({
    message: "Informe o tipo do centro de custo.",
  })
  type: CostCenterType;
}
