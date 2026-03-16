import { ForbiddenException, Injectable } from "@nestjs/common";
import { differenceInDays } from "date-fns";
import {
  ForbiddenInvalidCredentials,
  InternalServerError,
} from "src/common/errors";
import { generatePasswordAndUsername } from "src/common/utils/generate-password-username";
import { sendEmailShareBudgetPlan } from "src/mails";
import {
  ShareBudgetPlanConsolidatedResultDto,
  ShareBudgetPlanDto,
} from "../dto/share-budget-plan.dto";
import { ValidateShareBudgetPlanDto } from "../dto/validate-share-budget-plan.dto";
import { ShareBudgetPlansRepository } from "../repositories/typeorm/share-budget-plans-repository";
import { BudgetPlansService } from "./budget-plans.service";

@Injectable()
export class ShareBudgetPlansService {
  constructor(
    private shareBudgetPlansRepository: ShareBudgetPlansRepository,

    private budgetPlansService: BudgetPlansService,
  ) {}

  async create({ emails, budgetPlanId }: ShareBudgetPlanDto): Promise<void> {
    const { budgetPlan } = await this.budgetPlansService.findOne(budgetPlanId, [
      "program",
    ]);

    const { password, username } = generatePasswordAndUsername();

    const nameBudgetPlan = `${budgetPlan.year} ${budgetPlan.program.name} ${budgetPlan.version}`;

    try {
      await this.shareBudgetPlansRepository._create({
        budgetPlanIds: [budgetPlanId],
        password,
        username,
      });

      emails.map((email) =>
        sendEmailShareBudgetPlan({
          id: budgetPlan.id,
          username,
          email,
          name: nameBudgetPlan,
          password,
        }),
      );
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async createConsolidatedResult({
    emails,
    budgetPlanIds,
  }: ShareBudgetPlanConsolidatedResultDto): Promise<void> {
    const { password, username } = generatePasswordAndUsername();

    try {
      await this.shareBudgetPlansRepository._create({
        budgetPlanIds,
        password,
        username,
      });

      emails.map((email) =>
        sendEmailShareBudgetPlan({
          id: null,
          username,
          email,
          name: "Consolidado ABC",
          password,
        }),
      );
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async checkCredentials(dto: ValidateShareBudgetPlanDto) {
    const { username, password } = dto;

    const { sharedBudgetPlan } =
      await this.shareBudgetPlansRepository._findOneByUsernameAndPassword({
        username,
        password,
      });

    if (!sharedBudgetPlan) {
      throw new ForbiddenInvalidCredentials();
    }

    const currentDate = new Date();
    const totalDifferenceInDays = differenceInDays(
      currentDate,
      sharedBudgetPlan.createdAt,
    );

    if (totalDifferenceInDays >= 1) {
      throw new ForbiddenException(
        "Credenciais expiradas, entre em contato com o administrador Bem Comum para gerar uma nova senha.",
      );
    }

    return { ...dto, budgetPlansIds: sharedBudgetPlan.budgetPlanIds };
  }
}
