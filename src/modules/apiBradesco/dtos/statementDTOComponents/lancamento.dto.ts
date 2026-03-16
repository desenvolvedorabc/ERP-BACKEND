import { IsNumberString, IsOptional, IsString } from "class-validator";

export class LancamentoDTO {
  @IsString()
  sinalSaldo: string;

  @IsNumberString()
  valorLancamento: string;

  @IsString()
  @IsOptional()
  segundaLinhalLancamento: string;

  @IsString()
  @IsOptional()
  sinalLancamento: string;

  @IsString()
  identificacaoSubCodigo: string;

  @IsString()
  numeroDocumento: string;

  @IsString()
  @IsOptional()
  valorSaldoAposLancamento: string;

  @IsString()
  dataLancamento: string;

  @IsString()
  @IsOptional()
  codigoLancamento: string;

  @IsString()
  @IsOptional()
  descritivoLancamentoAbreviado: string;

  @IsString()
  @IsOptional()
  descritivoLancamentoCompleto: string;
}
