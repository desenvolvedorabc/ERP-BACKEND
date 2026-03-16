import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o nome do usuário",
  })
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty({
    message: "Informe o e-mail do usuário",
  })
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o CPF do usuário",
  })
  @Length(11, 11)
  @Transform(({ value }) => value.replace(/\D/g, ""))
  cpf: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o telefone do usuário",
  })
  @Transform(({ value }) => value.replace(/\D/g, ""))
  telephone: string;

  password: string;

  imageUrl?: string;

  @ApiProperty()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  massApprovalPermission: boolean;

  @ApiProperty({ required: false })
  @Transform(({ value }) => value ? Number(value) : null)
  collaboratorId?: number;
}
