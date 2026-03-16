import { OmitType } from "@nestjs/mapped-types";
import { PaginateParams } from "src/common/utils/paginate-params.dto";

export class AccountsPaginateParams extends OmitType(PaginateParams, [
  "active",
  "isCsv",
  "uf",
]) {}
