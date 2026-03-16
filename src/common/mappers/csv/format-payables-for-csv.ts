import { formatDate } from "src/common/utils/date";
import { Payables } from "src/modules/payables/entities/payable.entity";

export function formatPayableToCsv(payables: Payables[]) {
  return payables.map((payable) => ({
    codigo_identificacao: payable.identifierCode ?? "N/A",
    nome_fornecedor: payable.supplier?.name ?? "N/A",
    status: payable.payableStatus ?? "N/A",
    tipo_pagamento: payable.paymentType ?? "N/A",
    valor_liquido: payable.liquidValue ?? "N/A",
    valor_imposto: payable.taxValue ?? "N/A",
    valor_total: (payable.liquidValue ?? 0) + (payable.taxValue ?? 0),
    metodo_pagamento: payable.paymentMethod ?? "N/A",
    documento_identificador: payable.docType ?? "N/A",
    conta: payable.account?.name ?? "N/A",
    contrato: payable.contract?.contractCode ?? "N/A",
    recorrente: payable.recurrent ? "SIM" : "NÃO",
    tipo_recorrencia: payable.recurenceData?.recurrenceType ?? "N/A",
    inicio_recorrencia: formatDate(payable.recurenceData?.startDate),
    fim_recorrencia: formatDate(payable.recurenceData?.endDate),
    dia_pagamento_recorrencia: payable.recurenceData?.dueDay ?? "N/A",
    data_vencimento: formatDate(payable.dueDate),
    data_pagamento: formatDate(payable.paymentDate),
    competencia: formatDate(payable.competenceDate),
    programa: payable.categorization?.program?.name ?? "N/A",

    planejamento_orcamentario:
      payable.categorization?.budgetPlan?.scenarioName ??
      `${payable.categorization?.budgetPlan?.year} ${payable.categorization?.program?.name} ${payable.categorization?.budgetPlan?.version.toFixed(1)}`,
    centro_custo: payable.categorization?.costCenter?.name ?? "N/A",
    categoria: payable.categorization?.costCenterCategory?.name ?? "N/A",
    subCategoria: payable.categorization?.costCenterSubCategory?.name ?? "N/A",
    codigo_barras: payable.barcode ?? "N/A",
  }));
}
