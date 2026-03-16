import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Contracts } from "src/modules/contracts/entities/contracts.entity";
import { Payables } from "src/modules/payables/entities/payable.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { CategorySupplier } from "../enum";
import { PixInfo } from "src/common/DTOs/pixInfo.entity";
import { BancaryInfo } from "src/common/DTOs/bancaryInfo.entity";

@Entity({
  name: "suppliers",
})
export class Supplier extends AbstractEntity<Supplier> {
  @Column({
    type: "varchar",
    nullable: false,
  })
  name: string;

  @Column({
    type: "varchar",
    nullable: false,
  })
  email: string;

  @Column({
    type: "varchar",
    unique: true,
    nullable: false,
    length: 14,
  })
  cnpj: string;

  @Column({
    type: "varchar",
    nullable: false,
  })
  corporateName: string;

  @Column({
    type: "varchar",
    nullable: false,
  })
  fantasyName: string;

  @Column({
    type: "enum",
    nullable: false,
    enum: CategorySupplier,
  })
  serviceCategory: CategorySupplier;

  @Column({
    type: "int",
    nullable: true,
  })
  serviceEvaluation: number;

  @Column({
    type: "varchar",
    nullable: true,
  })
  commentEvaluation: string;

  @Column(() => BancaryInfo)
  bancaryInfo: BancaryInfo;

  @Column(() => PixInfo)
  pixInfo: PixInfo;

  @Column({
    type: "boolean",
    default: true,
  })
  active: boolean;

  @OneToMany(() => Payables, (payable) => payable.supplier)
  payables: Payables[];

  @OneToMany(() => Contracts, (contract) => contract.supplier)
  contracts: Contracts[];
}
