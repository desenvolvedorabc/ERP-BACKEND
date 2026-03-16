import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { Column, Entity } from "typeorm";

@Entity({ name: "token" })
export class Token extends AbstractEntity<Token> {
  @Column({ type: "text" })
  token: string;

  @Column({ type: "timestamp" })
  expirationDate: Date;
}
