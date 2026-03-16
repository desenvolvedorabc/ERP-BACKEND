import { CodigoMovimento } from "../../../enums";
import { FieldConfig } from "../../../types";

export type SegmentoJ52 = {
  banco?: string;
  lote?: string;
  registro?: string;

  num_seq_registro_lote?: string;
  cod_seg_registro_lote?: string;
  cod_seg_registro_lote_default?: string;
  ferbabran?: string;
  movimento_cod: CodigoMovimento;
  identificacao_registro?: string;

  tipo_inscricao_sacado: string;
  numero_inscricao_sacado: string;
  nome_sacado?: string;

  tipo_inscricao_cedente: string;
  numero_inscricao_cedente: string;
  nome_cedente?: string;

  tipo_inscricao_sacador: string;
  numero_inscricao_sacador: string;
  nome_sacador?: string;

  cnab?: string;
};

export const fieldsSegmentoJ52: FieldConfig[] = [
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
    field: "cod_seg_registro_lote_default",
    startPos: 14,
    endPos: 14,
    length: 1,
    required: false,
    default: "J",
    type: "alphanumeric",
  },
  {
    id: "G004",
    field: "ferbabran",
    startPos: 15,
    endPos: 15,
    length: 1,
    required: false,
    type: "alphanumeric",
    default: new Array(1).fill(" ").join(""),
  },
  {
    id: "C004",
    field: "movimento_cod",
    includes: Object.values(CodigoMovimento),
    startPos: 16,
    endPos: 17,
    length: 2,
    required: true,
    type: "numeric",
  },
  {
    id: "G067",
    field: "identificacao_registro",
    startPos: 18,
    endPos: 19,
    length: 2,
    required: false,
    type: "numeric",
    default: "52",
  },
  {
    id: "G005",
    field: "tipo_inscricao_sacado",
    startPos: 20,
    endPos: 20,
    length: 1,
    required: true,
    type: "numeric",
  },
  {
    id: "G006",
    field: "numero_inscricao_sacado",
    startPos: 21,
    endPos: 35,
    length: 15,
    required: true,
    type: "numeric",
  },
  {
    id: "G013",
    field: "nome_sacado",
    startPos: 36,
    endPos: 75,
    length: 40,
    required: false,
    type: "alphanumeric",
    default: new Array(40).fill(" ").join(""),
  },
  {
    id: "G005",
    field: "tipo_inscricao_cedente",
    startPos: 76,
    endPos: 76,
    length: 1,
    required: true,
    type: "numeric",
  },
  {
    id: "G006",
    field: "numero_inscricao_cedente",
    startPos: 77,
    endPos: 91,
    length: 15,
    required: true,
    type: "numeric",
  },
  {
    id: "G013",
    field: "nome_cedente",
    startPos: 92,
    endPos: 131,
    length: 40,
    required: false,
    type: "alphanumeric",
    default: new Array(40).fill(" ").join(""),
  },
  {
    id: "G005",
    field: "tipo_inscricao_sacador",
    startPos: 132,
    endPos: 132,
    length: 1,
    required: true,
    type: "numeric",
  },
  {
    id: "G006",
    field: "numero_inscricao_sacador",
    startPos: 133,
    endPos: 147,
    length: 15,
    required: true,
    type: "numeric",
  },
  {
    id: "G013",
    field: "nome_sacador",
    startPos: 148,
    endPos: 187,
    length: 40,
    required: false,
    type: "alphanumeric",
    default: new Array(40).fill(" ").join(""),
  },
  {
    id: "G004",
    field: "cnab",
    startPos: 188,
    endPos: 240,
    length: 53,
    required: false,
    type: "alphanumeric",
    default: new Array(53).fill(" ").join(""),
  },
];
