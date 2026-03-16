import { IsNumber, IsObject } from "class-validator";
import { TransactionRecord } from "./bank-reconciliation-response.dto";

export class CreateReconciliationResponseDTO {
  @IsObject()
  system: TransactionRecord;

  @IsNumber()
  newBalance: number;

  constructor(system: TransactionRecord, newBalance: number) {
    this.system = system;
    this.newBalance = newBalance;
  }
}
