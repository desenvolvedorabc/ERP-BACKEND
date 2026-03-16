import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Budget } from "src/modules/budgets/entities/budget.entity";
import { CostCenter } from "src/modules/cost-centers/entities/cost-center.entity";
import { Program } from "src/modules/programs/entities/program.entity";
import { User } from "src/modules/users/entities/user.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Tree,
  TreeChildren,
  TreeParent,
} from "typeorm";
import { BudgetPlanStatus } from "../enum";
import { Categorization } from "src/modules/categorization/entities/categorization.entity";
import { Contracts } from "src/modules/contracts/entities/contracts.entity";

@Tree("materialized-path")
@Entity({
  name: "budget_plans",
})
@Index(["year", "programId", "version"], {
  unique: false,
})
@Index(["year", "programId", "version", "parentId"], {
  unique: true,
})
export class BudgetPlan extends AbstractEntity<BudgetPlan> {
  @Column({ type: "int", nullable: false })
  year: number;

  @Column({ type: "varchar", nullable: true })
  scenarioName: string;

  @Column({ type: "float", nullable: false })
  version: number;

  @Column({ type: "bigint", nullable: false, default: 0 })
  totalInCents: number;

  @Column({
    type: "enum",
    enum: BudgetPlanStatus,
    default: BudgetPlanStatus.RASCUNHO,
  })
  status: BudgetPlanStatus;

  @Column({ type: "int", nullable: false })
  @Index({
    unique: false,
  })
  programId: number;

  @Column({ type: "int", nullable: false })
  updatedById: number;

  @Column({ type: "int", nullable: true })
  @Index({
    unique: false,
  })
  parentId: number;

  @ManyToOne(() => Program, (program) => program.budgetPlans)
  @JoinColumn({ name: "programId" })
  program: Program;

  @ManyToOne(() => User)
  @JoinColumn({ name: "updatedById" })
  updatedBy: User;

  @OneToMany(() => CostCenter, (costCenter) => costCenter.budgetPlan, {
    cascade: true,
  })
  costCenters: CostCenter[];

  @OneToMany(() => Budget, (budget) => budget.budgetPlan, {
    cascade: true,
  })
  budgets: Budget[];

  @TreeParent({
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "parentId" })
  parent: BudgetPlan;

  @TreeChildren({
    cascade: true,
  })
  children: BudgetPlan[];

  @OneToMany(() => Contracts, (c) => c.budgetPlan, {
    cascade: true,
  })
  contracts: Contracts[];

  @OneToMany(() => Categorization, (c) => c.budgetPlan, {
    cascade: ["remove"],
    onDelete: "CASCADE",
  })
  categorization: Categorization[];
}
