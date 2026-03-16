import { FieldConfig } from "../types";
import { fieldHeader } from "./Bradesco/ArquivoHeader";
import { fieldsTrailing } from "./Bradesco/ArquivoTrailing";
import {
  fieldsLoteHeader,
  fieldsLoteTrailing,
  fieldsSegmentoA,
  fieldsSegmentoB,
  fieldsSegmentoBPix,
  fieldsSegmentoJ,
  fieldsSegmentoJ52,
} from "./Bradesco/Pagamento";

import {
  fieldsLoteTrailingConciliacao,
  fieldsLoteHeaderConciliacao,
  fieldsConciliacao,
} from "./Bradesco/Conciliacao";

type PagamentoPix = {
  type: "pix";
  SegmentoA: FieldConfig[];
  SegmentoBPix: FieldConfig[];
  SegmentoJ: FieldConfig[];
};

type Pagamento = {
  type: "pagamento";
  SegmentoA: FieldConfig[];
  SegmentoB: FieldConfig[];
  SegmentoJ: FieldConfig[];
  SegmentoJ52: FieldConfig[];
};

type CommonRemessaRule = {
  ArquivoHeader: FieldConfig[];
  ArquivoTrailing: FieldConfig[];
  LoteHeader: FieldConfig[];
  LoteTrailing: FieldConfig[];
};

export type RemessaRule = CommonRemessaRule & (Pagamento | PagamentoPix);

export const RemessaPagamento: RemessaRule = {
  type: "pagamento",
  ArquivoHeader: fieldHeader,
  LoteHeader: fieldsLoteHeader,
  SegmentoA: fieldsSegmentoA,
  SegmentoB: fieldsSegmentoB,
  SegmentoJ: fieldsSegmentoJ,
  SegmentoJ52: fieldsSegmentoJ52,
  LoteTrailing: fieldsLoteTrailing,
  ArquivoTrailing: fieldsTrailing,
};

export const RemessaPagamentoPix: RemessaRule = {
  type: "pix",
  ArquivoHeader: fieldHeader,
  LoteHeader: fieldsLoteHeader,
  SegmentoA: fieldsSegmentoA,
  SegmentoBPix: fieldsSegmentoBPix,
  SegmentoJ: fieldsSegmentoJ,
  LoteTrailing: fieldsLoteTrailing,
  ArquivoTrailing: fieldsTrailing,
};

type RetornoRule = {
  ArquivoHeader: FieldConfig[];
  ArquivoTrailing: FieldConfig[];
  Detail: FieldConfig[];
  LoteHeader: FieldConfig[];
  LoteTrailing: FieldConfig[];
};

export const RetornoRule: RetornoRule = {
  ArquivoHeader: fieldHeader,
  ArquivoTrailing: fieldsTrailing,
  Detail: fieldsConciliacao,
  LoteHeader: fieldsLoteHeaderConciliacao,
  LoteTrailing: fieldsLoteTrailingConciliacao,
};
