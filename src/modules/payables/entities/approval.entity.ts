import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Collaborator } from "src/modules/collaborators/entities/collaborator.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Payables } from "./payable.entity";
import { User } from "src/modules/users/entities/user.entity";

@Entity({ name: "approvals" })
export class Approvals extends AbstractEntity<Approvals> {
  @Column({ type: "int", nullable: true, default: null })
  collaboratorId: number;

  @ManyToOne(() => Collaborator, (collaborator) => collaborator.approvals)
  @JoinColumn({ name: "collaboratorId" })
  collaborator: Collaborator;

  @Column({ type: "int", nullable: true, default: null })
  userId: number;

  @ManyToOne(() => User, (user) => user.approvals)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "int" })
  payableId: number;

  @ManyToOne(() => Payables, (payable) => payable.approvals, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "payableId" })
  payable: Payables;

  @Column({ type: "varchar" })
  password: string;

  @Column({ type: "boolean", default: null, nullable: true })
  approved: boolean;

  @Column({ type: "varchar", nullable: true })
  obs: string;
}
