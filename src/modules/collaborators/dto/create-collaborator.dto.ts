import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Length,
  IsEnum,
  IsDateString,
} from "class-validator";
import { OccupationArea, EmploymentRelationship } from "../enum";
import { Transform } from "class-transformer";

export class CreateCollaboratorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o nome do colaborador.",
  })
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty({
    message: "Informe o e-mail do colaborador.",
  })
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o CPF do colaborador.",
  })
  @Length(11, 11)
  @Transform(({ value }) => value.replace(/\D/g, ""))
  cpf: string;

  @ApiProperty({
    enum: OccupationArea,
  })
  @IsEnum(OccupationArea)
  @IsNotEmpty({
    message: "Informe a area de ocupação.",
  })
  occupationArea: OccupationArea;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe a função do colaborador.",
  })
  role: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty({
    message: "Informe a data do Inicio de Contrato.",
  })
  startOfContract: Date;

  @ApiProperty({
    enum: EmploymentRelationship,
  })
  @IsEnum(EmploymentRelationship)
  @IsNotEmpty({
    message: "Informe o vínculo empregatício.",
  })
  employmentRelationship: EmploymentRelationship;
}
