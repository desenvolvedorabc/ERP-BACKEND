import { BankReconciliationType } from "../enums";

export type TransactionRecord = {
  id?: number;
  documentNumber: string;
  date: Date;
  amount: number;
  title: string;
  description: string;
  beneficiary?: string;
};

export type BankReconciliationResponse = {
  accountInfo: {
    name: string;
    agency: string;
    account: string;
    balance: number;
    updatedAt: Date;
    balanceSystem: number;
  };
  transactions: Array<
    {
      reconciled: boolean;
      type: BankReconciliationType;
      extract: Omit<TransactionRecord, "id">;
      transferedById?: number;
    } & (Transfer | TransactionEntry | Profit | Tax)
  >;
  futureTransactions: Array<Omit<TransactionRecord, "id">>;
};

type Transfer = {
  type: BankReconciliationType.TRANSFER;
  recordSystem?: {
    id: number; // id do bank reconciliation
  };
};

type TransactionEntry = {
  type: BankReconciliationType.TRANSACTION_ENTRY;
  recordSystem?: TransactionRecord;
};

type Profit = {
  type: BankReconciliationType.PROFIT;
};

type Tax = {
  type: BankReconciliationType.TAX;
};
