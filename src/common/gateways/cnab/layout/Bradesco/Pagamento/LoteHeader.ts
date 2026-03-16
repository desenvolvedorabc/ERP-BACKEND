import { FormaLancamento, TipoServico } from "../../../enums";
import { FieldConfig } from "../../../types";

export type LoteHeader = {
  banco?: string;
  lote?: string;
  registro?: string;
  operacao?: string;
  servico: TipoServico;
  forma_lancamento: FormaLancamento;
  versao_layout?: string;
  empresa_tipo_insc: string;
  empresa_num_insc: string;
  convenio: string;
  conta_agencia: string;
  agencia_dig_verificador?: string;
  conta_num: string;
  conta_dig_verificador?: string;
  empresa_nome: string;
  info2_pix?: string;
  endereco_logradouro?: string;
  endereco_num?: string;
  endereco_compl?: string;
  endereco_cidade?: string;
  endereco_cep?: string;
  endereco_cep_compl?: string;
  sigla_estado?: string;
  /**
   * Esse campo não existe para PAGAMENTO DE TÍTULOS DE COBRANÇA(boleto)
   */
  forma_pgto_servico?: string;
  filler?: string;
  codigos_ocorrencias?: string;
};

export const fieldsLoteHeader: FieldConfig<keyof LoteHeader>[] = [
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
    default: "0001",
  },
  {
    id: "G003",
    field: "registro",
    startPos: 8,
    endPos: 8,
    length: 1,
    required: true,
    default: "1",
  },
  {
    id: "G028",
    field: "operacao",
    startPos: 9,
    endPos: 9,
    length: 1,
    required: true,
    default: "C",
    type: "alphanumeric",
  },
  {
    id: "G025",
    field: "servico",
    includes: Object.values(TipoServico),
    startPos: 10,
    endPos: 11,
    length: 2,
    required: true,
    type: "numeric",
  },
  {
    id: "G029",
    field: "forma_lancamento",
    startPos: 12,
    endPos: 13,
    length: 2,
    required: true,
    type: "numeric",
    includes: Object.values(FormaLancamento),
  },
  {
    id: "G030",
    field: "versao_layout",
    startPos: 14,
    endPos: 16,
    length: 3,
    required: false,
    default: "045",
  },
  {
    id: "G004",
    field: "filler",
    startPos: 17,
    endPos: 17,
    length: 1,
    required: false,
    default: " ",
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
    id: "G031",
    field: "info2_pix",
    startPos: 103,
    endPos: 142,
    length: 40,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G032",
    field: "endereco_logradouro",
    startPos: 143,
    endPos: 172,
    length: 30,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G032",
    field: "endereco_num",
    startPos: 173,
    endPos: 177,
    length: 5,
    required: false,
    type: "numeric",
  },
  {
    id: "G032",
    field: "endereco_compl",
    startPos: 178,
    endPos: 192,
    length: 15,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G033",
    field: "endereco_cidade",
    startPos: 193,
    endPos: 212,
    length: 20,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "G034",
    field: "endereco_cep",
    startPos: 213,
    endPos: 217,
    length: 5,
    required: false,
    type: "numeric",
  },
  {
    id: "G035",
    field: "endereco_cep_compl",
    startPos: 218,
    endPos: 220,
    length: 3,
    required: false,
    type: "numeric",
  },
  {
    id: "G036",
    field: "sigla_estado",
    startPos: 221,
    endPos: 222,
    length: 2,
    required: false,
    type: "alphanumeric",
  },
  {
    id: "P014",
    field: "forma_pgto_servico",
    startPos: 223,
    endPos: 224,
    length: 2,
    required: false,
    type: "alphanumeric",
    default: "01", // débito em conta corrente
  },
  {
    id: "G004",
    field: "filler",
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
