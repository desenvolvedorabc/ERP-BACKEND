import { BankRecordApi } from "../entities/bank-record-api.entity";
import { BankReconciliationType } from "../enums";

export type FindByAccountIdQueryResult = {
  name: string;
  agency: string;
  accountNumber: string;
  systemBalance: number;
  updatedAt: Date;
  id: number;
  type: string;
  transferedById: number;
  documentNumber: string;
  aditionalDescription: string;
  identification: string;
  dueDate: Date;
  value: number;
};

export interface FindByAccountIdResult {
  name: string;
  balance: number;
  systemBalance: number;
  agency: string;
  account: string;
  updatedAt: Date;
  bankReconciliations: BankReconciliation[];
}
interface BankReconciliation {
  id: number;
  type: BankReconciliationType;
  transferedById?: number;
  recordApi: BankRecordApi;
  recordSystem?: RecordSystem;
}
interface RecordSystem {
  id: number;
  aditionalDescription: string;
  identification: string;
  dueDate: Date;
  value: number;
}
