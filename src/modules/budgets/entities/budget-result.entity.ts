import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Budget } from "./budget.entity";
import { CostCenterSubCategory } from "src/modules/cost-centers/entities/cost-center-sub-category.entity";
import { CostCenterCategory } from "src/modules/cost-centers/entities/cost-center-category.entity";

@Entity({
  name: "budget_results",
})
@Index(["budgetId", "costCenterSubCategoryId", "month"], {
  unique: true,
})
@Index(["budgetId", "costCenterCategoryId"], {
  unique: false,
})
@Index(["budgetId", "costCenterSubCategoryId"], {
  unique: false,
})
export class BudgetResult extends AbstractEntity<BudgetResult> {
  @Column({ type: "int", nullable: false })
  month: number;

  @Column({ type: "bigint", nullable: false, default: 0 })
  valueInCents: number;

  @Column({ type: "int", nullable: false })
  @Index({ unique: false })
  budgetId: number;

  @Column({ type: "int", nullable: false })
  @Index({ unique: false })
  costCenterSubCategoryId: number;

  @Column({ type: "int", nullable: false })
  @Index({ unique: false })
  costCenterCategoryId: number;

  @Column({ type: "json" })
  data: Record<string, any>;

  @ManyToOne(() => Budget, (budget) => budget.budgetResults, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "budgetId" })
  budget: Budget;

  @ManyToOne(
    () => CostCenterSubCategory,
    (costCenterSubCategory) => costCenterSubCategory.budgetResults,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "costCenterSubCategoryId" })
  costCenterSubCategory: CostCenterSubCategory;

  @ManyToOne(
    () => CostCenterCategory,
    (costCenterCategory) => costCenterCategory.budgetResults,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "costCenterCategoryId" })
  costCenterCategory: CostCenterCategory;
}
