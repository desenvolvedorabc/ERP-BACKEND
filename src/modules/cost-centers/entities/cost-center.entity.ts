import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { BudgetPlan } from "src/modules/budget-plans/entities/budget-plan.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CostCenterType } from "../enum";
import { CostCenterCategory } from "./cost-center-category.entity";
import { Categorization } from "src/modules/categorization/entities/categorization.entity";

@Entity({
  name: "cost_centers",
})
export class CostCenter extends AbstractEntity<CostCenter> {
  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: false, default: CostCenterType.PAGAR })
  type: CostCenterType;

  @Column({
    type: "boolean",
    nullable: false,
    default: true,
  })
  active: boolean;

  @Column({ type: "int", nullable: false })
  budgetPlanId: number;

  @ManyToOne(() => BudgetPlan, (budgetPlan) => budgetPlan.costCenters, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "budgetPlanId" })
  budgetPlan: BudgetPlan;

  @OneToMany(() => CostCenterCategory, (category) => category.costCenter, {
    cascade: true,
  })
  categories: CostCenterCategory[];

  @OneToMany(() => Categorization, (c) => c.costCenter, {
    cascade: ["remove"],
    onDelete: "CASCADE",
  })
  categorization: Categorization[];
}
