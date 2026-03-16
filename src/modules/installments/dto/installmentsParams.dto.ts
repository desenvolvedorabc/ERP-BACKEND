import { PickType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { DueBetweenDTO } from "src/common/DTOs/dueBetween.dto";
import { PaginateParams } from "src/common/utils/paginate-params.dto";

export class InstallmentsParamsDTO extends PickType(PaginateParams, [
  "page",
  "limit",
]) {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  accountId: number;

  @IsEnum(["Receivable", "Payable"])
  @IsOptional()
  typeOfTransaction: "Receivable" | "Payable" = "Payable";

  @IsEnum(["DESC", "ASC"])
  @IsOptional()
  orderValue: "DESC" | "ASC" = "DESC";

  @IsEnum(["DESC", "ASC"])
  @IsOptional()
  orderDueDate: "DESC" | "ASC" = "DESC";

  @IsString()
  @IsOptional()
  identificationCodeSearch: string;

  @IsString()
  @IsOptional()
  CNPJorNameSearch: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => DueBetweenDTO)
  dueBetween: DueBetweenDTO;
}
