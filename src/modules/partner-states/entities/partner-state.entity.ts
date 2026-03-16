import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Budget } from "src/modules/budgets/entities/budget.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity({
  name: "partner_states",
})
export class PartnerState extends AbstractEntity<PartnerState> {
  @Column({ type: "varchar", nullable: false, unique: true })
  name: string;

  @Column({ type: "varchar", nullable: false, length: 2, unique: true })
  abbreviation: string;

  @OneToMany(() => Budget, (budget) => budget.partnerState, {
    cascade: true,
  })
  budgets: Budget[];
}
