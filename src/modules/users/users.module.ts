import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UsersRepository } from "./repositories/typeorm/users-repository";
import { ForgotPassword } from "../auth/entities/forgot-password.entity";
import { Approvals } from "../payables/entities/approval.entity";
import { ApprovalValidationService } from "src/common/services/approval-validation.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ForgotPassword, Approvals]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, ApprovalValidationService],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
