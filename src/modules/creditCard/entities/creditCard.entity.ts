import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CardMovimentation } from "./cardMovimentation.entity";
import { Accounts } from "src/modules/accounts/entities/accounts.entity";

@Entity({
  name: "creditCard",
})
export class CreditCard extends AbstractEntity<CreditCard> {
  @Column({ type: "varchar", length: 200 })
  name: string;

  @Column({ type: "varchar", length: 4 })
  lastDigits: string;

  @Column({ type: "varchar", length: 200 })
  responsible: string;

  @Column({ type: "varchar", length: 200 })
  instituition: string;

  @Column({ type: "int", nullable: true })
  accountId: number;

  @Column({ type: "int", default: 1 })
  dueDay: number;

  @OneToMany(() => CardMovimentation, (mov) => mov.card)
  movimentations: CardMovimentation[];

  @ManyToOne(() => Accounts, (a) => a.creditCards, {
    cascade: ["remove"],
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "accountId" })
  account: Accounts;

  @Column({
    type: "boolean",
    default: true,
  })
  active: boolean;
}
