import { BasicStrategy as Strategy } from "passport-http";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ApprovalsRepository } from "src/modules/payables/repositories/approval-repository";

@Injectable()
export class OptionsBasicStrategy extends PassportStrategy(
  Strategy,
  "options",
) {
  constructor(private readonly approvalsRepository: ApprovalsRepository) {
    super({
      passReqToCallback: true,
    });
  }

  public validate = async (
    _,
    ApprovalsPayableId: string,
    ApprovalsPassword: string,
  ) => {
    const parsedPayableId = Number(ApprovalsPayableId);
    const approval = await this.approvalsRepository._findByPayableAndPassword({
      payableId: parsedPayableId,
      password: ApprovalsPassword,
    });
    return !!approval && approval.approved === null;
  };
}
