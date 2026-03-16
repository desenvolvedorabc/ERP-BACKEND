import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ImportExcelDTO } from "./dto/import-excel.dto";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { ImportExcelService } from "./import-excel.service";

@ApiTags("Excel Import")
@Controller("import-excel")
export class ImportExcelController {
  constructor(private readonly importExcelService: ImportExcelService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        typeExcel: { type: "string", enum: ["EPV", "PARC"] },
        file: {
          type: "string",
          format: "binary",
          description: "Arquivo Excel (XLSX) a ser importado.",
        },
      },
      required: ["typeExcel", "file"],
    },
  })
  @ApiBearerAuth()
  async import(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ImportExcelDTO,
  ) {
    return this.importExcelService.import(file, body);
  }
}
