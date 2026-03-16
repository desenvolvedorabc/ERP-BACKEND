import { IsNumberString, IsOptional, IsString } from "class-validator";

export class LancamentoMensalDTO {
  @IsString()
  dataLancamento: string;

  @IsString()
  numeroDocumento: string;

  @IsNumberString()
  valorLancamento: string;

  @IsString()
  sinalLancamento: string;

  @IsString()
  @IsOptional()
  segundaLinhalLancamento: string;

  @IsString()
  valorSaldoAposLancamento: string;

  @IsString()
  sinalSaldo: string;

  @IsString()
  tipoLancamento: string;

  @IsString()
  codigoLancamento: string;

  @IsString()
  descritivoLancamentoAbreviado: string;

  @IsString()
  descritivoLancamentoCompleto: string;

  @IsString()
  @IsOptional()
  dataDebitoCpmf: string;

  @IsString()
  @IsOptional()
  valorCpmf: string;
}
