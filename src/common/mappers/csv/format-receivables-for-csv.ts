import { formatDate } from "src/common/utils/date";
import { Receivables } from "src/modules/receivables/entities/receivables.entity";

export function formatReceivableToCsv(receivables: Receivables[]) {
  return receivables.map((receivable) => ({
    codigo_identificacao: receivable.identifierCode ?? "N/A",
    nome_financiador: receivable.financier.name ?? "N/A",
    status: receivable.receivableStatus ?? "N/A",
    tipo_recebimento: receivable.receivableType ?? "N/A",
    valor_total: receivable.totalValue ?? "N/A",
    metodo_recebimento: receivable.receiptMethod ?? "N/A",
    documento_identificador: receivable.docType ?? "N/A", // ! não
    conta: receivable.account?.name ?? "N/A",
    contrato: receivable.contract?.contractCode ?? "N/A",
    recorrente: receivable.recurrent ? "SIM" : "NÃO",
    tipo_recorrencia: receivable.recurenceData?.recurrenceType ?? "N/A",
    inicio_recorrencia: formatDate(receivable.recurenceData?.startDate),
    fim_recorrencia: formatDate(receivable.recurenceData?.endDate),
    dia_recebimento_recorrencia: receivable.recurenceData?.dueDay ?? "N/A",
    data_vencimento: formatDate(receivable.dueDate),
    programa: receivable.categorization?.program?.name ?? "N/A",
    planejamento_orcamentario:
      receivable.categorization?.budgetPlan?.scenarioName ??
      `${receivable.categorization?.budgetPlan?.year} ${receivable.categorization?.program?.name} ${receivable.categorization?.budgetPlan?.version.toFixed(1)}`,
    centro_custo: receivable.categorization?.costCenter?.name ?? "N/A",
    categoria: receivable.categorization?.costCenterCategory?.name ?? "N/A",
    subCategoria:
      receivable.categorization?.costCenterSubCategory?.name ?? "N/A",
  }));
}
