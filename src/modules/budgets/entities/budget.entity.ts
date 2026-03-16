import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { BudgetPlan } from "src/modules/budget-plans/entities/budget-plan.entity";
import { PartnerMunicipality } from "src/modules/partner-municipalities/entities/partner-municipality.entity";
import { PartnerState } from "src/modules/partner-states/entities/partner-state.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { BudgetResult } from "./budget-result.entity";

@Entity({
  name: "budgets",
})
@Index(["budgetPlanId", "partnerStateId"], {
  unique: true,
})
@Index(["budgetPlanId", "partnerMunicipalityId"], {
  unique: true,
})
export class Budget extends AbstractEntity<Budget> {
  @Column({ type: "bigint", nullable: false, default: 0 })
  valueInCents: number;

  @Column({ type: "int", nullable: false })
  @Index({ unique: false })
  budgetPlanId: number;

  @Column({ type: "int", nullable: true })
  @Index({ unique: false })
  partnerStateId: number;

  @Column({ type: "int", nullable: true })
  @Index({ unique: false })
  partnerMunicipalityId: number;

  @ManyToOne(() => BudgetPlan, (budgetPlan) => budgetPlan.budgets, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "budgetPlanId" })
  budgetPlan: BudgetPlan;

  @ManyToOne(() => PartnerState, (partnerState) => partnerState.budgets, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "partnerStateId" })
  partnerState: PartnerState;

  @ManyToOne(
    () => PartnerMunicipality,
    (partnerMunicipality) => partnerMunicipality.budgets,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "partnerMunicipalityId" })
  partnerMunicipality: PartnerMunicipality;

  @OneToMany(() => BudgetResult, (budgetResult) => budgetResult.budget, {
    cascade: true,
  })
  budgetResults: BudgetResult[];
}
