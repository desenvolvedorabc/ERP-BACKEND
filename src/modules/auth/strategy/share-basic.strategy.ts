import { BasicStrategy as Strategy } from "passport-http";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ShareBudgetPlansService } from "src/modules/budget-plans/services/share-budget-plans.service";

@Injectable()
export class ShareBasicStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly shareBudgetPlansService: ShareBudgetPlansService,
  ) {
    super({
      passReqToCallback: true,
    });
  }

  public validate = async (_, username: string, password: string) => {
    return await this.shareBudgetPlansService.checkCredentials({
      username,
      password,
    });
  };
}
