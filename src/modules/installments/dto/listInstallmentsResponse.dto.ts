import { IsDate, IsNumber, IsString } from "class-validator";

export class ListInstallmentsResponse {
  @IsNumber()
  id: number;

  @IsString()
  bank: string;

  @IsString()
  identification: string;

  @IsString()
  aditionalDescription: string;

  @IsString()
  cnpj: string;

  @IsDate()
  dueDate: Date;

  @IsString()
  signal: string;

  @IsNumber()
  value: number;
}
