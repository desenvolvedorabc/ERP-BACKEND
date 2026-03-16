import { Type } from "class-transformer";
import { IsArray, IsString, ValidateNested } from "class-validator";
import { LancamentoMensalDTO } from "./extratoLancamentoMensal.dto";

export class ExtratoPorPeriodoDTO {
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

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => LancamentoMensalDTO)
  lstLancamentoMensal: LancamentoMensalDTO[];
}
