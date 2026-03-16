import { IsArray, IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { ReportPositionParamsDTO } from "./reportFilterParams.dto";
import { Type } from "class-transformer";
import { DEFAULTCOLUMNS } from "../types/generalReport";
import { IntersectionType, PickType } from "@nestjs/swagger";
import { PaginateParams } from "src/common/utils/paginate-params.dto";
import { ReportType } from "../enums";

export class GeneralReportParamsDTO extends IntersectionType(
  ReportPositionParamsDTO,
  PickType(PaginateParams, ["page", "limit"]),
) {
  @IsArray()
  @IsNotEmpty()
  @IsOptional()
  @Type(() => Array<keyof DEFAULTCOLUMNS>)
  columns: Array<keyof DEFAULTCOLUMNS> = [];

  @IsEnum(ReportType)
  @IsOptional()
  @IsNotEmpty()
  reportType: ReportType = null;
}
