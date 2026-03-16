/* eslint-disable prettier/prettier */
import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { BudgetResult } from "src/modules/budgets/entities/budget-result.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { SubCategoryReleaseType, SubCategoryType } from "../enum";
import { CostCenterCategory } from "./cost-center-category.entity";
import { Categorization } from "src/modules/categorization/entities/categorization.entity";

@Entity({
  name: "cost_centers_sub_categories",
})
export class CostCenterSubCategory extends AbstractEntity<CostCenterSubCategory> {
  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "enum", enum: SubCategoryType })
  type: SubCategoryType;

  @Column({ type: "enum", enum: SubCategoryReleaseType })
  releaseType: SubCategoryReleaseType;

  @Column({
    type: "boolean",
    nullable: false,
    default: true,
  })
  active: boolean;

  @Column({ type: "int", nullable: false })
  costCenterCategoryId: number;

  @ManyToOne(
    () => CostCenterCategory,
    (costCenterCategory) => costCenterCategory.subCategories,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({
    name: "costCenterCategoryId",
  })
  costCenterCategory: CostCenterCategory;

  @OneToMany(
    () => BudgetResult,
    (budgetResult) => budgetResult.costCenterSubCategory,
    {
      cascade: true,
    },
  )
  budgetResults: BudgetResult[];

  @OneToMany(() => Categorization, (c) => c.costCenterSubCategory, {
    cascade: ["remove"],
    onDelete: "CASCADE",
  })
  categorization: Categorization[];
}
