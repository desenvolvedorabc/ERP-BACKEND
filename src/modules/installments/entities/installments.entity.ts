import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Receivables } from "src/modules/receivables/entities/receivables.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { Payables } from "../../payables/entities/payable.entity";
import { InstallmentStatus, InstallmentType } from "../enum";
import { BankReconciliation } from "src/modules/bank-reconciliation/entities/bank-reconciliation.entity";

@Entity({
  name: "installments",
})
export class Installments extends AbstractEntity<Installments> {
  @Column({ type: "int", nullable: true, default: null })
  payableId: number;

  @Column({ type: "int", nullable: true, default: null })
  receivableId: number;

  @ManyToOne(() => Payables, (payable) => payable.installments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "payableId" })
  payable: Payables;

  @ManyToOne(() => Receivables, (receivable) => receivable.installments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "receivableId" })
  receivable: Receivables;

  @ManyToOne(
    () => BankReconciliation,
    (bankReconciliation) => bankReconciliation.recordSystem,
    {
      onDelete: "CASCADE",
    },
  )
  bankReconciliation: BankReconciliation;

  @Column({ type: "int", nullable: true, default: null })
  relatedLiquidInstallmentId: number;

  @OneToOne(
    () => Installments,
    (installment) => installment.relatedLiquidInstallment,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "relatedLiquidInstallmentId" })
  relatedLiquidInstallment: Installments;

  @Column({ type: "int" })
  installmentNumber: number;

  @Column({ type: "int" })
  totalInstallments: number;

  @Column({ type: "varchar", nullable: false, default: InstallmentType.LIQUID })
  type: InstallmentType;

  @Column({
    type: "datetime",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
  })
  dueDate: Date;

  @Column({ type: "float" })
  value: number;

  @Column({ type: "varchar", default: InstallmentStatus.PENDING })
  status: InstallmentStatus;
}
