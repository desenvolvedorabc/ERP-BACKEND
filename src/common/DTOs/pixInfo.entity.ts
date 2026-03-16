import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { IsValidCPFOrCNPJ } from "src/common/decorators/isValidCPFOrCNPJ.decorator";
import { PixTypes } from "src/modules/suppliers/enum";
import { Column } from "typeorm";
import { IsNullable } from "../decorators/IsNullable";

export class PixInfo {
  @ApiProperty({
    enum: PixTypes,
    enumName: "PixTypes",
  })
  @IsNotEmpty({ message: "Tipo de chave é obrigatório" })
  @IsEnum(PixTypes, {
    message:
      "O tipo de chave deve ser um dos seguintes: " +
      Object.values(PixTypes).join(", "),
  })
  @IsNullable()
  @Column({ type: "varchar", nullable: true, default: null })
  key_type: PixTypes;

  @ApiProperty()
  @IsString({ message: "Chave deve ser uma string" })
  @IsNotEmpty({ message: "Chave é obrigatório" })
  @IsNullable()
  @IsValidCPFOrCNPJ()
  @Column({ type: "varchar", nullable: true, default: null })
  key: string;
}
