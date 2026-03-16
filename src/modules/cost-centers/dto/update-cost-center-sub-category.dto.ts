import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { SubCategoryType } from "../enum";

export class UpdateCostCenterSubCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o nome da subcategoria.",
  })
  name: string;

  @ApiProperty({
    enum: SubCategoryType,
  })
  @IsOptional()
  @IsEnum(SubCategoryType)
  @IsNotEmpty({
    message: "Informe o tipo da subcategoria.",
  })
  type: SubCategoryType;

  @ApiProperty()
  @IsNotEmpty({
    message: "Informe o ID da categoria",
  })
  @Type(() => Number)
  @IsInt()
  costCenterCategoryId: number;
}
