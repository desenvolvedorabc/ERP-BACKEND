import { BadRequestException } from "@nestjs/common";
import * as path from "path";

export function fileFilter(typesFile = [], req, file, callback) {
  const ext = path.extname(file.originalname);

  if (!typesFile.includes(ext)) {
    req.fileValidationError = "Formato do arquivo invalido.";
    return callback(
      new BadRequestException("Formato do arquivo invalido."),
      false,
    );
  }

  return callback(null, true);
}
