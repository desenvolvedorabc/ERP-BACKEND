import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsInt,
  ArrayMinSize,
  IsArray,
  ValidateNested,
  ArrayMaxSize,
} from "class-validator";
import {
  CreateBudgetResultMonthDto,
  CreateBudgetResultDto,
} from "./create-budget-result.dto";

class CreateBudgetResultCAEDMonthDto extends CreateBudgetResultMonthDto {
  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  baseValueInCents: number;

  @ApiProperty()
  @IsNotEmpty({
    message: "Informe o número de matrículas",
  })
  @Type(() => Number)
  @IsInt()
  numberOfEnrollments: number;
}

export class CreateBudgetResultCAEDDto extends CreateBudgetResultDto {
  @ApiProperty({
    isArray: true,
    type: CreateBudgetResultCAEDMonthDto,
  })
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetResultCAEDMonthDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  months: CreateBudgetResultCAEDMonthDto[];
}
