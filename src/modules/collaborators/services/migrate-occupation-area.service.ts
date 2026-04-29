import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { CollaboratorHistory } from "../entities/collaborator-history.entity";
import { Collaborator } from "../entities/collaborator.entity";

export interface MigrateOccupationAreaResult {
  success: boolean;
  updated: number;
  skipped: number;
  message: string;
}

/**
 * Serviço responsável por popular retroativamente o campo newOccupationArea
 * nos registros de histórico legado que não possuem essa informação.
 *
 * Estratégia: usa o occupationArea atual do colaborador como melhor aproximação
 * disponível para o histórico legado, permitindo ao BI calcular custos por
 * programa desde o início do contrato.
 */
@Injectable()
export class MigrateOccupationAreaService {
  constructor(private readonly dataSource: DataSource) {}

  async migrateOccupationArea(): Promise<MigrateOccupationAreaResult> {
    const historyRepo = this.dataSource.getRepository(CollaboratorHistory);
    const collaboratorRepo = this.dataSource.getRepository(Collaborator);

    // Buscar todos os registros de histórico sem newOccupationArea
    const recordsWithoutArea = await historyRepo
      .createQueryBuilder("h")
      .where("h.newOccupationArea IS NULL")
      .getMany();

    if (recordsWithoutArea.length === 0) {
      return {
        success: true,
        updated: 0,
        skipped: 0,
        message: "Nenhum registro legado encontrado para migrar.",
      };
    }

    // Agrupar por collaboratorId para evitar múltiplas consultas ao mesmo colaborador
    const collaboratorIds = [
      ...new Set(recordsWithoutArea.map((r) => r.collaboratorId)),
    ];

    // Buscar todos os colaboradores de uma vez
    const collaborators = await collaboratorRepo.findByIds(collaboratorIds);
    const collaboratorMap = new Map(collaborators.map((c) => [c.id, c]));

    let updated = 0;
    let skipped = 0;

    for (const record of recordsWithoutArea) {
      const collaborator = collaboratorMap.get(record.collaboratorId);

      if (!collaborator || !collaborator.occupationArea) {
        skipped++;
        continue;
      }

      await historyRepo.update(record.id, {
        newOccupationArea: collaborator.occupationArea,
      });

      updated++;
    }

    return {
      success: true,
      updated,
      skipped,
      message: `Migração concluída. ${updated} registros atualizados, ${skipped} ignorados (colaborador sem área de atuação).`,
    };
  }
}
