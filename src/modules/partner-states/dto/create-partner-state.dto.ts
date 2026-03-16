import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class CreatePartnerStateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o nome do estado parceiro.",
  })
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe a sigla do estado parceiro.",
  })
  @Transform(({ value }) => String(value)?.toUpperCase())
  @MaxLength(2)
  abbreviation: string;
}
