import {
  CodCamaraCentralizadora,
  ComplementoTipoServico,
  CodigoMovimento,
  TipoMovimento,
} from "../../../enums";
import { FieldConfig } from "../../../types";

export type SegmentoA = {
  banco?: string;
  lote: string;
  registro?: string;
  /**
   * Número adotado e controlado pelo responsável pela geração magnética dos dados contidos no arquivo, para
   * Identificar a sequência de registros encaminhados no lote. Deve ser inicializado sempre em '1', em cada novo lote.
   */
  num_seq_registro_lote: string;
  cod_seg_registro_lote?: string;
  /**
   * Código adotado pela FEBRABAN, para identificar o tipo de movimentação enviada no arquivo.
   */
  movimento_tipo: TipoMovimento;
  movimento_cod: CodigoMovimento;
  cod_camara: CodCamaraCentralizadora;
  favorecido_cod_banco?: string;
  favorecido_agencia?: string;
  favorecido_dig_agencia?: string;
  favorecido_num_conta?: string;
  favorecido_dig_verificador?: string;
  ag_conta_digito_verificador?: string;
  favorecido_nome: string;
  /**
   * Número atribuído pela Empresa (Pagador) para identificar o documento de Pagamento (Nota Fiscal,Nota Promissória, etc.)
   */
  doc_empresa: string;
  data_pagamento: string;
  tipo_moeda?: string;
  qtde_moeda?: string;
  valor_pagamento: string;
  num_doc_atribuido_banco?: string;
  data_real_efetivacao_pgto?: string;
  valor_real_efetivacao_pgto?: string;
  info2_pix?: string;
  cod_finalidade_doc?: ComplementoTipoServico;
  cod_finalidade_ted?: string;
  cod_finalidade_compl?: string;
  cnab?: string;
  aviso?: string;
  codigos_ocorrencias?: string;
};

export const fieldsSegmentoA: FieldConfig[] = [
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
    type: "numeric",
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
    default: "A",
    type: "alphanumeric",
  },
  {
    id: "G060",
    field: "movimento_tipo",
    includes: Object.values(TipoMovimento),
    startPos: 15,
    endPos: 15,
    length: 1,
    required: true,
    type: "numeric",
    default: "0",
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
    default: "00",
  },
  {
    id: "P001",
    field: "cod_camara",
    includes: Object.values(CodCamaraCentralizadora),
    startPos: 18,
    endPos: 20,
    length: 3,
    required: true,
    type: "numeric",
  },
  {
    id: "P002",
    field: "favorecido_cod_banco",
    startPos: 21,
    endPos: 23,
    length: 3,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G008",
    field: "favorecido_agencia",
    startPos: 24,
    endPos: 28,
    length: 5,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G009",
    field: "favorecido_dig_agencia",
    startPos: 29,
    endPos: 29,
    length: 1,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G010",
    field: "favorecido_num_conta",
    startPos: 30,
    endPos: 41,
    length: 12,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G011",
    field: "favorecido_dig_verificador",
    startPos: 42,
    endPos: 42,
    length: 1,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G012",
    field: "ag_conta_digito_verificador",
    startPos: 43,
    endPos: 43,
    length: 1,
    required: false,
    default: " ",
  },
  {
    id: "G013",
    field: "favorecido_nome",
    startPos: 44,
    endPos: 73,
    length: 30,
    required: true,
    type: "alphanumeric",
  },
  {
    id: "G064",
    field: "doc_empresa",
    startPos: 74,
    endPos: 93,
    length: 20,
    required: true,
    type: "alphanumeric",
  },
  {
    id: "P009",
    field: "data_pagamento",
    startPos: 94,
    endPos: 101,
    length: 8,
    required: true,
    type: "numeric",
  },
  {
    id: "G040",
    field: "tipo_moeda",
    startPos: 102,
    endPos: 104,
    length: 3,
    required: false,
    default: "BRL",
  },
  {
    id: "G041",
    field: "qtde_moeda",
    startPos: 105,
    endPos: 119,
    length: 15,
    required: false,
    type: "numeric",
  },
  {
    id: "P010",
    field: "valor_pagamento",
    startPos: 120,
    endPos: 134,
    length: 15,
    required: true,
    type: "numeric",
  },
  {
    id: "G043",
    field: "num_doc_atribuido_banco",
    startPos: 135,
    endPos: 154,
    length: 20,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "P003",
    field: "data_real_efetivacao_pgto",
    startPos: 155,
    endPos: 162,
    length: 8,
    required: false,
    type: "numeric",
  },
  {
    id: "P004",
    field: "valor_real_efetivacao_pgto",
    startPos: 163,
    endPos: 177,
    length: 15,
    required: false,
    type: "numeric",
  },
  {
    id: "G031",
    field: "info2_pix",
    startPos: 178,
    endPos: 217,
    length: 40,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "P005",
    field: "cod_finalidade_doc",
    includes: Object.values(ComplementoTipoServico),
    startPos: 218,
    endPos: 219,
    length: 2,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "P011",
    field: "cod_finalidade_ted",
    startPos: 220,
    endPos: 224,
    length: 5,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "P013",
    field: "cod_finalidade_compl",
    startPos: 225,
    endPos: 226,
    length: 2,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G004",
    field: "cnab",
    startPos: 227,
    endPos: 229,
    length: 3,
    required: false,
    default: new Array(3).fill(" ").join(""),
  },
  {
    id: "P006",
    field: "aviso",
    startPos: 230,
    endPos: 230,
    length: 1,
    required: false,
    default: "0",
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
