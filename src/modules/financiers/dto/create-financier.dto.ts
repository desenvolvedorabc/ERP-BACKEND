import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, Length } from "class-validator";
import { Transform } from "class-transformer";

export class CreateFinancierDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o nome do financiador.",
  })
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe a razão social.",
  })
  corporateName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o representante legal.",
  })
  legalRepresentative: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o CNPJ do financiador.",
  })
  @Length(14, 14)
  @Transform(({ value }) => value.replace(/\D/g, ""))
  cnpj: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value?.replace(/\D/g, ""))
  @IsNotEmpty({
    message: "Informe o telefone do financiador.",
  })
  telephone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o endereço do financiador.",
  })
  address: string;
}
