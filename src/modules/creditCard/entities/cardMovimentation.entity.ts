/* eslint-disable prettier/prettier */
import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { CreditCard } from "./creditCard.entity";
import { Payables } from "src/modules/payables/entities/payable.entity";
import { MovimentationStatus } from "../enums";
import { Categorization } from "src/modules/categorization/entities/categorization.entity";

@Entity({
  name: "cardMovimentation",
})
export class CardMovimentation extends AbstractEntity<CardMovimentation> {
  @Column({ type: "varchar", length: 200 })
  description: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  purchaseDate: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  referenceDate: Date;

  @Column({ type: "boolean" })
  hasInstallments: boolean;

  @Column({ type: "uuid", length: 200, default: "" })
  installmentId: string;

  @Column({ type: "int", default: 1 })
  numberOfInstallments: number;

  @Column({ type: "int", default: 1 })
  currentInstallment: number;

  @Column({ type: "float", default: 0.0 })
  value: number;

  @Column({ type: "int" })
  cardId: number;

  @Column({ type: "int", nullable: true, default: null })
  payableId: number;

  @Column({
    type: "enum",
    enum: MovimentationStatus,
    default: MovimentationStatus.OPEN,
  })
  status: MovimentationStatus;

  @ManyToOne(() => CreditCard, (card) => card.movimentations)
  @JoinColumn({ name: "cardId" })
  card: CreditCard;

  @ManyToOne(() => Payables, (p) => p.cardMovimentations)
  @JoinColumn({ name: "payableId" })
  payable: Payables;

  @OneToOne(() => Categorization, (c) => c.cardMov)
  categorization: Categorization;
}
