import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersModule } from "../users/users.module";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ForgotPassword } from "./entities/forgot-password.entity";
import { BudgetPlansModule } from "../budget-plans/budget-plans.module";
import { ShareBasicStrategy } from "./strategy/share-basic.strategy";
import { OptionsBasicStrategy } from "./strategy/options.strategy";
import { ApprovalsRepository } from "../payables/repositories/approval-repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([ForgotPassword]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET"),
        signOptions: { expiresIn: `${process.env.JWT_SECONDS_EXPIRE}s` },
      }),
    }),
    UsersModule,
    BudgetPlansModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    ShareBasicStrategy,
    OptionsBasicStrategy,
    ApprovalsRepository,
  ],
})
export class AuthModule {}
