import { formatDate } from "src/common/utils/date";
import { formatCPF, formatTelephone } from "src/common/utils/formats";
import { Collaborator } from "src/modules/collaborators/entities/collaborator.entity";
import { formatHistoryToPortuguese } from "src/common/utils/format-history-portuguese";
import { maskMonetaryValue } from "src/common/utils/masks";
import { ContractStatus } from "src/modules/contracts/enums";

type CollaboratorWithHistory = Collaborator & {
  history?: any[];
};

export function formatCollaboratorForCsv(
  collaborators: CollaboratorWithHistory[],
) {
  const data = collaborators.map((collaborator) => {
    let remuneracao: string = "N/A";
    if (collaborator.contracts && collaborator.contracts.length > 0) {
      const activeContract = collaborator.contracts.find(
        (contract) =>
          contract.contractStatus === ContractStatus.SIGNED ||
          contract.contractStatus === ContractStatus.ONGOING,
      );
      if (activeContract && activeContract.totalValue) {
        remuneracao = maskMonetaryValue(activeContract.totalValue);
      }
    }
    if (remuneracao === "N/A" && collaborator.history?.length) {
      const lastRemHistory = collaborator.history.find(
        (h) => h.newRemuneration !== null && h.newRemuneration !== undefined,
      );
      if (lastRemHistory?.newRemuneration) {
        remuneracao = maskMonetaryValue(Number(lastRemHistory.newRemuneration));
      }
    }

    const historico = collaborator.history
      ? formatHistoryToPortuguese(collaborator.history)
      : "N/A";

    return {
      nome: collaborator?.name ?? "N/A",
      nome_contato_emergencia: collaborator?.emergencyContactName ?? "N/A",
      email: collaborator?.email ?? "N/A",
      telefone: collaborator?.telephone
        ? formatTelephone(collaborator?.telephone)
        : "N/A",
      telefone_contato_emergencia: collaborator?.emergencyContactTelephone
        ? formatTelephone(collaborator?.emergencyContactTelephone)
        : "N/A",
      cpf: collaborator?.cpf ? formatCPF(collaborator?.cpf) : "N/A",
      rg: collaborator?.rg ?? "N/A",
      status_cadastro: collaborator?.status ?? "N/A",
      ativo: collaborator.active ? "Sim" : "Não",
      desativador_por: collaborator?.disableBy ?? "N/A",
      programa: collaborator.occupationArea,
      funcao: collaborator.role,
      inicio_contrato: collaborator?.startOfContract
        ? formatDate(collaborator?.startOfContract)
        : "N/A",
      data_nascimento: collaborator?.dateOfBirth
        ? formatDate(collaborator?.dateOfBirth)
        : "N/A",
      endereco_completo: collaborator?.completeAddress ?? "N/A",
      vinculo_empregaticio: collaborator?.employmentRelationship ?? "N/A",
      identidade_de_genero: collaborator?.genderIdentity ?? "N/A",
      raca_cor: collaborator?.race ?? "N/A",
      alergias: collaborator?.allergies ?? "N/A",
      categoria_alimentar: collaborator?.foodCategory ?? "N/A",
      descricao_categoria_alimentar:
        collaborator?.foodCategoryDescription ?? "N/A",
      escolaridade: collaborator?.education ?? "N/A",
      experiencia_setor_publico:
        collaborator?.experienceInThePublicSector === null
          ? "N/A"
          : collaborator?.experienceInThePublicSector
            ? "Sim"
            : "Não",
      biografia: collaborator?.biography ?? "N/A",
      remuneracao: remuneracao,
      historico: historico,
    };
  });

  return {
    data,
  };
}
