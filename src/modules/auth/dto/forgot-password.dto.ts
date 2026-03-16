import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ForgotPasswordDto {
  @ApiProperty()
  @IsNotEmpty({
    message: "Informe o e-mail",
  })
  @IsEmail()
  email: string;
}
