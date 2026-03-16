import { IdentificacaoFavorecidoChavePix } from "../../../enums";
import { FieldConfig } from "../../../types";

export type SegmentoBPix = {
  banco?: string;
  lote: string;
  registro?: string;
  num_seq_registro_lote: string;
  cod_seg_registro_lote: string;
  forma_de_iniciacao: IdentificacaoFavorecidoChavePix;
  favorecido_tipo_insc: string;
  /**
   * TX ID (opcional QR-CODE Estático) Posição (33 67) Alfa.
   */
  tx_id?: string;
  /**
   * Identificação do pagamento – Informação entre usuários (opcional) Posição (63 a 127) Alfa
   */
  info_pagamento?: string;
  chave_pix?: string;
  uso_exclusivo_para_o_siape?: string;
  codigo_ispb?: string;
};

export const fieldsSegmentoBPix: FieldConfig[] = [
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
    includes: Object.values(IdentificacaoFavorecidoChavePix),
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
    field: "tx_id",
    startPos: 33,
    endPos: 67,
    length: 35,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G101",
    field: "info_pagamento",
    startPos: 68,
    endPos: 127,
    length: 60,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G101",
    field: "chave_pix",
    startPos: 128,
    endPos: 226,
    length: 99,
    required: false,
    type: "alphanumeric",
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
