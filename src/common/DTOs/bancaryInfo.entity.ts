import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches } from "class-validator";
import { Column } from "typeorm";
import { IsNullable } from "../decorators/IsNullable";

export class BancaryInfo {
  @ApiProperty()
  @IsString({ message: "Banco deve ser uma string" })
  @IsNullable()
  @Column({ type: "varchar", nullable: true, default: null, length: 120 })
  bank: string;

  @ApiProperty()
  @IsString({ message: "Agência DV deve ser uma string" })
  @IsNullable()
  @Matches(/^(\d{4}-\d{1})?$/, {
    message:
      "A agência e o dv da agência devem ser informados no formato 0000-0",
  })
  @Column({ type: "varchar", nullable: true, default: null, length: 20 })
  agency: string;

  @ApiProperty()
  @IsNullable()
  @IsString({ message: "Número da conta deve ser uma string" })
  @Column({ type: "varchar", nullable: true, default: null, length: 20 })
  accountNumber: string;

  @ApiProperty()
  @IsNullable()
  @IsString({ message: "DV deve ser uma string" })
  @Column({ default: null, nullable: true, length: 1 })
  dv: string;
}
