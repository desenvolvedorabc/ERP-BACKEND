import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Column, Entity, OneToOne } from "typeorm";
import { BankReconciliation } from "./bank-reconciliation.entity";
import { Categorization } from "src/modules/categorization/entities/categorization.entity";

@Entity({
  name: "bank-record-api",
})
export class BankRecordApi extends AbstractEntity<BankRecordApi> {
  @Column({ type: "varchar", nullable: false })
  documentNumber: string;

  @Column({ type: "float", nullable: false })
  transactionAmount: number;

  @Column({ type: "timestamp", nullable: false })
  transactionDate: Date;

  @Column({ type: "varchar", nullable: false })
  fullTransactionDescription: string;

  @OneToOne(() => BankReconciliation, (rc) => rc.recordApi, {
    nullable: true,
  })
  bankReconciliation: BankReconciliation;

  @OneToOne(() => Categorization, (c) => c.bankRecordApi)
  categorization: Categorization;
}
