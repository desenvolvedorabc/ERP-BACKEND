import { formatDate } from "src/common/utils/date";
import { maskMonetaryValue } from "src/common/utils/masks";
import { Collaborator } from "src/modules/collaborators/entities/collaborator.entity";
import { CollaboratorHistory } from "src/modules/collaborators/entities/collaborator-history.entity";

type CollaboratorWithHistory = Collaborator & {
  history?: CollaboratorHistory[];
};

export interface CollaboratorTimelineRow {
  nome: string;
  email: string;
  cpf: string;
  programa: string;
  inicio_contrato: string;
  tipo_alteracao: string;
  historico_antes: string;
  historico_depois: string;
  data_alteracao: string;
}

const CHANGE_TYPE_LABELS: Record<string, string> = {
  role: "Cargo",
  startofcontract: "Admissão",
  start_of_contract: "Admissão",
  remuneration: "Remuneração",
  "remuneração": "Remuneração",
  active: "Status",
  disableby: "Desligamento",
  disable_by: "Desligamento",
  history_text: "Histórico legado",
  inclusao: "Inclusão",
  programa: "Programa",
};

function formatDisableBy(disableBy: string): string {
  const translations: Record<string, string> = {
    DESLIGAMENTO_ABC: "Desligamento ABC",
    FALECIMENTO: "Falecimento",
    TEMPO_CONTRATO_FINALIZADO: "Tempo de contrato finalizado",
    SOLICITACAO_RESCISAO_CONTRATUAL: "Solicitação de rescisão contratual",
  };
  return translations[disableBy] || disableBy;
}

interface HistoryEntryFormatted {
  text: string | null;
  antes: string;
  depois: string;
}

function formatHistoryEntry(entry: CollaboratorHistory): HistoryEntryFormatted {
  let text: string | null = null;
  let antes = "";
  let depois = "";

  const hasTabularData =
    entry.historico_antes !== null && entry.historico_antes !== undefined ||
    entry.historico_depois !== null && entry.historico_depois !== undefined;

  if (hasTabularData) {
    antes = entry.historico_antes ?? "";
    depois = entry.historico_depois ?? "";
  }

  switch (entry.changedField?.toLowerCase()) {
    case "inclusao":
      text = entry.historico_depois || "Colaborador incluído no sistema";
      if (!hasTabularData) {
        antes = "";
        depois = entry.historico_depois ?? "";
      }
      break;

    case "programa":
      if (entry.previousOccupationArea && entry.newOccupationArea) {
        text = `Programa alterado de "${entry.previousOccupationArea}" para "${entry.newOccupationArea}"`;
      } else if (entry.newOccupationArea) {
        text = `Programa definido como "${entry.newOccupationArea}"`;
      }
      if (!hasTabularData) {
        antes = entry.previousOccupationArea ?? "";
        depois = entry.newOccupationArea ?? "";
      }
      break;

    case "role":
      if (entry.previousRole && entry.newRole) {
        text = `Cargo alterado de "${entry.previousRole}" para "${entry.newRole}"`;
      } else if (entry.newRole) {
        text = `Cargo definido como "${entry.newRole}"`;
      }
      if (!hasTabularData) {
        antes = entry.previousRole ?? "";
        depois = entry.newRole ?? "";
      }
      break;

    case "startofcontract":
    case "start_of_contract":
      if (entry.previousStartOfContract && entry.newStartOfContract) {
        text = `Admissão alterada de ${formatDate(entry.previousStartOfContract)} para ${formatDate(entry.newStartOfContract)}`;
      } else if (entry.newStartOfContract) {
        text = `Admissão definida como ${formatDate(entry.newStartOfContract)}`;
      }
      if (!hasTabularData) {
        antes = entry.previousStartOfContract ? formatDate(entry.previousStartOfContract) : "";
        depois = entry.newStartOfContract ? formatDate(entry.newStartOfContract) : "";
      }
      break;

    case "remuneration":
    case "remuneração":
      if (
        entry.previousRemuneration !== null &&
        entry.newRemuneration !== null
      ) {
        const prevValue = entry.previousRemuneration
          ? maskMonetaryValue(Number(entry.previousRemuneration))
          : "N/A";
        const newValue = entry.newRemuneration
          ? maskMonetaryValue(Number(entry.newRemuneration))
          : "N/A";
        text = `Remuneração alterada de ${prevValue} para ${newValue}`;
      } else if (entry.newRemuneration !== null) {
        const newValue = entry.newRemuneration
          ? maskMonetaryValue(Number(entry.newRemuneration))
          : "N/A";
        text = `Remuneração definida como ${newValue}`;
      }
      if (!hasTabularData) {
        antes = entry.previousRemuneration !== null && entry.previousRemuneration !== undefined
          ? maskMonetaryValue(Number(entry.previousRemuneration))
          : "";
        depois = entry.newRemuneration !== null && entry.newRemuneration !== undefined
          ? maskMonetaryValue(Number(entry.newRemuneration))
          : "";
      }
      break;

    case "active":
      if (entry.previousActive !== null && entry.newActive !== null) {
        if (entry.previousActive && !entry.newActive) {
          const motivo = entry.newDisableBy
            ? ` (Motivo: ${formatDisableBy(entry.newDisableBy)})`
            : "";
          text = `Desligamento${motivo}`;
        } else if (!entry.previousActive && entry.newActive) {
          text = "Reativação";
        }
      }
      if (!hasTabularData) {
        antes = entry.previousActive !== null && entry.previousActive !== undefined
          ? (entry.previousActive ? "Ativo" : "Inativo")
          : "";
        depois = entry.newActive !== null && entry.newActive !== undefined
          ? (entry.newActive ? "Ativo" : "Inativo")
          : "";
      }
      break;

    case "disableby":
    case "disable_by":
      if (entry.previousDisableBy && entry.newDisableBy) {
        text = `Motivo de desligamento alterado de "${formatDisableBy(entry.previousDisableBy)}" para "${formatDisableBy(entry.newDisableBy)}"`;
      } else if (entry.newDisableBy) {
        text = `Motivo de desligamento definido como "${formatDisableBy(entry.newDisableBy)}"`;
      }
      if (!hasTabularData) {
        antes = entry.previousDisableBy ? formatDisableBy(entry.previousDisableBy) : "";
        depois = entry.newDisableBy ? formatDisableBy(entry.newDisableBy) : "";
      }
      break;

    case "history_text":
      if (entry.newRole) {
        text = entry.newRole;
      }
      if (!hasTabularData) {
        antes = "";
        depois = entry.newRole ?? "";
      }
      break;
  }

  return { text, antes, depois };
}

function isValidHistoryText(text: string): boolean {
  // Remove espaços e verifica se tem pelo menos um caractere alfanumérico
  return /[a-zA-Z0-9À-ÿ]/.test(text);
}

export function formatCollaboratorsTimeline(
  collaborators: CollaboratorWithHistory[],
): CollaboratorTimelineRow[] {
  const rows: CollaboratorTimelineRow[] = [];

  for (const collaborator of collaborators) {
    const nome = collaborator.name ?? "N/A";
    const email = collaborator.email ?? "N/A";
    const cpf = collaborator.cpf ? collaborator.cpf.replace(/\D/g, "") : "N/A";
    const programa = collaborator.occupationArea ?? "N/A";
    const inicio_contrato = formatDate(collaborator.startOfContract);
    const history = collaborator.history ?? [];

    if (history.length === 0) {
      continue;
    }

    for (const entry of history) {
      const { text, antes, depois } = formatHistoryEntry(entry);
      if (!text || !isValidHistoryText(text)) continue;

      const tipo = CHANGE_TYPE_LABELS[entry.changedField?.toLowerCase()] ?? entry.changedField ?? "N/A";

      rows.push({
        nome,
        email,
        cpf,
        programa,
        inicio_contrato,
        tipo_alteracao: tipo,
        historico_antes: antes,
        historico_depois: depois,
        data_alteracao: formatDate(entry.createdAt),
      });
    }
  }

  return rows;
}
