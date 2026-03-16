import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { CreateCategorizationDTO } from "src/modules/categorization/dto/createCategorization.dto";

export class CreateBankRecordApiDTO {
  @ApiProperty()
  @IsString({ message: "DocumentNumber deve ser uma string" })
  @IsNotEmpty({ message: "DocumentNumber é obrigatório" })
  documentNumber: string;

  @ApiProperty()
  @IsNumber(undefined, { message: "Valor da transação deve ser um número" })
  @IsNotEmpty({ message: "Valor da transação é obrigatório" })
  @Type(() => Number)
  transactionAmount: number;

  @ApiProperty()
  @IsDate({ message: "Data da transação deve ser uma Data" })
  @IsNotEmpty({ message: "Data da transação é obrigatória" })
  @Type(() => Date)
  transactionDate: Date;

  @ApiProperty()
  @IsString({ message: "Descriação da transação deve ser uma string" })
  @IsNotEmpty({ message: "Descriação da transação é obrigatório" })
  fullTransactionDescription: string;

  @ApiProperty()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => CreateCategorizationDTO)
  categorization: CreateCategorizationDTO;
}
