import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class PaginateParams {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty()
  page: number = 1;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty()
  limit: number = 5;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  search: string = null;

  @ApiProperty({
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  active: 1 | 0 = null;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  order: "ASC" | "DESC" = "ASC";

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => String(value)?.toUpperCase())
  @MaxLength(2)
  uf: string = null;

  isCsv = false;
}
