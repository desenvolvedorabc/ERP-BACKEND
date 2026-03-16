/* eslint-disable prettier/prettier */
import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { BudgetResult } from "src/modules/budgets/entities/budget-result.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CostCenterSubCategory } from "./cost-center-sub-category.entity";
import { CostCenter } from "./cost-center.entity";
import { Categorization } from "src/modules/categorization/entities/categorization.entity";

@Entity({
  name: "cost_centers_categories",
})
export class CostCenterCategory extends AbstractEntity<CostCenterCategory> {
  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "int", nullable: false })
  costCenterId: number;

  @Column({
    type: "boolean",
    nullable: false,
    default: true,
  })
  active: boolean;

  @ManyToOne(() => CostCenter, (costCenter) => costCenter.categories, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "costCenterId",
  })
  costCenter: CostCenter;

  @OneToMany(
    () => CostCenterSubCategory,
    (category) => category.costCenterCategory,
    {
      cascade: true,
    },
  )
  subCategories: CostCenterSubCategory[];

  @OneToMany(
    () => BudgetResult,
    (budgetResult) => budgetResult.costCenterCategory,
    {
      cascade: true,
    },
  )
  budgetResults: BudgetResult[];

  @OneToMany(() => Categorization, (c) => c.costCenterCategory, {
    cascade: ["remove"],
    onDelete: "CASCADE",
  })
  categorization: Categorization[];
}
