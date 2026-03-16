import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { CostCenterSubCategory } from "../entities/cost-center-sub-category.entity";

export class CreateCostCenterCategoryDto {
  @IsString()
  @IsNotEmpty({
    message: "Informe o nome da categoria.",
  })
  @ApiProperty()
  name: string;

  @IsNumber()
  @IsNotEmpty({
    message: "Informe o id do centro de custo.",
  })
  @ApiProperty()
  costCenterId: number;

  @IsOptional()
  @ValidateNested()
  @IsNotEmpty({
    message: "Informe as subcategorias.",
  })
  @ApiProperty()
  subCategories: Partial<CostCenterSubCategory>[];
}
