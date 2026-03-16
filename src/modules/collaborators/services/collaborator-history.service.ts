import { Injectable } from '@nestjs/common'
import { CollaboratorHistoryRepository } from '../repositories/collaborator-history-repository'
import { CollaboratorHistory } from '../entities/collaborator-history.entity'
import { Collaborator } from '../entities/collaborator.entity'

@Injectable()
export class CollaboratorHistoryService {
  constructor(private readonly historyRepository: CollaboratorHistoryRepository) {}

  async recordHistory(
    collaboratorId: number,
    previousData: Partial<Collaborator>,
    newData: Partial<Collaborator>,
  ): Promise<void> {
    const historyRecords: Partial<CollaboratorHistory>[] = []

    if (
      previousData.role !== undefined &&
      newData.role !== undefined &&
      previousData.role !== newData.role
    ) {
      historyRecords.push({
        collaboratorId,
        previousRole: previousData.role,
        newRole: newData.role,
        changedField: 'role',
      })
    }

    if (previousData.startOfContract !== undefined && newData.startOfContract !== undefined) {
      const previousTime =
        previousData.startOfContract instanceof Date
          ? previousData.startOfContract.getTime()
          : new Date(previousData.startOfContract).getTime()
      const newTime =
        newData.startOfContract instanceof Date
          ? newData.startOfContract.getTime()
          : new Date(newData.startOfContract).getTime()

      if (previousTime !== newTime) {
        historyRecords.push({
          collaboratorId,
          previousStartOfContract:
            previousData.startOfContract instanceof Date
              ? previousData.startOfContract
              : new Date(previousData.startOfContract),
          newStartOfContract:
            newData.startOfContract instanceof Date
              ? newData.startOfContract
              : new Date(newData.startOfContract),
          changedField: 'startOfContract',
        })
      }
    }

    if (
      (previousData as any).remuneration !== undefined &&
      (newData as any).remuneration !== undefined &&
      (previousData as any).remuneration !== (newData as any).remuneration
    ) {
      historyRecords.push({
        collaboratorId,
        previousRemuneration: (previousData as any).remuneration,
        newRemuneration: (newData as any).remuneration,
        changedField: 'remuneration',
      })
    }

    if (
      previousData.active !== undefined &&
      newData.active !== undefined &&
      previousData.active !== newData.active
    ) {
      historyRecords.push({
        collaboratorId,
        previousActive: previousData.active,
        newActive: newData.active,
        previousDisableBy: previousData.disableBy,
        newDisableBy: newData.disableBy,
        changedField: 'active',
      })
    }

    // Verificar mudança em disableBy (motivo do desligamento)
    if (
      previousData.disableBy !== undefined &&
      newData.disableBy !== undefined &&
      previousData.disableBy !== newData.disableBy
    ) {
      historyRecords.push({
        collaboratorId,
        previousActive: previousData.active,
        newActive: newData.active,
        previousDisableBy: previousData.disableBy,
        newDisableBy: newData.disableBy,
        changedField: 'disableBy',
      })
    }

    // Salvar todos os registros de histórico
    for (const record of historyRecords) {
      await this.historyRepository.createHistory(record)
    }
  }

  async getHistoryByCollaboratorId(collaboratorId: number): Promise<CollaboratorHistory[]> {
    return await this.historyRepository.findByCollaboratorId(collaboratorId)
  }
}
