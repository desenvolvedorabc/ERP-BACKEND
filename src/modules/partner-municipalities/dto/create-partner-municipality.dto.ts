import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class CreatePartnerMunicipalityDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o nome do município parceiro.",
  })
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe a sigla do estado do município.",
  })
  @Transform(({ value }) => String(value)?.toUpperCase())
  @MaxLength(2)
  uf: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o código do município.",
  })
  cod: string;
}
