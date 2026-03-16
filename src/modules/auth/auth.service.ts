import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { isPast } from "date-fns";
import { ForbiddenError, InternalServerError } from "src/common/errors";
import { generateToken } from "src/common/utils/generate-token";
import { sendEmailForgotPassword } from "src/mails";
import { Repository } from "typeorm";
import { UsersService } from "../users/users.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { ForgotPassword } from "./entities/forgot-password.entity";
import { PayloadType } from "./strategy/jwt.strategy";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,

    @InjectRepository(ForgotPassword)
    private readonly forgotPasswordRepository: Repository<ForgotPassword>,
  ) {}

  async login(dto: LoginDto) {
    const { user } = await this.usersService.checkCredentials(dto);
    const { token } = this.generateTokenByIdUser(user.id);

    if (!user.active) {
      throw new ForbiddenError();
    }

    return {
      user,
      token,
    };
  }

  async forgotPassword({ email }: ForgotPasswordDto): Promise<void> {
    const { user } = await this.usersService.findOneByEmail(email);

    const { token } = generateToken();

    let forgotPassword = await this.forgotPasswordRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!forgotPassword) {
      forgotPassword = this.forgotPasswordRepository.create({
        token,
        isValid: true,
        user,
      });
    } else {
      forgotPassword.token = token;
      forgotPassword.isValid = true;
    }

    try {
      await this.forgotPasswordRepository.save(forgotPassword);

      await sendEmailForgotPassword(user.email, token);
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async resetPassword({ password, token }: ResetPasswordDto) {
    const forgotPassword = await this.forgotPasswordRepository.findOne({
      where: {
        token,
      },
      relations: ["user"],
    });

    const oldDate = new Date(forgotPassword?.updatedAt);
    const date = new Date(forgotPassword?.updatedAt);

    date.setHours(oldDate.getHours() + 8);

    if (!forgotPassword || !forgotPassword?.isValid || isPast(date)) {
      throw new BadRequestException("Token inválido");
    }

    try {
      await this.usersService.updatePassword(forgotPassword.user, password);
      await this.forgotPasswordRepository.update(forgotPassword.id, {
        isValid: false,
      });
    } catch (e) {
      throw new InternalServerError();
    }
  }

  private generateTokenByIdUser(id: number): { token: string } {
    const payload: PayloadType = { id };
    const token = this.jwtService.sign(payload);

    return { token };
  }
}
