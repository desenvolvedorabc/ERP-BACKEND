import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsNotEmpty } from "class-validator";

export class CreateProgramDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o nome do programa.",
  })
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe a sigla do programa.",
  })
  @Transform(({ value }) => String(value)?.toUpperCase())
  abbreviation: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o diretor do programa",
  })
  director: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe as características gerais do programa",
  })
  description: string;

  logo?: string | null;
}
