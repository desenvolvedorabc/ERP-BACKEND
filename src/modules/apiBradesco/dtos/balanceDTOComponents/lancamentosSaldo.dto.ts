import {
  IsIn,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";

export class LancamentoSaldoDTO {
  @IsString()
  nomeProduto: string;

  @IsString()
  nomeProdutoResumido: string;

  @IsInt()
  codigoProduto: number;

  @IsString()
  identificadorSaldo: string;

  @IsString()
  @IsOptional()
  dataLancamentoDb2: string;

  @IsNumberString()
  valorLancamento: string;

  @IsIn(["+", "-"])
  sinalSaldo: string;
}
