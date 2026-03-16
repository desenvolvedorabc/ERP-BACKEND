import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Budget } from "src/modules/budgets/entities/budget.entity";
import { Entity, Column, Index, OneToMany } from "typeorm";

@Entity({
  name: "partner_municipalities",
})
@Index(["name", "uf"], {
  unique: true,
})
@Index(["uf"], {
  unique: false,
})
export class PartnerMunicipality extends AbstractEntity<PartnerMunicipality> {
  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: false, length: 2 })
  uf: string;

  @Column({ type: "varchar", nullable: false, unique: true })
  cod: string;

  @OneToMany(() => Budget, (budget) => budget.partnerMunicipality, {
    cascade: true,
  })
  budgets: Budget[];
}
