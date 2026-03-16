import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateCategorizationDTO {
  @ApiProperty()
  @IsNotEmpty({
    message: "Programa é obrigatório.",
  })
  @IsNumber(undefined, { message: "Programa deve ser um número." })
  @Type(() => Number)
  programId: number;

  @ApiProperty()
  @IsNotEmpty({
    message: "Plano orçamentário é obrigatório.",
  })
  @IsNumber(undefined, { message: "Plano orçamentário deve ser um número." })
  @Type(() => Number)
  budgetPlanId: number;

  @ApiProperty()
  @IsNotEmpty({
    message: "Centro de custo é obrigatório.",
  })
  @IsNumber(undefined, { message: "Centro de custo deve ser um número." })
  @Type(() => Number)
  costCenterId: number;

  @ApiProperty()
  @IsNotEmpty({
    message: "Categoria do centro de custo é obrigatória.",
  })
  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @ApiProperty()
  @IsNotEmpty({
    message: "Subcategoria do centro de custo é obrigatória.",
  })
  @IsNumber(undefined, {
    message: "Subcategoria do centro de custo deve ser um número.",
  })
  @Type(() => Number)
  subCategoryId: number;
}
