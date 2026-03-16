import { IsString } from "class-validator";
import { IsNullable } from "src/common/decorators/IsNullable";

export class GeneralReportResponseDTO {
  @IsNullable()
  @IsString()
  numero_contrato: string | null;

  @IsNullable()
  @IsString()
  tipo: string | null;

  @IsNullable()
  @IsString()
  code: string | null;

  @IsNullable()
  @IsString()
  vencimento: string | null;

  @IsNullable()
  @IsString()
  parcela: string | null;

  @IsNullable()
  @IsString()
  apontamento: string | null;

  @IsNullable()
  @IsString()
  fornecedor: string | null;

  @IsNullable()
  @IsString()
  financiador: string | null;

  @IsNullable()
  @IsString()
  colaborador: string | null;

  @IsNullable()
  @IsString()
  centro_custo: string | null;

  @IsNullable()
  @IsString()
  categoria: string | null;

  @IsNullable()
  @IsString()
  sub_categoria: string | null;

  @IsNullable()
  @IsString()
  pix: string | null;

  @IsNullable()
  @IsString()
  ID: string | null;

  @IsNullable()
  @IsString()
  data: string | null;
}
