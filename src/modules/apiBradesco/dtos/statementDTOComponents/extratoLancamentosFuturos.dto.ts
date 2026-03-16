import { Type } from "class-transformer";
import { IsArray, IsString, ValidateNested } from "class-validator";
import { LancamentoDTO } from "./lancamento.dto";

export class ExtratoLancamentosFuturosDTO {
  @IsString()
  codigoRetorno: string;

  @IsString()
  mensagem: string;

  @IsString()
  quantidadeLancamentos: string;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => LancamentoDTO)
  listaLancamentosFuturos: LancamentoDTO[];
}
