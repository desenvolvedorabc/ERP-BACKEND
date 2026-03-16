import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { LancamentoSaldoDTO } from "./lancamentosSaldo.dto";

export class SaldoDTO {
  @IsString()
  codigoRetorno: string;

  @IsString()
  mensagem: string;

  @IsString()
  identificaoCliente: string;

  @IsString()
  razaoConta: string;

  @IsString()
  numeroConta: string;

  @IsString()
  digitoConta: string;

  @IsString()
  nomeCliente: string;

  @IsString()
  statusContaCorrente: string;

  @IsString()
  statusContaPoupanca: string;

  @IsString()
  identificadorTipoConta: string;

  @IsString()
  statusCoberturaAutomatica: string;

  @IsString()
  contaPoupancaFacil: string;

  @IsString()
  @IsOptional()
  dataUltimaAtualizacao: string;

  @IsString()
  @IsOptional()
  identificadorModalidadeConta: string;

  @IsString()
  dataProximoPagamentoInss: string;

  @IsString()
  dataVencimentoCartaoInss: string;

  @IsString()
  @IsOptional()
  statusCartaoInss: string;

  @IsString()
  quantidadeLancamentos: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LancamentoSaldoDTO)
  lstLancamentosSaldos: LancamentoSaldoDTO[];
}
