import { CollaboratorHistory } from "src/modules/collaborators/entities/collaborator-history.entity";
import { formatDate } from "./date";
import { maskMonetaryValue } from "./masks";

export function formatHistoryToPortuguese(
  history: CollaboratorHistory[],
): string {
  if (!history || history.length === 0) {
    return "N/A";
  }

  const formattedEntries = history.map((entry) => {
    const parts: string[] = [];

    switch (entry.changedField?.toLowerCase()) {
      case "role":
        if (entry.previousRole && entry.newRole) {
          parts.push(
            `Cargo alterado de "${entry.previousRole}" para "${entry.newRole}"`,
          );
        } else if (entry.newRole) {
          parts.push(`Cargo definido como "${entry.newRole}"`);
        }
        break;

      case "startofcontract":
      case "start_of_contract":
        if (entry.previousStartOfContract && entry.newStartOfContract) {
          parts.push(
            `Admissão alterada de ${formatDate(entry.previousStartOfContract)} para ${formatDate(entry.newStartOfContract)}`,
          );
        } else if (entry.newStartOfContract) {
          parts.push(
            `Admissão definida como ${formatDate(entry.newStartOfContract)}`,
          );
        }
        break;

      case "remuneration":
      case "remuneração":
        if (entry.previousRemuneration !== null && entry.newRemuneration !== null) {
          const prevValue = entry.previousRemuneration
            ? maskMonetaryValue(Number(entry.previousRemuneration))
            : "N/A";
          const newValue = entry.newRemuneration
            ? maskMonetaryValue(Number(entry.newRemuneration))
            : "N/A";
          parts.push(
            `Remuneração alterada de ${prevValue} para ${newValue}`,
          );
        } else if (entry.newRemuneration !== null) {
          const newValue = entry.newRemuneration
            ? maskMonetaryValue(Number(entry.newRemuneration))
            : "N/A";
          parts.push(`Remuneração definida como ${newValue}`);
        }
        break;

      case "active":
        if (entry.previousActive !== null && entry.newActive !== null) {
          if (entry.previousActive && !entry.newActive) {
            const motivo = entry.newDisableBy
              ? ` (Motivo: ${formatDisableBy(entry.newDisableBy)})`
              : "";
            parts.push(`Desligamento${motivo}`);
          } else if (!entry.previousActive && entry.newActive) {
            parts.push("Reativação");
          }
        }
        break;

      case "disableby":
      case "disable_by":
        if (entry.previousDisableBy && entry.newDisableBy) {
          parts.push(
            `Motivo de desligamento alterado de "${formatDisableBy(entry.previousDisableBy)}" para "${formatDisableBy(entry.newDisableBy)}"`,
          );
        } else if (entry.newDisableBy) {
          parts.push(
            `Motivo de desligamento definido como "${formatDisableBy(entry.newDisableBy)}"`,
          );
        }
        break;

      case "history_text":
        if (entry.newRole) {
          parts.push(entry.newRole);
        }
        break;

      case "inclusao":
        if (entry.historico_depois) {
          parts.push(entry.historico_depois);
        } else {
          parts.push("Colaborador incluído no sistema");
        }
        break;

      case "programa":
        if (entry.previousOccupationArea && entry.newOccupationArea) {
          parts.push(
            `Programa alterado de "${entry.previousOccupationArea}" para "${entry.newOccupationArea}"`,
          );
        } else if (entry.newOccupationArea) {
          parts.push(`Programa definido como "${entry.newOccupationArea}"`);
        }
        break;
    }

    // Adicionar data se disponível
    if (entry.createdAt) {
      const dateStr = formatDate(entry.createdAt);
      if (parts.length > 0) {
        parts[parts.length - 1] += ` em ${dateStr}`;
      }
    }

    return parts.join(", ");
  });

  // Separar por {}
  return formattedEntries.filter((entry) => entry).join(" {} ");
}

function formatDisableBy(disableBy: string): string {
  const translations: Record<string, string> = {
    DESLIGAMENTO_ABC: "Desligamento ABC",
    FALECIMENTO: "Falecimento",
    TEMPO_CONTRATO_FINALIZADO: "Tempo de contrato finalizado",
    SOLICITACAO_RESCISAO_CONTRATUAL: "Solicitação de rescisão contratual",
  };

  return translations[disableBy] || disableBy;
}

