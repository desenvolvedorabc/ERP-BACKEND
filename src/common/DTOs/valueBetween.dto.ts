import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class ValueBetweenDTO {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  start: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  end: number;
}
