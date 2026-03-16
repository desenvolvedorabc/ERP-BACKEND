import { ApiProperty } from "@nestjs/swagger";
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from "class-validator";
import { InstallmentType } from "../enum";

export class CreateInstallmentDTO {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  payableId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  receivableId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  installmentNumber: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalInstallments: number;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  dueDate: Date;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @ApiProperty()
  @IsEnum(InstallmentType)
  @IsNotEmpty()
  type: InstallmentType;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  relatedLiquidInstallmentId: number | null;

  constructor(
    installmentNumber: number,
    totalInstallments: number,
    dueDate: Date,
    value: number,
    type: InstallmentType,
    payableId?: number,
    receivableId?: number,
    relatedLiquidInstallmentId?: number,
  ) {
    this.payableId = payableId;
    this.receivableId = receivableId;
    this.installmentNumber = installmentNumber;
    this.totalInstallments = totalInstallments;
    this.dueDate = dueDate;
    this.value = value;
    this.type = type;
    this.relatedLiquidInstallmentId = relatedLiquidInstallmentId;
  }
}
