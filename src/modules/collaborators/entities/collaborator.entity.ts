import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Contracts } from "src/modules/contracts/entities/contracts.entity";
import { Approvals } from "src/modules/payables/entities/approval.entity";
import { Payables } from "src/modules/payables/entities/payable.entity";
import { User } from "src/modules/users/entities/user.entity";
import { CollaboratorHistory } from "./collaborator-history.entity";
import { Column, Entity, Index, OneToMany } from "typeorm";
import {
  DisableBy,
  Education,
  EmploymentRelationship,
  FoodCategory,
  GenderIdentity,
  OccupationArea,
  Race,
  RegistrationStatus,
} from "../enum";

@Entity({
  name: "collaborators",
})
export class Collaborator extends AbstractEntity<Collaborator> {
  @Column({
    type: "varchar",
    nullable: false,
  })
  name: string;

  @Column({
    type: "varchar",
    nullable: true,
  })
  emergencyContactName: string;

  @Column({
    type: "varchar",
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    type: "varchar",
    nullable: true,
  })
  telephone: string;

  @Column({
    type: "varchar",
    nullable: true,
  })
  emergencyContactTelephone: string;

  @Column({
    type: "varchar",
    unique: true,
    nullable: false,
    length: 11,
  })
  cpf: string;

  @Column({
    type: "varchar",
    unique: true,
    nullable: true,
  })
  rg: string;

  @Column({
    type: "enum",
    enum: OccupationArea,
    nullable: false,
  })
  occupationArea: OccupationArea;

  @Column({
    type: "enum",
    enum: GenderIdentity,
    nullable: true,
  })
  genderIdentity: GenderIdentity;

  @Column({
    type: "enum",
    enum: Race,
    nullable: true,
  })
  @Index({ unique: false })
  race: Race;

  @Column({
    type: "varchar",
    nullable: true,
  })
  role: string;

  @Column({
    type: "timestamp",
    nullable: false,
  })
  startOfContract: Date;

  @Column({
    type: "datetime",
    nullable: true,
  })
  dateOfBirth: Date;

  @Column({
    type: "enum",
    enum: EmploymentRelationship,
    nullable: false,
  })
  employmentRelationship: EmploymentRelationship;

  @Column({
    type: "enum",
    enum: FoodCategory,
    nullable: true,
  })
  foodCategory: FoodCategory;

  @Column({
    type: "varchar",
    nullable: true,
  })
  foodCategoryDescription: string;

  @Column({
    type: "enum",
    enum: Education,
    nullable: true,
  })
  education: Education;

  @Column({
    type: "enum",
    enum: DisableBy,
    nullable: true,
  })
  disableBy: DisableBy;

  @Column({
    type: "enum",
    enum: RegistrationStatus,
    nullable: false,
    default: RegistrationStatus.PRE_CADASTRO,
  })
  status: RegistrationStatus;

  @Column({
    type: "longtext",
    nullable: true,
  })
  biography: string;

  @Column({
    type: "varchar",
    nullable: true,
  })
  completeAddress: string;

  @Column({
    type: "varchar",
    nullable: true,
  })
  allergies: string;

  @Column({
    type: "boolean",
    nullable: true,
  })
  experienceInThePublicSector: boolean;

  @Column({
    type: "boolean",
    default: true,
  })
  active: boolean;

  @OneToMany(() => User, (user) => user.collaborator)
  users: User[];

  @OneToMany(() => Approvals, (approval) => approval.collaborator)
  approvals: Approvals[];

  @OneToMany(() => Contracts, (contract) => contract.collaborator)
  contracts: Contracts[];

  @OneToMany(() => Payables, (payable) => payable.collaborator)
  payables: Payables[];

  @OneToMany(() => CollaboratorHistory, (history) => history.collaborator)
  history: CollaboratorHistory[];
}
