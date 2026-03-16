import { LoteHeader } from "./layout/Bradesco/Pagamento/LoteHeader";
import { LoteTrailing } from "./layout/Bradesco/Pagamento/LoteTrailing";
import { SegmentoA } from "./layout/Bradesco/Pagamento/SegmentoA";
import { SegmentoB } from "./layout/Bradesco/Pagamento/SegmentoB";
import { SegmentoBPix } from "./layout/Bradesco/Pagamento/SegmentoBPix";
import { SegmentoJ } from "./layout/Bradesco/Pagamento/SegmentoJ";
import { SegmentoJ52 } from "./layout/Bradesco/Pagamento/SegmentoJ52";

export type FieldConfig<K = string> = {
  id: string;
  field: K;
  length: number;
  required?: boolean;
  default?: string;
  type?: "alphanumeric" | "numeric" | "date" | "hour";
  includes?: string[];
  startPos?: number;
  endPos?: number;
  value?: string;
};

export type FavorecidoBankKeys =
  | "favorecido_nome"
  | "favorecido_cod_banco"
  | "favorecido_agencia"
  | "favorecido_dig_agencia"
  | "favorecido_num_conta"
  | "favorecido_dig_verificador";

export type LotePayment = {
  LoteHeader: LoteHeader;
  Details: (SegmentoA | SegmentoB | SegmentoBPix | SegmentoJ | SegmentoJ52)[];
  LoteTrailing: LoteTrailing;
};
