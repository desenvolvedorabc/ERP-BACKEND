import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsEnum, IsNotEmpty } from "class-validator";
import { ExcelTypeEnum } from "../enums/excel-type.enum";

export class ImportExcelDTO {
  @ApiProperty({ enum: ExcelTypeEnum, enumName: "ExcelTypeEnum" })
  @IsEnum(ExcelTypeEnum, {
    message: "Tipo de planilha deve ser 'EPV' ou 'PARC'.",
  })
  @IsNotEmpty({ message: "Informe o tipo de planilha." })
  typeExcel: ExcelTypeEnum;
}
