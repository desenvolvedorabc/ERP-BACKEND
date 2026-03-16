import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsArray } from "class-validator";
import { PaginateParams } from "src/common/utils/paginate-params.dto";
import { CategorySupplier } from "../enum";

export class PaginateSuppliersParams extends PaginateParams {
  @ApiProperty({
    enum: CategorySupplier,
    required: false,
    isArray: true,
  })
  @IsEnum(CategorySupplier, { each: true })
  @IsArray()
  @IsOptional()
  categories: CategorySupplier[];
}
