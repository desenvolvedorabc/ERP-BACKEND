import { GeneralReportReturn } from "../types/generalReport";

export const analysisHeader = [
  "TIPO",
  "PLANO",
  "CENTRO DE CUSTO",
  "TOTAL",
  "MÊS",
];

export const cashflowHeader = [
  "TIPO",
  "CATEGORIA",
  "SUBCATEGORIA",
  "REALIZADO",
  "ESPERADO",
];

export const generalHeader: Record<
  keyof Omit<GeneralReportReturn, "E_ID" | "bancary" | "pix" | "data">,
  string
> = {
  ID: "ID",
  numero_contrato: "CONTRATO",
  tipo: "TIPO",
  code: "CODIGO",
  vencimento: "VENCIMENTO",
  parcela: "PARCELA",
  apontamento: "APONTAMENTO",
  fornecedor: "FORNECEDOR",
  financiador: "FINANCIADOR",
  colaborador: "COLABORADOR",
  centro_custo: "CENTRO DE CUSTO",
  categoria: "CATEGORIA",
  sub_categoria: "SUBCATEGORIA",
};

export const noContractsHeader = [
  "FORNECEDOR",
  "PLANO ORÇAMENTÁRIO",
  "TOTAL",
  "TOTAL RESTANTE",
];

export const positionsHeader = (type: "r" | "p") => [
  type === "r" ? "FINANCIADOR" : "FORNECEDOR",
  "CENTRO DE CUSTO",
  "CATEGORIA",
  "PENDENTE",
  "PAGO",
  "ATRASADO",
];

export const realizedHeaders = [
  "CENTRO DE CUSTO",
  "CATEGORIA",
  "SUBCATEGORIA",
  "MÊS/ANO",
  "ESPERADO",
  "REALIZADO",
];
