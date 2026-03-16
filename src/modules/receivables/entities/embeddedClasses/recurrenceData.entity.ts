import { Column } from "typeorm";
import { RecurrenceType } from "../../enums";

export class recurenceData {
  @Column({ type: "varchar", length: 50, nullable: true, default: null })
  recurrenceType: RecurrenceType;

  @Column({ type: "timestamp", nullable: true, default: null })
  startDate: Date;

  @Column({ type: "timestamp", nullable: true, default: null })
  endDate: Date;

  @Column({ type: "int", nullable: true, default: null })
  dueDay: number;
}
