import { DataSource } from "typeorm";
import { Injectable } from "@nestjs/common";
import { ShareBudgetPlan } from "../../entities/share-budget-plan.entity";
import { ValidateShareBudgetPlanDto } from "../../dto/validate-share-budget-plan.dto";
import { BaseRepository } from "src/database/typeorm/base-repository";

interface CreateShareBudgetPlan {
  budgetPlanIds: number[];
  password: string;
  username: string;
}

@Injectable()
export class ShareBudgetPlansRepository extends BaseRepository<ShareBudgetPlan> {
  constructor(dataSource: DataSource) {
    super(ShareBudgetPlan, dataSource);
  }

  async _create(dto: CreateShareBudgetPlan): Promise<void> {
    const { budgetPlanIds, password, username } = dto;

    const budgetPlan = this.getRepository(ShareBudgetPlan).create({
      username,
      budgetPlanIds,
      password,
    });

    await this.getRepository(ShareBudgetPlan).save(budgetPlan);
  }

  async _findOneByUsernameAndPassword({
    username,
    password,
  }: ValidateShareBudgetPlanDto) {
    const sharedBudgetPlan = await this.getRepository(ShareBudgetPlan).findOne({
      where: {
        username,
        password,
      },
    });

    return {
      sharedBudgetPlan,
    };
  }
}
