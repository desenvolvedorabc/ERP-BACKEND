import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { ListaLancamentosDTO } from "./extratoLancamentos.dto";
import { Type } from "class-transformer";

export class ExtratoUltimosLancamentosDTO {
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
  quantidadeLancamentos: string;

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

  @IsObject()
  @ValidateNested()
  @Type(() => ListaLancamentosDTO)
  listaLancamentos: ListaLancamentosDTO;
}
