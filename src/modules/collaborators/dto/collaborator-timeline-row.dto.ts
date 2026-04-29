import { ApiProperty } from "@nestjs/swagger";

export class CollaboratorTimelineRowDto {
  @ApiProperty({ description: "Nome do colaborador" })
  nome: string;

  @ApiProperty({ description: "Email do colaborador" })
  email: string;

  @ApiProperty({ description: "CPF do colaborador" })
  cpf: string;

  @ApiProperty({ description: "Área de ocupação/Programa atual do colaborador" })
  programa: string;

  @ApiProperty({ description: "Data de início do contrato" })
  inicio_contrato: string;

  @ApiProperty({ description: "Tipo da alteração (Inclusão, Cargo, Remuneração, Status, Admissão, Desligamento, Programa, Histórico legado)" })
  tipo_alteracao: string;

  @ApiProperty({ description: "Entrada do histórico de alterações em texto descritivo (mantido para auditoria humana)" })
  historico: string;

  @ApiProperty({ description: "Valor anterior do campo alterado (De) — para análise tabulada em BI" })
  historico_antes: string;

  @ApiProperty({ description: "Novo valor do campo alterado (Para) — para análise tabulada em BI" })
  historico_depois: string;

  @ApiProperty({ description: "Data em que a alteração foi realizada" })
  data_alteracao: string;
}
