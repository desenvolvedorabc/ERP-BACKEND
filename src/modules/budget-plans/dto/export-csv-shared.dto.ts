import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ExportCsvSharedDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty({
    message: "Informe o e-mail do usuário",
  })
  email: string;
}
