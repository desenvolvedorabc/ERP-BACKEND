import { ApiProperty } from "@nestjs/swagger";
import { FoodCategory } from "../enum";

export class FoodCategoryOptionDto {
  @ApiProperty({
    description: "Valor da categoria alimentar",
    enum: FoodCategory,
    example: FoodCategory.ONIVORO,
  })
  value: FoodCategory;

  @ApiProperty({
    description: "Nome da categoria alimentar",
    example: "Onívoro",
  })
  label: string;

  @ApiProperty({
    description: "Descrição detalhada da categoria alimentar",
    example: "Come de tudo (carnes, vegetais, laticínios, etc.)",
  })
  description: string;
}
