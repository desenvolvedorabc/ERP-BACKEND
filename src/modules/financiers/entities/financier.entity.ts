import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Contracts } from "src/modules/contracts/entities/contracts.entity";
import { Receivables } from "src/modules/receivables/entities/receivables.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity({
  name: "financiers",
})
export class Financier extends AbstractEntity<Financier> {
  @Column({
    type: "varchar",
    nullable: false,
  })
  name: string;

  @Column({
    type: "varchar",
    nullable: false,
  })
  corporateName: string;

  @Column({
    type: "varchar",
    nullable: false,
  })
  legalRepresentative: string;

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
  telephone: string;

  @Column({
    type: "varchar",
    nullable: false,
  })
  address: string;

  @Column({
    type: "boolean",
    default: true,
  })
  active: boolean;

  @OneToMany(() => Receivables, (receivables) => receivables.financier)
  receivables: Receivables[];

  @OneToMany(() => Contracts, (contract) => contract.financier)
  contracts: Contracts[];
}
