import { FieldConfig } from "../../../types";

export type SegmentoB = {
  banco?: string;
  lote: string;
  registro?: string;
  num_seq_registro_lote: string;
  cod_seg_registro_lote: string;
  forma_de_iniciacao?: string;
  favorecido_tipo_insc: string;
  favorecido_num_insc: string;
  favorecido_logradouro?: string;
  favorecido_num?: string;
  favorecido_compl?: string;
  favorecido_bairro?: string;
  favorecido_cidade?: string;
  favorecido_cep?: string;
  favorecido_cep_compl?: string;
  favorecido_estado?: string;
  data_vencimento: string;
  valor_documento: string;
  valor_abatimento?: string;
  valor_desconto?: string;
  valor_mora?: string;
  valor_multa?: string;
  cod_doc_favorecido?: string;
  aviso_ao_favorecido?: string;
  uso_exclusivo_para_o_siape?: string;
  codigo_ispb?: string;
};

export const fieldsSegmentoB: FieldConfig[] = [
  {
    id: "G001",
    field: "banco",
    startPos: 1,
    endPos: 3,
    length: 3,
    required: false,
    default: "237",
    type: "numeric",
  },
  {
    id: "G002",
    field: "lote",
    startPos: 4,
    endPos: 7,
    length: 4,
    required: true,
    type: "numeric",
  },
  {
    id: "G003",
    field: "registro",
    startPos: 8,
    endPos: 8,
    length: 1,
    required: false,
    default: "3",
    type: "numeric",
  },
  {
    id: "G038",
    field: "num_seq_registro_lote",
    startPos: 9,
    endPos: 13,
    length: 5,
    required: false,
    type: "numeric",
  },
  {
    id: "G039",
    field: "cod_seg_registro_lote",
    startPos: 14,
    endPos: 14,
    length: 1,
    required: false,
    default: "B",
    type: "alphanumeric",
  },
  {
    id: "G100",
    field: "forma_de_iniciacao",
    startPos: 15,
    endPos: 17,
    length: 3,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G005",
    field: "favorecido_tipo_insc",
    startPos: 18,
    endPos: 18,
    length: 1,
    required: false,
    type: "numeric",
  },
  {
    id: "G006",
    field: "favorecido_num_insc",
    startPos: 19,
    endPos: 32,
    length: 14,
    required: false,
    type: "numeric",
  },
  {
    id: "G101",
    field: "favorecido_logradouro",
    startPos: 33,
    endPos: 67,
    length: 30,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G101",
    field: "favorecido_num",
    startPos: 63,
    endPos: 67,
    length: 5,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G101",
    field: "favorecido_compl",
    startPos: 68,
    endPos: 82,
    length: 15,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G101",
    field: "favorecido_bairro",
    startPos: 83,
    endPos: 97,
    length: 15,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G101",
    field: "favorecido_cidade",
    startPos: 98,
    endPos: 117,
    length: 20,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G101",
    field: "favorecido_cep",
    startPos: 118,
    endPos: 122,
    length: 5,
    required: false,
    type: "numeric",
  },
  {
    id: "G101",
    field: "favorecido_cep_compl",
    startPos: 123,
    endPos: 125,
    length: 3,
    required: false,
    type: "numeric",
  },
  {
    id: "G101",
    field: "favorecido_estado",
    startPos: 126,
    endPos: 127,
    length: 2,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G101",
    field: "data_vencimento",
    startPos: 128,
    endPos: 135,
    length: 8,
    required: true,
    type: "numeric",
  },
  {
    id: "G101",
    field: "valor_documento",
    startPos: 136,
    endPos: 150,
    length: 15,
    required: true,
    type: "numeric",
  },
  {
    id: "G101",
    field: "valor_abatimento",
    startPos: 151,
    endPos: 165,
    length: 15,
    required: false,
    type: "numeric",
  },
  {
    id: "G101",
    field: "valor_desconto",
    startPos: 166,
    endPos: 180,
    length: 15,
    required: false,
    type: "numeric",
  },
  {
    id: "G101",
    field: "valor_mora",
    startPos: 181,
    endPos: 195,
    length: 15,
    required: false,
    type: "numeric",
  },
  {
    id: "G101",
    field: "valor_multa",
    startPos: 196,
    endPos: 210,
    length: 15,
    required: false,
    type: "numeric",
  },
  {
    id: "G101",
    field: "cod_doc_favorecido",
    startPos: 211,
    endPos: 225,
    length: 15,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G101",
    field: "aviso_ao_favorecido",
    startPos: 226,
    endPos: 226,
    length: 1,
    required: false,
    type: "numeric",
  },
  {
    id: "P012",
    field: "uso_exclusivo_para_o_siape",
    startPos: 227,
    endPos: 232,
    length: 7,
    required: false,
    default: new Array(7).fill(" ").join(""),
  },
  {
    id: "P015",
    field: "codigo_ispb",
    startPos: 233,
    endPos: 240,
    length: 8,
    required: false,
    default: new Array(8).fill(" ").join(""),
  },
];
