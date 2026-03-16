import { OmitType } from "@nestjs/swagger";
import { CreateCostCenterCategoryDto } from "./create-cost-center-category.dto";

export class UpdateCostCenterCategoryDto extends OmitType(
  CreateCostCenterCategoryDto,
  ["subCategories"] as const,
) {}
