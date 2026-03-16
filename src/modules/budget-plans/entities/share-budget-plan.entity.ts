import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Column, Entity, Index } from "typeorm";

@Entity({
  name: "share_budget_plans",
})
@Index(["password", "username"], {
  unique: true,
})
export class ShareBudgetPlan extends AbstractEntity<ShareBudgetPlan> {
  @Column({ type: "varchar", nullable: true, unique: true })
  username: string;

  @Column({ type: "varchar", nullable: false, unique: true })
  password: string;

  @Column({ type: "simple-array", nullable: false })
  budgetPlanIds: number[];
}
