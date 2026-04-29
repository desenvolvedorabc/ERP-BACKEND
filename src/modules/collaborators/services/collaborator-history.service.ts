import { Injectable } from '@nestjs/common'
import { CollaboratorHistoryRepository } from '../repositories/collaborator-history-repository'
import { CollaboratorHistory } from '../entities/collaborator-history.entity'
import { Collaborator } from '../entities/collaborator.entity'

function formatDateBR(date: Date | string | null | undefined): string | null {
  if (!date) return null
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return null
  return d.toLocaleDateString('pt-BR')
}

function formatMoney(value: number | null | undefined): string | null {
  if (value === null || value === undefined) return null
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const DISABLE_BY_LABELS: Record<string, string> = {
  DESLIGAMENTO_ABC: 'Desligamento ABC',
  FALECIMENTO: 'Falecimento',
  TEMPO_CONTRATO_FINALIZADO: 'Tempo de contrato finalizado',
  SOLICITACAO_RESCISAO_CONTRATUAL: 'Solicitação de rescisão contratual',
}

function formatDisableBy(value: string | null | undefined): string | null {
  if (!value) return null
  return DISABLE_BY_LABELS[value] ?? value
}

@Injectable()
export class CollaboratorHistoryService {
  constructor(private readonly historyRepository: CollaboratorHistoryRepository) {}

  /**
   * Registra a "foto inicial" do colaborador no momento da criação.
   * Gera um registro separado por atributo (Cargo, Programa, Admissão, Remuneração),
   * cada um com o changedField real do campo (role, PROGRAMA, startOfContract, remuneration).
   * O registro inicial é identificado pela ausência de valores "previous*".
   */
  async recordInitialSnapshot(
    collaboratorId: number,
    collaborator: Partial<Collaborator> & { remuneration?: number },
  ): Promise<void> {
    const records: Partial<CollaboratorHistory>[] = []

    // Cargo
    if (collaborator.role) {
      records.push({
        collaboratorId,
        changedField: 'role',
        newRole: collaborator.role,
        historico_antes: null,
        historico_depois: collaborator.role,
      })
    }

    // Programa (Área de Atuação)
    if (collaborator.occupationArea) {
      records.push({
        collaboratorId,
        changedField: 'PROGRAMA',
        newOccupationArea: collaborator.occupationArea,
        historico_antes: null,
        historico_depois: collaborator.occupationArea,
      })
    }

    // Data de Admissão
    if (collaborator.startOfContract) {
      const startDate =
        collaborator.startOfContract instanceof Date
          ? collaborator.startOfContract
          : new Date(collaborator.startOfContract)
      records.push({
        collaboratorId,
        changedField: 'startOfContract',
        newStartOfContract: startDate,
        historico_antes: null,
        historico_depois: formatDateBR(startDate),
      })
    }

    // Remuneração
    const remuneration = (collaborator as any).remuneration
    if (remuneration !== null && remuneration !== undefined) {
      records.push({
        collaboratorId,
        changedField: 'remuneration',
        newRemuneration: remuneration,
        historico_antes: null,
        historico_depois: formatMoney(remuneration),
      })
    }

    // Se nenhum campo foi preenchido, salva ao menos um registro genérico de inclusão
    if (records.length === 0) {
      records.push({
        collaboratorId,
        changedField: 'INCLUSAO',
        historico_antes: null,
        historico_depois: 'Colaborador incluído no sistema',
      })
    }

    for (const record of records) {
      await this.historyRepository.createHistory(record)
    }
  }

  async recordHistory(
    collaboratorId: number,
    previousData: Partial<Collaborator> & { remuneration?: number },
    newData: Partial<Collaborator> & { remuneration?: number },
  ): Promise<void> {
    const historyRecords: Partial<CollaboratorHistory>[] = []

    // Mudança de Cargo (role)
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
        historico_antes: previousData.role ?? null,
        historico_depois: newData.role ?? null,
      })
    }

    // Mudança de Data de Admissão (startOfContract)
    if (previousData.startOfContract !== undefined && newData.startOfContract !== undefined) {
      const toDateKey = (d: Date | string) => {
        const date = d instanceof Date ? d : new Date(d)
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      }
      const previousDateKey = toDateKey(previousData.startOfContract)
      const newDateKey = toDateKey(newData.startOfContract)

      if (previousDateKey !== newDateKey) {
        const prevDate =
          previousData.startOfContract instanceof Date
            ? previousData.startOfContract
            : new Date(previousData.startOfContract)
        const newDate =
          newData.startOfContract instanceof Date
            ? newData.startOfContract
            : new Date(newData.startOfContract)

        historyRecords.push({
          collaboratorId,
          previousStartOfContract: prevDate,
          newStartOfContract: newDate,
          changedField: 'startOfContract',
          historico_antes: formatDateBR(prevDate),
          historico_depois: formatDateBR(newDate),
        })
      }
    }

    // Mudança de Remuneração
    if (
      (previousData as any).remuneration !== undefined &&
      (newData as any).remuneration !== undefined &&
      (previousData as any).remuneration !== (newData as any).remuneration
    ) {
      const prevRem = (previousData as any).remuneration
      const newRem = (newData as any).remuneration
      historyRecords.push({
        collaboratorId,
        previousRemuneration: prevRem,
        newRemuneration: newRem,
        changedField: 'remuneration',
        historico_antes: formatMoney(prevRem),
        historico_depois: formatMoney(newRem),
      })
    }

    // Mudança de Status Ativo
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
        historico_antes: previousData.active ? 'Ativo' : 'Inativo',
        historico_depois: newData.active ? 'Ativo' : 'Inativo',
      })
    }

    // Mudança de Motivo de Desligamento (disableBy)
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
        historico_antes: formatDisableBy(previousData.disableBy),
        historico_depois: formatDisableBy(newData.disableBy),
      })
    }

    // Mudança de Programa (occupationArea)
    if (
      previousData.occupationArea !== undefined &&
      newData.occupationArea !== undefined &&
      previousData.occupationArea !== newData.occupationArea
    ) {
      historyRecords.push({
        collaboratorId,
        previousOccupationArea: previousData.occupationArea,
        newOccupationArea: newData.occupationArea,
        changedField: 'PROGRAMA',
        historico_antes: previousData.occupationArea ?? null,
        historico_depois: newData.occupationArea ?? null,
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
