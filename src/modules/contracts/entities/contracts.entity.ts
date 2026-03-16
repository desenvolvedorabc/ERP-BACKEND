import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { BudgetPlan } from "src/modules/budget-plans/entities/budget-plan.entity";
import { Collaborator } from "src/modules/collaborators/entities/collaborator.entity";
import { Files } from "src/modules/files/entities/files.entity";
import { Financier } from "src/modules/financiers/entities/financier.entity";
import { History } from "src/modules/history/entities/history.entity";
import { Payables } from "src/modules/payables/entities/payable.entity";
import { Program } from "src/modules/programs/entities/program.entity";
import { Receivables } from "src/modules/receivables/entities/receivables.entity";
import { Supplier } from "src/modules/suppliers/entities/supplier.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  TreeChildren,
  TreeParent,
} from "typeorm";
import { ContractModel, ContractStatus, ContractType } from "../enums";
import { BancaryInfo } from "../../../common/DTOs/bancaryInfo.entity";
import { ContractPeriod } from "./embeddedClasses/contractPeriod.entity";
import { PixInfo } from "../../../common/DTOs/pixInfo.entity";

@Entity({ name: "contracts" })
export class Contracts extends AbstractEntity<Contracts> {
  @Column({ type: "varchar", length: 30 })
  contractCode: string;

  @Column({ type: "varchar", length: 30 })
  contractType: ContractType;

  @Column({ type: "varchar", length: 30 })
  contractModel: ContractModel;

  @Column({
    type: "varchar",
    length: 30,
    nullable: false,
    default: ContractStatus.PENDING,
  })
  contractStatus: ContractStatus;

  @Column({ type: "varchar", length: 100 })
  object: string;

  @Column({ type: "float" })
  totalValue: number;

  @Column({ type: "boolean", default: false })
  agreement: boolean;

  @Column({ type: "int", nullable: true })
  budgetPlanId?: number;

  @Column({ type: "int", nullable: true })
  programId?: number;

  @Column(() => ContractPeriod)
  contractPeriod: ContractPeriod;

  @Column(() => PixInfo)
  pixInfo: PixInfo;

  @Column(() => BancaryInfo)
  bancaryInfo?: BancaryInfo;

  @Column({ type: "int", nullable: true, default: null })
  supplierId: number;

  @Column({ type: "int", nullable: true, default: null })
  financierId: number;

  @Column({ type: "int", nullable: true, default: null })
  collaboratorId: number;

  @Column({ type: "varchar", nullable: true, default: null })
  signedContractUrl: string;

  @Column({ type: "varchar", nullable: true, default: null })
  settleTermUrl: string;

  @Column({ type: "varchar", nullable: true, default: null })
  withdrawalUrl: string;

  @Column({ type: "int", nullable: true })
  @Index({
    unique: false,
  })
  parentId: number;

  @TreeParent({
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "parentId" })
  parent: Contracts;

  @TreeChildren({
    cascade: true,
  })
  children: Contracts[];

  @ManyToOne(() => BudgetPlan, (plan) => plan.contracts)
  @JoinColumn({ name: "budgetPlanId" })
  budgetPlan: BudgetPlan;

  @OneToMany(() => Files, (file) => file.contracts, {
    cascade: true,
  })
  files: Files[];

  @ManyToOne(() => Supplier, (supplier) => supplier.contracts)
  @JoinColumn({ name: "supplierId" })
  supplier: Supplier;

  @ManyToOne(() => Financier, (financier) => financier.contracts)
  @JoinColumn({ name: "financierId" })
  financier: Financier;

  @ManyToOne(() => Collaborator, (collaborator) => collaborator.contracts)
  @JoinColumn({ name: "collaboratorId" })
  collaborator: Collaborator;

  @ManyToOne(() => Program, (program) => program.contracts)
  @JoinColumn({ name: "programId" })
  program: Program;

  @OneToMany(() => History, (history) => history.contract)
  historys: History[];

  @OneToMany(() => Payables, (payable) => payable.contract)
  payable: Payables[];

  @OneToMany(() => Receivables, (receivable) => receivable.contract)
  receivable: Receivables[];
}
