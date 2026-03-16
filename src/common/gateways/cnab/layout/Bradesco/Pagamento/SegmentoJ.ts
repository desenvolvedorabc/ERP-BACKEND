import {
  IdentificacaoFavorecidoChavePix,
  CodigoMovimento,
  TipoMovimento,
} from "../../../enums";
import { FieldConfig } from "../../../types";

export type SegmentoJ = {
  banco?: string;
  lote: string;
  registro?: string;
  num_seq_registro_lote: string;
  cod_seg_registro_lote: string;
  /**
   * Código adotado pela FEBRABAN, para identificar o tipo de movimentação enviada no arquivo.
   */
  movimento_tipo: TipoMovimento;
  movimento_cod: CodigoMovimento;
  codigo_barras: string;
  nome_beneficiario: string;
  data_vencimento: string;
  valor_titulo: string;
  desconto?: string;
  acrescimos?: string;
  data_pagamento?: string;
  valor_pagamento: string;
  quantidade_moeda?: string;
  referencia_pagador?: string;
  nosso_numero?: string;
  codigo_moeda?: string;
  cnab?: string;
  codigos_ocorrencias?: string;
};

export const fieldsSegmentoJ: FieldConfig[] = [
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
    default: "J",
    type: "alphanumeric",
  },
  {
    id: "G060",
    field: "movimento_tipo",
    includes: Object.values(TipoMovimento),
    startPos: 15,
    endPos: 15,
    length: 1,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G061",
    field: "movimento_cod",
    includes: Object.values(CodigoMovimento),
    startPos: 16,
    endPos: 17,
    length: 2,
    required: true,
    type: "numeric",
  },
  {
    id: "G063",
    field: "codigo_barras",
    startPos: 18,
    endPos: 61,
    length: 44,
    required: false,
    type: "numeric",
    default: new Array(44).fill(" ").join("")
  },
  {
    id: "G013",
    field: "nome_beneficiario",
    startPos: 62,
    endPos: 91,
    length: 30,
    required: true,
    type: "alphanumeric",
  },
  {
    id: "G044",
    field: "data_vencimento",
    startPos: 92,
    endPos: 99,
    length: 8,
    required: true,
    type: "date",
  },
  {
    id: "G042",
    field: "valor_titulo",
    startPos: 100,
    endPos: 114,
    length: 15,
    required: true,
    type: "numeric",
  },
  {
    id: "L002",
    field: "desconto",
    startPos: 115,
    endPos: 129,
    length: 15,
    required: false,
    type: "numeric",
  },
  {
    id: "L003",
    field: "acrescimos",
    startPos: 130,
    endPos: 144,
    length: 15,
    required: false,
    type: "numeric",
  },
  {
    id: "P009",
    field: "data_pagamento",
    startPos: 145,
    endPos: 152,
    length: 8,
    required: false,
    type: "numeric",
  },
  {
    id: "P010",
    field: "valor_pagamento",
    startPos: 153,
    endPos: 167,
    length: 15,
    required: true,
    type: "numeric",
  },
  {
    id: "G041",
    field: "quantidade_moeda",
    startPos: 168,
    endPos: 182,
    length: 15,
    required: false,
    type: "numeric",
  },
  {
    id: "G064",
    field: "referencia_pagador",
    startPos: 183,
    endPos: 202,
    length: 20,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G043",
    field: "nosso_numero",
    startPos: 203,
    endPos: 222,
    length: 20,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G065",
    field: "codigo_moeda",
    startPos: 223,
    endPos: 224,
    length: 2,
    required: false,
    default: "09",
    type: "numeric",
  },
  {
    id: "G004",
    field: "cnab",
    startPos: 225,
    endPos: 230,
    length: 6,
    required: false,
    default: new Array(6).fill(" ").join(""),
  },
  {
    id: "G059",
    field: "codigos_ocorrencias",
    startPos: 231,
    endPos: 240,
    length: 10,
    required: false,
    default: new Array(10).fill(" ").join(""),
  },
];
