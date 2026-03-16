import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { SaldoDTO } from "./balanceDTOComponents/saldoCC.dto";
import { SaldoAplicacaoCCDTO } from "./balanceDTOComponents/saldoAplicacaoCC.dto";

export class BalanceResponseDTO {
  @ValidateNested()
  @Type(() => SaldoDTO)
  saldoCC: SaldoDTO;

  @ValidateNested()
  @Type(() => SaldoDTO)
  saldoCP: SaldoDTO;

  @ValidateNested()
  @Type(() => SaldoAplicacaoCCDTO)
  saldoAplicacaoCC: SaldoAplicacaoCCDTO;
}
