import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsOptional,
  ArrayMinSize,
  IsArray,
  ValidateNested,
  ArrayMaxSize,
  IsString,
  IsNumber,
  IsInt,
} from "class-validator";
import {
  CreateBudgetResultMonthDto,
  CreateBudgetResultDto,
} from "./create-budget-result.dto";

export class CreateBudgetResultIPCAMonthDto extends CreateBudgetResultMonthDto {
  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  baseValueInCents: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  ipca: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  justification?: string = null;
}

export class CreateBudgetResultIPCADto extends CreateBudgetResultDto {
  @ApiProperty({
    isArray: true,
    type: CreateBudgetResultIPCAMonthDto,
  })
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetResultIPCAMonthDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  months: CreateBudgetResultIPCAMonthDto[];
}
