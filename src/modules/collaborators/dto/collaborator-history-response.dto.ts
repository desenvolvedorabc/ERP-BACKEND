import { ApiProperty } from "@nestjs/swagger";

export class CollaboratorHistoryResponseDto {
  @ApiProperty({ description: "ID do registro de histórico" })
  id: number;

  @ApiProperty({ description: "Data de criação do registro" })
  createdAt: Date;

  @ApiProperty({ description: "Cargo anterior", nullable: true })
  previousRole: string | null;

  @ApiProperty({ description: "Novo cargo", nullable: true })
  newRole: string | null;

  @ApiProperty({ description: "Data de admissão anterior", nullable: true })
  previousStartOfContract: Date | null;

  @ApiProperty({ description: "Nova data de admissão", nullable: true })
  newStartOfContract: Date | null;

  @ApiProperty({ description: "Remuneração anterior", nullable: true })
  previousRemuneration: number | null;

  @ApiProperty({ description: "Nova remuneração", nullable: true })
  newRemuneration: number | null;

  @ApiProperty({ description: "Status ativo anterior", nullable: true })
  previousActive: boolean | null;

  @ApiProperty({ description: "Novo status ativo", nullable: true })
  newActive: boolean | null;

  @ApiProperty({ description: "Motivo de desligamento anterior", nullable: true })
  previousDisableBy: string | null;

  @ApiProperty({ description: "Novo motivo de desligamento", nullable: true })
  newDisableBy: string | null;

  @ApiProperty({ description: "Campo que foi alterado" })
  changedField: string;
}

