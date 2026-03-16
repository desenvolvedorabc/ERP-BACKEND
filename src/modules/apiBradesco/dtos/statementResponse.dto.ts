import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { ExtratoUltimosLancamentosDTO } from "./statementDTOComponents/extratoUltimosLancamentos.dto";
import { ExtratoLancamentosFuturosDTO } from "./statementDTOComponents/extratoLancamentosFuturos.dto";
import { ExtratoPorPeriodoDTO } from "./statementDTOComponents/extratoPorPeriodo.dto";

export class StatementResponseDTO {
  @ValidateNested()
  @Type(() => ExtratoUltimosLancamentosDTO)
  extratoUltimosLancamentos: ExtratoUltimosLancamentosDTO;

  @ValidateNested()
  @Type(() => ExtratoLancamentosFuturosDTO)
  extratoLancamentosFuturos: ExtratoLancamentosFuturosDTO;

  @ValidateNested()
  @Type(() => ExtratoPorPeriodoDTO)
  extratoPorPeriodo: ExtratoPorPeriodoDTO;
}
