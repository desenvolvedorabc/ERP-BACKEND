import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { ShareBasicAuthGuard } from "./share-basic-auth.guard";
import { AuthGuard } from "@nestjs/passport";
import { OptionsBasicAuthGuard } from "./OptionsBasicAuth.guard";

@Injectable()
export class JwtOrBasicAuthGuard implements CanActivate {
  constructor(
    private readonly jwtAuthGuard: JwtAuthGuard,
    private readonly optionsBasic: OptionsBasicAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const jwtResult = await this.jwtAuthGuard.canActivate(context);
      if (jwtResult) return true;
    } catch (error) {}

    try {
      const basicResult = await this.optionsBasic.canActivate(context);
      if (basicResult) return true;
    } catch (error) {}

    return false;
  }
}
