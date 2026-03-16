import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginateParams } from "src/common/utils/paginate-params.dto";

export class CreditCardPaginateParams extends OmitType(PaginateParams, [
  "active",
  "isCsv",
  "uf",
]) {
  @ApiProperty()
  @IsString({
    message: "Nome do responsável deve ser uma string.",
  })
  @IsOptional()
  search: string;
}
