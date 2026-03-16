import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsNumber,
  IsOptional,
  ValidateIf,
} from "class-validator";
import { GenderIdentity, Race, FoodCategory, Education } from "../enum";
import { Transform, Type } from "class-transformer";

export class CompleteRegistrationCollaborator {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o RG do colaborador.",
  })
  rg: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o endereço completo.",
  })
  completeAddress: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty({
    message: "Informe a data de nascimento.",
  })
  dateOfBirth: Date;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value?.replace(/\D/g, ""))
  @IsNotEmpty({
    message: "Informe o telefone do colaborador.",
  })
  telephone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe o nome de contato para emergência.",
  })
  emergencyContactName: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value?.replace(/\D/g, ""))
  @IsNotEmpty({
    message: "Informe o telefone de contato para emergência.",
  })
  emergencyContactTelephone: string;

  @ApiProperty({
    enum: GenderIdentity,
  })
  @IsEnum(GenderIdentity)
  @IsNotEmpty({
    message: "Informe a identidade de gênero.",
  })
  genderIdentity: GenderIdentity;

  @ApiProperty({
    enum: Race,
  })
  @IsEnum(Race)
  @IsNotEmpty({
    message: "Informe a raça/cor.",
  })
  race: Race;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe se tem alergias.",
  })
  allergies: string;

  @ApiProperty({
    enum: FoodCategory,
  })
  @IsEnum(FoodCategory)
  @IsNotEmpty({
    message: "Informe a categoria alimentar.",
  })
  foodCategory: FoodCategory;

  @ApiProperty({
    description:
      'Descrição da categoria alimentar (obrigatório quando categoria for "Outro")',
    required: false,
  })
  @ValidateIf((o) => o.foodCategory === FoodCategory.OUTRO)
  @IsString()
  @IsNotEmpty({
    message:
      'Quando selecionar "Outro", é obrigatório descrever sua condição alimentar.',
  })
  @IsOptional()
  foodCategoryDescription?: string;

  @ApiProperty({
    enum: Education,
  })
  @IsEnum(Education)
  @IsNotEmpty({
    message: "Informe a escolaridade.",
  })
  education: Education;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty({
    message: "Informe se tem experiência no setor público.",
  })
  experienceInThePublicSector: boolean;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: "Informe a bibliografia.",
  })
  biography: string;
}
