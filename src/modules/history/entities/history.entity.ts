import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Contracts } from "src/modules/contracts/entities/contracts.entity";
import { User } from "src/modules/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { ActionTypes } from "../enums";

@Entity({ name: "history" })
export class History extends AbstractEntity<History> {
  @Column({ type: "varchar", length: 10 })
  actionType: ActionTypes;

  @Column({ type: "int" })
  contractId: number;

  @Column({ type: "int" })
  userId: number;

  @ManyToOne(() => User, (user) => user.historys)
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Contracts, (contract) => contract.historys)
  @JoinColumn({ name: "contractId" })
  contract: Contracts;
}
