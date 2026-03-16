import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { BudgetPlan } from "src/modules/budget-plans/entities/budget-plan.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { Categorization } from "src/modules/categorization/entities/categorization.entity";
import { Contracts } from "src/modules/contracts/entities/contracts.entity";

@Entity({
  name: "programs",
})
export class Program extends AbstractEntity<Program> {
  @Column({
    type: "varchar",
    nullable: false,
  })
  name: string;

  @Column({
    type: "varchar",
    unique: true,
    nullable: false,
  })
  abbreviation: string;

  @Column({
    type: "varchar",
    nullable: false,
  })
  director: string;

  @Column({
    type: "longtext",
    nullable: false,
  })
  description: string;

  @Column({
    type: "varchar",
    nullable: true,
  })
  logo: string;

  @Column({
    type: "boolean",
    nullable: false,
    default: true,
  })
  active: boolean;

  @OneToMany(() => BudgetPlan, (budgetPlan) => budgetPlan.program)
  budgetPlans: BudgetPlan[];

  @OneToMany(() => Contracts, (c) => c.program, {
    cascade: true,
  })
  contracts: Contracts[];

  @OneToMany(() => Categorization, (c) => c.program, {
    cascade: ["remove"],
    onDelete: "CASCADE",
  })
  categorization: Categorization[];
}
