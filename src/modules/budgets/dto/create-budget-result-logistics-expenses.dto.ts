import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsNotEmpty,
  ArrayMinSize,
  IsArray,
  ValidateNested,
  ArrayMaxSize,
  IsNumber,
} from "class-validator";
import {
  CreateBudgetResultMonthDto,
  CreateBudgetResultDto,
} from "./create-budget-result.dto";

class CreateBudgetResultLogisticsExpensesMonthDto extends CreateBudgetResultMonthDto {
  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  accommodationInCents: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  foodInCents: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  transportInCents: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  carAndFuelInCents: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  airfareInCents: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  numberOfPeople: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  dailyAccommodation: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  dailyFood: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  dailyTransport: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  dailyCarAndFuel: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  totalTrips: number;
}

export class CreateBudgetResultLogisticsExpensesDto extends CreateBudgetResultDto {
  @ApiProperty({
    isArray: true,
    type: CreateBudgetResultLogisticsExpensesMonthDto,
  })
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetResultLogisticsExpensesMonthDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  months: CreateBudgetResultLogisticsExpensesMonthDto[];
}
