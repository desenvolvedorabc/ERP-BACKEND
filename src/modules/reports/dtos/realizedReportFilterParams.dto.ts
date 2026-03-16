import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from "class-validator";
import { set, parseISO } from "date-fns";

export class RealizedReportParamsDTO {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  programId: number = null;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  budgetPlanId: number = null;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  partnerStateId: number = null;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  partnerMunicipalityId: number = null;

  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) =>
    set(parseISO(value), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
  )
  year: Date;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  formatValues?: boolean = false;
}
