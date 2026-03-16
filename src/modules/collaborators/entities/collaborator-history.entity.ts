import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Collaborator } from "./collaborator.entity";
import { DisableBy } from "../enum";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";

@Entity({
  name: "collaborator_history",
})
export class CollaboratorHistory extends AbstractEntity<CollaboratorHistory> {
  @Column({
    type: "int",
    nullable: false,
  })
  collaboratorId: number;

  @ManyToOne(() => Collaborator, (collaborator) => collaborator.history)
  @JoinColumn({ name: "collaboratorId" })
  collaborator: Collaborator;

  // Campos que são rastreados
  @Column({
    type: "varchar",
    nullable: true,
  })
  previousRole: string;

  @Column({
    type: "varchar",
    nullable: true,
  })
  newRole: string;

  @Column({
    type: "timestamp",
    nullable: true,
  })
  previousStartOfContract: Date;

  @Column({
    type: "timestamp",
    nullable: true,
  })
  newStartOfContract: Date;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  previousRemuneration: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  newRemuneration: number;

  @Column({
    type: "boolean",
    nullable: true,
  })
  previousActive: boolean;

  @Column({
    type: "boolean",
    nullable: true,
  })
  newActive: boolean;

  @Column({
    type: "enum",
    enum: DisableBy,
    nullable: true,
  })
  previousDisableBy: DisableBy;

  @Column({
    type: "enum",
    enum: DisableBy,
    nullable: true,
  })
  newDisableBy: DisableBy;

  @Column({
    type: "varchar",
    nullable: true,
  })
  changedField: string; // 'role', 'startOfContract', 'remuneration', 'active'
}

