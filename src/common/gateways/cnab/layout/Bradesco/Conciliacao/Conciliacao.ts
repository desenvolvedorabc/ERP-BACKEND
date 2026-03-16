import { FieldConfig } from "../../../types";

export type Conciliacao = {
  banco: string;
  lote: string;
  registro: string;
  num_seq_registro_lote: string;
  cod_seg_registro_lote: string;
  filler?: string;
  empresa_tipo_insc: string;
  empresa_num_insc: string;
  convenio: string;
  conta_agencia?: string;
  agencia_dig_verificador?: string;
  conta_num?: string;
  conta_dig_verificador?: string;
  ag_conta_digito_verificador?: string;
  empresa_nome: string;
  natureza_lcto?: string;
  tipo_complemento?: string;
  complemento?: string;
  isencao_cpmf?: string;
  data_contabil?: string;
  data_lancamento?: string;
  valor_lancamento?: string;
  tipo_lancamento: string;
  categoria_lancamento?: string;
  codigo_historico?: string;
  descricao_historico?: string;
  num_documento_compl?: string;
};

export const fieldsConciliacao: FieldConfig<keyof Conciliacao>[] = [
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
    default: "3",
  },
  {
    id: "G038",
    field: "num_seq_registro_lote",
    startPos: 9,
    endPos: 13,
    length: 5,
    required: true,
    type: "numeric",
  },
  {
    id: "G039",
    field: "cod_seg_registro_lote",
    startPos: 14,
    endPos: 14,
    length: 1,
    required: true,
    default: "E",
  },
  {
    id: "G004",
    field: "filler",
    startPos: 15,
    endPos: 17,
    length: 3,
    required: false,
    default: new Array(3).fill(" ").join(""),
  },
  {
    id: "G005",
    field: "empresa_tipo_insc",
    startPos: 18,
    endPos: 18,
    length: 1,
    required: true,
    type: "numeric",
  },
  {
    id: "G006",
    field: "empresa_num_insc",
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
    endPos: 52,
    length: 20,
    required: true,
    type: "numeric",
  },
  {
    id: "G008",
    field: "conta_agencia",
    startPos: 53,
    endPos: 57,
    length: 5,
    required: false,
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
    required: false,
    type: "numeric",
  },
  {
    id: "G011",
    field: "conta_dig_verificador",
    startPos: 71,
    endPos: 71,
    length: 1,
    required: false,
    type: "numeric",
  },
  {
    id: "G012",
    field: "ag_conta_digito_verificador",
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
    id: "G004",
    field: "filler",
    startPos: 103,
    endPos: 108,
    length: 6,
    required: false,
    default: new Array(6).fill(" ").join(""),
  },
  {
    id: "G014",
    field: "natureza_lcto",
    startPos: 109,
    endPos: 111,
    length: 3,
    required: false,
    type: "numeric",
  },
  {
    id: "G015",
    field: "tipo_complemento",
    startPos: 112,
    endPos: 113,
    length: 2,
    required: false,
    type: "numeric",
  },
  {
    id: "G016",
    field: "complemento",
    startPos: 114,
    endPos: 133,
    length: 20,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G017",
    field: "isencao_cpmf",
    startPos: 134,
    endPos: 134,
    length: 1,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G018",
    field: "data_contabil",
    startPos: 135,
    endPos: 142,
    length: 8,
    required: false,
    type: "numeric",
  },
  {
    id: "G019",
    field: "data_lancamento",
    startPos: 143,
    endPos: 150,
    length: 8,
    required: false,
    type: "numeric",
  },
  {
    id: "G020",
    field: "valor_lancamento",
    startPos: 151,
    endPos: 168,
    length: 18,
    required: false,
    type: "numeric",
  },
  {
    id: "G021",
    field: "tipo_lancamento",
    startPos: 169,
    endPos: 169,
    length: 1,
    required: true,
    type: "alphanumeric",
  },
  {
    id: "G022",
    field: "categoria_lancamento",
    startPos: 170,
    endPos: 172,
    length: 3,
    required: false,
    type: "numeric",
  },
  {
    id: "G023",
    field: "codigo_historico",
    startPos: 173,
    endPos: 176,
    length: 4,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G024",
    field: "descricao_historico",
    startPos: 177,
    endPos: 201,
    length: 25,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G025",
    field: "num_documento_compl",
    startPos: 202,
    endPos: 240,
    length: 39,
    required: false,
  },
];
