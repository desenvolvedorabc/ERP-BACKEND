import { SelectQueryBuilder } from "typeorm";
import { GeneralReportParamsDTO } from "../dtos/generalReportParams.dto";
import { Contracts } from "src/modules/contracts/entities/contracts.entity";
import { Payables } from "src/modules/payables/entities/payable.entity";
import { Receivables } from "src/modules/receivables/entities/receivables.entity";
import { CardMovimentation } from "src/modules/creditCard/entities/cardMovimentation.entity";
import { BankReconciliation } from "src/modules/bank-reconciliation/entities/bank-reconciliation.entity";

type ColumnConfigValues = {
  contract?: string;
  payable?: string;
  receivable?: string;
  appointment?: string;
  CardMovimentation?: string;
  pcontract?: string;
  rcontract?: string;
  DEFAULT?: string;
};

export type DEFAULTCOLUMNS = {
  ID: ColumnConfigValues;
  E_ID: ColumnConfigValues;
  NUMERO_CONTRATO: ColumnConfigValues;
  TIPO: ColumnConfigValues;
  CODE: ColumnConfigValues;
  VENCIMENTO: ColumnConfigValues;
  PARCELA: ColumnConfigValues;
  APONTAMENTO: ColumnConfigValues;
  FORNECEDOR: ColumnConfigValues;
  FINANCIADOR: ColumnConfigValues;
  COLABORADOR: ColumnConfigValues;
  CENTRO_CUSTO: ColumnConfigValues;
  CATEGORIA: ColumnConfigValues;
  SUB_CATEGORIA: ColumnConfigValues;
  PIX: ColumnConfigValues;
  BANCARY: ColumnConfigValues;
  DATA: ColumnConfigValues;
};

export type ENTITY =
  | "payable"
  | "receivable"
  | "CardMovimentation"
  | "contract"
  | "appointment";

export type OmmitedGeneralReportParams = Omit<
  GeneralReportParamsDTO,
  "page" | "limit" | "dueBetween"
>;

export type AwaitedQueries = {
  contracts: SelectQueryBuilder<Contracts>;
  payables: SelectQueryBuilder<Payables>;
  receivables: SelectQueryBuilder<Receivables>;
  cardMov: SelectQueryBuilder<CardMovimentation>;
  appointments: SelectQueryBuilder<BankReconciliation>;
};

export type GeneralReportReturn = {
  numero_contrato: string | null;
  tipo: string | null;
  code: string | null;
  vencimento: string | null;
  parcela: string | null;
  apontamento: string | null;
  fornecedor: string | null;
  financiador: string | null;
  colaborador: string | null;
  centro_custo: string | null;
  categoria: string | null;
  sub_categoria: string | null;
  bancary: string | null;
  pix: string | null;
  ID: string;
  E_ID: string;
  data: string;
};
