import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsEnum, IsInt } from "class-validator";
import { SubCategoryReleaseType, SubCategoryType } from "../enum";
import { Type } from "class-transformer";

export class CreateCostCenterSubCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o nome da subcategoria.",
  })
  name: string;

  @ApiProperty({
    enum: SubCategoryType,
  })
  @IsEnum(SubCategoryType)
  @IsNotEmpty({
    message: "Informe o tipo da subcategoria.",
  })
  type: SubCategoryType;

  @ApiProperty({
    enum: SubCategoryReleaseType,
  })
  @IsEnum(SubCategoryReleaseType)
  @IsNotEmpty({
    message: "Informe o tipo do lançamento.",
  })
  releaseType: SubCategoryReleaseType;

  @ApiProperty()
  @IsNotEmpty({
    message: "Informe o ID da categoria",
  })
  @Type(() => Number)
  @IsInt()
  costCenterCategoryId: number;
}
