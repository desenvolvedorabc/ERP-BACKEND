import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Collaborator } from "src/modules/collaborators/entities/collaborator.entity";
import { Contracts } from "src/modules/contracts/entities/contracts.entity";
import { Files } from "src/modules/files/entities/files.entity";
import { Installments } from "src/modules/installments/entities/installments.entity";
import { Supplier } from "src/modules/suppliers/entities/supplier.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";
import {
  DebtorType,
  DOCType,
  PayableStatus,
  PaymentMethod,
  PaymentType,
} from "../enums/index";
import { Approvals } from "./approval.entity";
import { recurenceData } from "./embeddedClasses/recurrenceData.entity";
import { Accounts } from "src/modules/accounts/entities/accounts.entity";
import { CardMovimentation } from "src/modules/creditCard/entities/cardMovimentation.entity";
import { Categorization } from "src/modules/categorization/entities/categorization.entity";

@Entity({ name: "payables" })
export class Payables extends AbstractEntity<Payables> {
  @Column({ type: "varchar", nullable: true })
  identifierCode: string;

  @Column({ type: "varchar", nullable: false, default: DebtorType.SUPPLIER })
  debtorType: DebtorType;

  @Column({ type: "int", nullable: true, default: null })
  supplierId: number;

  @ManyToOne(() => Supplier, (supplier) => supplier.payables)
  @JoinColumn({ name: "supplierId" })
  supplier: Supplier;

  @Column({ type: "int", nullable: true, default: null })
  collaboratorId: number;

  @ManyToOne(() => Collaborator, (collaborator) => collaborator.payables)
  @JoinColumn({ name: "collaboratorId" })
  collaborator: Collaborator;

  @Column({ type: "varchar", default: PayableStatus.APPROVING })
  payableStatus: PayableStatus;

  @Column({ type: "varchar", nullable: false })
  paymentType: PaymentType;

  @Column({ type: "varchar", nullable: true })
  obs: string;

  @Column({ type: "float", nullable: false })
  liquidValue: number;

  @Column({ type: "float", nullable: false })
  taxValue: number;

  @Column({ type: "float", nullable: false })
  totalValue: number;

  @Column({ type: "varchar", nullable: true, default: null })
  paymentMethod: PaymentMethod;

  @Column({ type: "varchar", nullable: true, default: null })
  barcode: string;

  @Column({ type: "varchar", nullable: true, default: null })
  docType: DOCType;

  @Column({ type: "int", nullable: true })
  accountId: number;

  @Column({ type: "int", nullable: true, default: null })
  contractId: number;

  @Column({ type: "int", nullable: true, default: null })
  lastAditiveId: number;

  @Column({ type: "boolean", default: false })
  recurrent: boolean;

  @Column(() => recurenceData)
  recurenceData: recurenceData;

  @Column({ type: "timestamp", nullable: true, default: null })
  dueDate: Date;

  @Column({ type: "timestamp", nullable: true, default: null })
  paymentDate: Date;

  @Column({ type: "date", nullable: true, name: "competence_date" })
  competenceDate: Date;

  @Column({ type: "int" })
  createdById: number;

  @Column({ type: "int", nullable: true, default: null })
  updatedById: number;

  @ManyToOne(() => Accounts, (account) => account.payables)
  @JoinColumn({ name: "accountId" })
  account: Accounts;

  @OneToMany(() => Files, (file) => file.payable, {
    cascade: true,
  })
  files: Files[];

  @OneToMany(() => Approvals, (approval) => approval.payable, {
    onDelete: "CASCADE",
  })
  approvals: Approvals[];

  @OneToMany(() => Installments, (installment) => installment.payable, {
    onDelete: "CASCADE",
  })
  installments: Installments[];

  @OneToMany(() => CardMovimentation, (mov) => mov.payable, {
    cascade: true,
  })
  cardMovimentations: CardMovimentation[];

  @ManyToOne(() => Contracts, (contract) => contract.payable)
  @JoinColumn({ name: "contractId" })
  contract: Contracts;

  @OneToOne(() => Categorization, (c) => c.payable)
  categorization: Categorization;
}
