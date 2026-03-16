import { Type } from "class-transformer";
import { IsArray, IsString, ValidateNested } from "class-validator";
import { LancamentoSaldoDTO } from "./lancamentosSaldo.dto";

export class SaldoAplicacaoCCDTO {
  @IsString()
  codigoRetorno: string;

  @IsString()
  mensagem: string;

  @IsString()
  quantidadeLancamentos: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LancamentoSaldoDTO)
  lstLancamentosSaldos: LancamentoSaldoDTO[];
}
