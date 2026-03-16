import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Accounts } from "src/modules/accounts/entities/accounts.entity";
import { Installments } from "src/modules/installments/entities/installments.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { BankRecordApi } from "./bank-record-api.entity";
import { BankReconciliationType } from "../enums";

@Entity({
  name: "bank-reconciliation",
})
export class BankReconciliation extends AbstractEntity<BankReconciliation> {
  @Column({ type: "int" })
  accountId: number;

  @ManyToOne(() => Accounts, (account) => account.bankReconciliations)
  @JoinColumn({ name: "accountId" })
  account: Accounts;

  @Column({ type: "enum", enum: BankReconciliationType, nullable: false })
  type: BankReconciliationType;

  @Column({ type: "int", nullable: true, default: null })
  recordSystemId: number;

  @OneToOne(() => Installments, (i) => i.bankReconciliation, { nullable: true })
  @JoinColumn({ name: "recordSystemId" })
  recordSystem?: Installments;

  @Column({ type: "int", nullable: true, default: null })
  transferedById: number;

  @OneToOne(() => Accounts, { nullable: true })
  @JoinColumn({ name: "transferedById" })
  transferBy?: Accounts;

  @Column({ type: "int", nullable: true, default: null })
  recordApiId: number;

  @OneToOne(() => BankRecordApi, (api) => api.bankReconciliation, {
    nullable: true,
  })
  @JoinColumn({ name: "recordApiId" })
  recordApi: BankRecordApi;
}
