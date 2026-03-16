import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ImportHistoryDTO {
  @ApiProperty({
    type: "string",
    format: "binary",
    description: "Arquivo CSV ou Excel (XLSX) com dados históricos de colaboradores",
  })
  @IsNotEmpty({ message: "Arquivo é obrigatório." })
  file: Express.Multer.File;
}

