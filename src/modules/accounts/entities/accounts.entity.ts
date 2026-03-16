import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { BankReconciliation } from "src/modules/bank-reconciliation/entities/bank-reconciliation.entity";
import { CreditCard } from "src/modules/creditCard/entities/creditCard.entity";
import { Payables } from "src/modules/payables/entities/payable.entity";
import { Receivables } from "src/modules/receivables/entities/receivables.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity({
  name: "accounts",
})
export class Accounts extends AbstractEntity<Accounts> {
  @Column({ type: "varchar", length: 200 })
  name: string;

  @Column({ type: "int", nullable: true, default: null })
  apiAccountId: number;

  @Column({ type: "double", default: 0 })
  initialBalance: number;

  /**
   * Preenchido via integração com o arquivo de retorno
   */
  @Column({ type: "double", default: 0 })
  balance: number;

  @Column({ type: "double", default: 0 })
  systemBalance: number;

  @Column({ type: "varchar", length: 150, nullable: true, default: null })
  integracao: string;

  @Column({ type: "varchar", length: 150 })
  bank: string;

  @Column({ type: "varchar", length: 25 })
  agency: string;

  @Column({ type: "varchar", length: 25 })
  accountNumber: string;

  @Column({ type: "varchar", length: 3 })
  dv: string;

  @Column({ type: "datetime", nullable: true, default: null })
  lastReconciliation: Date;

  @OneToMany(() => Payables, (payable) => payable.account)
  payables: Payables[];

  @OneToMany(() => Receivables, (receivable) => receivable.account)
  receivables: Receivables[];

  @OneToMany(
    () => BankReconciliation,
    (bankReconciliation) => bankReconciliation.account,
  )
  bankReconciliations: BankReconciliation[];

  @OneToMany(() => CreditCard, (c) => c.account)
  creditCards: CreditCard[];
}
