import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  isNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { BancaryOrPixDataExists } from "src/common/decorators/BancaryOrPixDataExists.decorator";
import { IsValidCPFOrCNPJ } from "src/common/decorators/isValidCPFOrCNPJ.decorator";
import { CategorySupplier } from "../enum";
import { BancaryInfo } from "src/common/DTOs/bancaryInfo.entity";
import { PixInfo } from "src/common/DTOs/pixInfo.entity";

export class CreateSupplierDto {
  @ApiProperty()
  @IsString({ message: "Nome do fornecedor deve ser uma string" })
  @BancaryOrPixDataExists()
  @IsNotEmpty({
    message: "Informe o nome do fornecedor.",
  })
  name: string;

  @ApiProperty()
  @IsEmail(undefined, { message: "Formato de e-mail inválido" })
  @IsNotEmpty({
    message: "Informe o e-mail do fornecedor.",
  })
  email: string;

  @ApiProperty()
  @IsString({ message: "CNPJ deve ser uma string" })
  @IsNotEmpty({
    message: "Informe o CNPJ do fornecedor.",
  })
  @Length(14, 14)
  @IsValidCPFOrCNPJ({ message: "CNPJ deve ser válido." })
  cnpj: string;

  @ApiProperty()
  @IsString({ message: "Razão social deve ser uma string" })
  @IsNotEmpty({
    message: "Informe a razão social.",
  })
  corporateName: string;

  @ApiProperty()
  @IsString({ message: "Nome fantasia deve ser uma string" })
  @IsNotEmpty({
    message: "Informe o nome fantasia.",
  })
  fantasyName: string;

  @ApiProperty()
  @IsEnum(CategorySupplier)
  @IsNotEmpty({
    message: "Informe a categoria do serviço.",
  })
  serviceCategory: CategorySupplier;

  @ApiProperty()
  @IsNumber(undefined, { message: "Avaliação do serviço deve ser um número" })
  @Type(() => Number)
  @IsOptional()
  serviceEvaluation?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  commentEvaluation?: string;

  @ApiProperty()
  @ValidateIf((o) => isNotEmptyObject(o.bancaryInfo))
  @ValidateNested()
  @Type(() => BancaryInfo)
  bancaryInfo: BancaryInfo;

  @ApiProperty()
  @ValidateIf((o) => isNotEmptyObject(o.pixInfo))
  @ValidateNested()
  @Type(() => PixInfo)
  pixInfo: PixInfo;
}
