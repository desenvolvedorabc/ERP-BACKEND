import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Contracts } from "src/modules/contracts/entities/contracts.entity";
import { Files } from "src/modules/files/entities/files.entity";
import { Financier } from "src/modules/financiers/entities/financier.entity";
import { Installments } from "src/modules/installments/entities/installments.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";
import {
  DOCType,
  ReceiptMethod,
  ReceivableStatus,
  ReceivableType,
} from "../enums";
import { recurenceData } from "./embeddedClasses/recurrenceData.entity";
import { Accounts } from "src/modules/accounts/entities/accounts.entity";
import { Categorization } from "src/modules/categorization/entities/categorization.entity";

@Entity({ name: "receivables" })
export class Receivables extends AbstractEntity<Receivables> {
  @Column({ type: "varchar", nullable: true, unique: true })
  identifierCode: string;

  @Column({ type: "int" })
  financierId: number;

  @ManyToOne(() => Financier, (financier) => financier.receivables)
  @JoinColumn({ name: "financierId" })
  financier: Financier;

  @Column({ type: "varchar", default: ReceivableStatus.APPROVED })
  receivableStatus: ReceivableStatus;

  @Column({ type: "varchar", nullable: false })
  receivableType: ReceivableType;

  @Column({ type: "float", nullable: false })
  totalValue: number;

  @Column({ type: "varchar", nullable: true, default: null })
  receiptMethod: ReceiptMethod;

  @Column({ type: "varchar", nullable: true, default: null })
  docType: DOCType;

  @Column({ type: "int", nullable: true })
  accountId: number;

  @Column({ type: "int", nullable: true, default: null })
  contractId: number;

  @Column({ type: "int", nullable: true, default: null })
  lastAditiveId: number;

  @Column({ type: "varchar", nullable: true })
  description: string;

  @Column({ type: "boolean", default: false })
  recurrent: boolean;

  @Column(() => recurenceData)
  recurenceData: recurenceData;

  @Column({ type: "timestamp", nullable: true, default: null })
  dueDate: Date;

  @ManyToOne(() => Accounts, (account) => account.receivables)
  @JoinColumn({ name: "accountId" })
  account: Accounts;

  @OneToMany(() => Files, (file) => file.receivable, {
    cascade: true,
  })
  files: Files[];

  @OneToMany(() => Installments, (installment) => installment.receivable)
  installments: Installments[];

  @ManyToOne(() => Contracts, (contract) => contract.receivable)
  @JoinColumn({ name: "contractId" })
  contract: Contracts;

  @OneToOne(() => Categorization, (c) => c.receivable)
  categorization: Categorization;
}
