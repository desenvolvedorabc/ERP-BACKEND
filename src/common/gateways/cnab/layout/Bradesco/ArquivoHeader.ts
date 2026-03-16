import { FieldConfig } from "../../types";

export type ArquivoHeader = {
  banco?: string;
  lote?: string;
  registro?: string;
  empresa_inscricao_tipo: string;
  empresa_inscricao_num: string;
  convenio: string;
  conta_agencia: string;
  agencia_dig_verificador?: string;
  conta_num: string;
  conta_dig_verificador?: string;
  empresa_nome: string;
  nome_banco: string;
  arquivo_cod?: string;
  arquivo_data_geracao: string;
  arquivo_hora_geracao: string;
  arquivo_sequencia: string;
  arquivo_layout?: string;
  arquivo_densidade?: string;
  filler?: string;
  header_PIX?: string;
  reservado_banco?: string;
  reservado_empresa?: string;
};

export const fieldHeader: FieldConfig<keyof ArquivoHeader>[] = [
  {
    id: "G001",
    field: "banco",
    startPos: 1,
    endPos: 3,
    length: 3,
    required: true,
    default: "237",
  },
  {
    id: "G002",
    field: "lote",
    startPos: 4,
    endPos: 7,
    length: 4,
    required: true,
    default: "0000",
  },
  {
    id: "G003",
    field: "registro",
    startPos: 8,
    endPos: 8,
    length: 1,
    required: true,
    default: "0",
  },
  {
    id: "G004",
    field: "filler",
    startPos: 9,
    endPos: 17,
    length: 9,
    required: false,
    default: new Array(9).fill(" ").join(""),
  },
  {
    id: "G005",
    field: "empresa_inscricao_tipo",
    startPos: 18,
    endPos: 18,
    length: 1,
    required: true,
    type: "numeric",
  },
  {
    id: "G006",
    field: "empresa_inscricao_num",
    startPos: 19,
    endPos: 32,
    length: 14,
    required: true,
    type: "numeric",
  },
  {
    id: "G007",
    field: "convenio",
    startPos: 33,
    endPos: 38,
    length: 6,
    required: true,
    type: "numeric",
  },
  {
    id: "G007",
    // Código do convênio/Perfil. Alinhar a esquerda 033 a 038 e 039 a 052 deixar em branco.
    field: "filler",
    startPos: 39,
    endPos: 52,
    length: 14,
    required: false,
    default: new Array(14).fill(" ").join(""),
  },
  {
    id: "G008",
    field: "conta_agencia",
    startPos: 53,
    endPos: 57,
    length: 5,
    required: true,
    type: "numeric",
  },
  {
    id: "G009",
    field: "agencia_dig_verificador",
    startPos: 58,
    endPos: 58,
    length: 1,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G010",
    field: "conta_num",
    startPos: 59,
    endPos: 70,
    length: 12,
    required: true,
    type: "numeric",
  },
  {
    id: "G011",
    field: "conta_dig_verificador",
    startPos: 71,
    endPos: 71,
    length: 1,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G012",
    field: "filler",
    startPos: 72,
    endPos: 72,
    length: 1,
    required: false,
    default: " ",
  },
  {
    id: "G013",
    field: "empresa_nome",
    startPos: 73,
    endPos: 102,
    length: 30,
    required: true,
    type: "alphanumeric",
  },
  {
    id: "G014",
    field: "nome_banco",
    startPos: 103,
    endPos: 132,
    length: 30,
    required: true,
    type: "alphanumeric",
  },
  {
    id: "G004",
    field: "filler",
    startPos: 133,
    endPos: 142,
    length: 10,
    required: false,
    default: new Array(10).fill(" ").join(""),
  },
  {
    id: "G015",
    field: "arquivo_cod",
    startPos: 143,
    endPos: 143,
    length: 1,
    required: true,
    default: "1",
  },
  {
    id: "G016",
    field: "arquivo_data_geracao",
    startPos: 144,
    endPos: 151,
    length: 8,
    required: true,
    type: "date",
  },
  {
    id: "G017",
    field: "arquivo_hora_geracao",
    startPos: 152,
    endPos: 157,
    length: 6,
    required: true,
    type: "hour",
  },
  {
    id: "G018",
    field: "arquivo_sequencia",
    startPos: 158,
    endPos: 163,
    length: 6,
    required: true,
    type: "numeric",
  },
  {
    id: "G019",
    field: "arquivo_layout",
    startPos: 164,
    endPos: 166,
    length: 3,
    required: true,
    default: "089", // Para Multipag '089'
  },
  {
    id: "G020",
    field: "arquivo_densidade",
    startPos: 167,
    endPos: 171,
    length: 5,
    required: false,
    default: "01600",
  },
  {
    id: "G021",
    field: "header_PIX", // Identificação Remessa PIX
    startPos: 172,
    endPos: 174,
    length: 3,
    required: true,
    default: "   ",
  },
  {
    id: "G021",
    field: "reservado_banco",
    startPos: 175,
    endPos: 191,
    length: 17,
    required: false,
    default: new Array(17).fill(" ").join(""),
  },
  {
    id: "G022",
    field: "reservado_empresa",
    startPos: 192,
    endPos: 211,
    length: 20,
    type: "alphanumeric",
    default: new Array(20).fill(" ").join(""),
  },
  {
    id: "G004",
    field: "filler",
    startPos: 212,
    endPos: 240,
    length: 29,
    required: false,
    default: new Array(29).fill(" ").join(""),
  },
];
