import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { LancamentoDTO } from "./lancamento.dto";

export class ListaLancamentosDTO {
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => LancamentoDTO)
  "Saldo Anterior": LancamentoDTO[];

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => LancamentoDTO)
  "Ultimos Lancamentos": LancamentoDTO[];

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => LancamentoDTO)
  "Lancamentos Dia": LancamentoDTO[];
}
