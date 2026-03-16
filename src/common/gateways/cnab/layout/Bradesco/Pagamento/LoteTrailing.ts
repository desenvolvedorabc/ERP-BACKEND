import { FieldConfig } from "../../../types";

export type LoteTrailing = {
  banco?: string;
  lote?: string;
  registro?: string;
  filler?: string;
  /**
   * Somatória dos registros de tipo 1,2, 3, 4 e 5
   */
  qtde_registros?: string;
  somatoria_valores: string;
  somatoria_qtde_moedas?: string;
  num_aviso_debito?: string;
  codigos_ocorrencias?: string;
};

export const fieldsLoteTrailing: FieldConfig<keyof LoteTrailing>[] = [
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
    default: "5",
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
    id: "G057",
    field: "qtde_registros",
    startPos: 18,
    endPos: 23,
    length: 6,
    required: false,
    type: "numeric",
  },
  {
    id: "P007",
    field: "somatoria_valores",
    startPos: 24,
    endPos: 41,
    length: 18,
    required: true,
  },
  {
    id: "G058",
    field: "somatoria_qtde_moedas",
    startPos: 42,
    endPos: 59,
    length: 18,
    required: false,
    default: new Array(18).fill("0").join(""),
  },
  {
    id: "G066",
    field: "num_aviso_debito",
    startPos: 60,
    endPos: 65,
    length: 6,
    required: false,
  },
  {
    id: "G004",
    field: "filler",
    startPos: 66,
    endPos: 230,
    length: 165,
    required: false,
    default: new Array(165).fill(" ").join(""),
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
