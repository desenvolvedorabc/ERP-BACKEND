import { AbstractEntity } from "src/database/typeorm/abstract.entity";
import { User } from "src/modules/users/entities/user.entity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";

@Entity({
  name: "forgot_password",
})
export class ForgotPassword extends AbstractEntity<ForgotPassword> {
  @Column({
    type: "varchar",
    nullable: false,
    unique: true,
  })
  token: string;

  @Column({
    type: "boolean",
    default: true,
  })
  isValid: boolean;

  @OneToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: number;
}
