import { ApiProperty } from "@nestjs/swagger";
import { plainToClass, Transform, Type } from "class-transformer";
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { CreateFilesDTO } from "./createFile.dto";

class File {
  @IsNumber()
  @Type(() => Number)
  id: number;

  @IsString()
  fileUrl: string;
}

export class updateFilesDTO extends CreateFilesDTO {
  @ApiProperty()
  @ValidateIf(({ value }) => !!value)
  @ValidateNested()
  @IsNotEmpty()
  @IsArray()
  @Transform(({ value }) => {
    const parsed = value.map((fileString: string) => JSON.parse(fileString));
    return plainToClass(File, parsed);
  })
  currentFiles: File[];
}
