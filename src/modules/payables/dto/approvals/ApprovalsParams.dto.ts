import { ApiProperty, OmitType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";
import { PaginateParams } from "src/common/utils/paginate-params.dto";

export class ApprovalsParamsDTO extends OmitType(PaginateParams, [
  "active",
  "isCsv",
  "uf",
]) {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  userId: number;
}
