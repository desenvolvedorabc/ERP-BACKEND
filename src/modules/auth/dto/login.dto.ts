import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class LoginDto {
  @IsNotEmpty({
    message: "Informe o e-mail",
  })
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty({
    message: "Informe a senha",
  })
  @ApiProperty()
  @MinLength(6)
  password: string;
}
