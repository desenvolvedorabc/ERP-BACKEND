import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Contracts } from "src/modules/contracts/entities/contracts.entity";
import { Payables } from "src/modules/payables/entities/payable.entity";
import { Receivables } from "src/modules/receivables/entities/receivables.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity({
  name: "files",
})
export class Files extends AbstractEntity<Files> {
  @Column({ type: "int", nullable: true, default: null })
  payableId: number;

  @Column({ type: "int", nullable: true, default: null })
  receivableId: number;

  @Column({ type: "int", nullable: true, default: null })
  contractId: number;

  @ManyToOne(() => Payables, (payable) => payable.files)
  @JoinColumn({ name: "payableId" })
  payable: Payables;

  @ManyToOne(() => Receivables, (receivable) => receivable.files)
  @JoinColumn({ name: "receivableId" })
  receivable: Receivables;

  @ManyToOne(() => Contracts, (contract) => contract.files)
  @JoinColumn({ name: "contractId" })
  contracts: Contracts;

  @Column({ type: "varchar" })
  fileUrl: string;
}
