import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { History } from "src/modules/history/entities/history.entity";
import { Approvals } from "src/modules/payables/entities/approval.entity";
import { Collaborator } from "src/modules/collaborators/entities/collaborator.entity";
import { Column, Entity, OneToMany, ManyToOne, JoinColumn } from "typeorm";

@Entity({
  name: "users",
})
export class User extends AbstractEntity<User> {
  @Column({
    type: "varchar",
    nullable: false,
  })
  name: string;

  @Column({
    type: "varchar",
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    type: "varchar",
    unique: true,
    nullable: false,
    length: 11,
  })
  cpf: string;

  @Column({
    type: "varchar",
    nullable: false,
  })
  telephone: string;

  @Column({
    type: "varchar",
    nullable: true,
  })
  imageUrl: string;

  @Column({
    type: "varchar",
    nullable: false,
    select: false,
  })
  password: string;

  @Column({
    type: "boolean",
    nullable: false,
    default: true,
  })
  active: boolean;

  @Column({
    type: "boolean",
    nullable: false,
    default: false,
  })
  massApprovalPermission: boolean;

  @Column({
    type: "int",
    nullable: true,
  })
  collaboratorId: number;

  @ManyToOne(() => Collaborator, (collaborator) => collaborator.users)
  @JoinColumn({ name: "collaboratorId" })
  collaborator: Collaborator;

  @OneToMany(() => History, (history) => history.user)
  historys: History[];

  @OneToMany(() => Approvals, (approval) => approval.user)
  approvals: Approvals[];
}
