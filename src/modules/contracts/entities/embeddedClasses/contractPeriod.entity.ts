import { Column } from "typeorm";
export class ContractPeriod {
  @Column({ type: "timestamp", nullable: true })
  start: Date;

  @Column({ type: "timestamp", nullable: true })
  end: Date;

  @Column({ default: false })
  isIndefinite: boolean;
}
