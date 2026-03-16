import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { BankReconciliationType } from "../enums";
import { parseNumber } from "src/common/decorators/parseNumber.decorator";

export class CreateBankReconciliationDTO {
  @ApiProperty()
  @IsNumber(undefined, {
    message: "Id da conta deve ser um número",
  })
  @IsNotEmpty({
    message: "Id da conta é obrigatório",
  })
  @Type(() => Number)
  accountId: number;

  @ApiProperty()
  @IsEnum(BankReconciliationType)
  @IsNotEmpty({
    message: "Tipo da conciliação é obrigatório",
  })
  type: BankReconciliationType;

  @ApiProperty()
  @parseNumber()
  @IsOptional()
  recordSystemId?: number;

  @ApiProperty()
  @parseNumber()
  @IsOptional()
  transferedById?: number;

  @ApiProperty()
  @IsNumber(undefined, {
    message: "Id recordApi deve ser um número",
  })
  @IsOptional()
  @Type(() => Number)
  recordApiId: number;
}
