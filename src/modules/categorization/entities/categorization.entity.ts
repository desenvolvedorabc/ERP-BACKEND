import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { Program } from "src/modules/programs/entities/program.entity";
import { BudgetPlan } from "src/modules/budget-plans/entities/budget-plan.entity";
import { CostCenter } from "src/modules/cost-centers/entities/cost-center.entity";
import { CostCenterCategory } from "src/modules/cost-centers/entities/cost-center-category.entity";
import { CostCenterSubCategory } from "src/modules/cost-centers/entities/cost-center-sub-category.entity";
import { Payables } from "src/modules/payables/entities/payable.entity";
import { Receivables } from "src/modules/receivables/entities/receivables.entity";
import { CardMovimentation } from "src/modules/creditCard/entities/cardMovimentation.entity";
import { BankRecordApi } from "src/modules/bank-reconciliation/entities/bank-record-api.entity";

@Entity({ name: "categorization" })
export class Categorization extends AbstractEntity<Categorization> {
  @Column({ type: "int" })
  programId: number;

  @Column({ type: "int" })
  budgetPlanId: number;

  @Column({ type: "int" })
  costCenterId: number;

  @Column({ type: "int" })
  categoryId: number;

  @Column({ type: "int" })
  subCategoryId: number;

  @Column({ type: "int", nullable: true })
  payableRelationalId: number;

  @Column({ type: "int", nullable: true })
  receivableRelationalId: number;

  @Column({ type: "int", nullable: true })
  cardMovRelationalId: number;

  @Column({ type: "int", nullable: true })
  bankRecordApiId: number;

  @OneToOne(() => Payables, (p) => p.categorization, {
    cascade: ["remove"],
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "payableRelationalId" })
  payable: Payables;

  @OneToOne(() => Receivables, (r) => r.categorization, {
    cascade: ["remove"],
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "receivableRelationalId" })
  receivable: Receivables;

  @OneToOne(() => CardMovimentation, (c) => c.categorization, {
    cascade: ["remove"],
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "cardMovRelationalId" })
  cardMov: CardMovimentation;

  @OneToOne(() => BankRecordApi, (b) => b.categorization, {
    cascade: ["remove"],
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "bankRecordApiId" })
  bankRecordApi: BankRecordApi;

  @ManyToOne(() => Program, (program) => program.categorization)
  @JoinColumn({ name: "programId" })
  program: Program;

  @ManyToOne(() => BudgetPlan, (plan) => plan.categorization)
  @JoinColumn({ name: "budgetPlanId" })
  budgetPlan: BudgetPlan;

  @ManyToOne(() => CostCenter, (cost) => cost.categorization)
  @JoinColumn({ name: "costCenterId" })
  costCenter: CostCenter;

  @ManyToOne(() => CostCenterCategory, (category) => category.categorization)
  @JoinColumn({ name: "categoryId" })
  costCenterCategory: CostCenterCategory;

  @ManyToOne(
    () => CostCenterSubCategory,
    (subCategory) => subCategory.categorization,
  )
  @JoinColumn({ name: "subCategoryId" })
  costCenterSubCategory: CostCenterSubCategory;
}
