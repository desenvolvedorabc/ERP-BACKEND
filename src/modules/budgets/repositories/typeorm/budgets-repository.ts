import { DataSource, IsNull, Not, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { Budget } from "../../entities/budget.entity";
import { CreateBudgetDto } from "../../dto/create-budget.dto";
import { paginateData } from "src/common/utils/paginate-data";
import { PaginateParamsBudgets } from "../../dto/paginate-params-budgets";
import { BaseRepository } from "src/database/typeorm/base-repository";

@Injectable()
export class BudgetsRepository extends BaseRepository<Budget> {
  constructor(dataSource: DataSource) {
    super(Budget, dataSource);
  }

  async _create(createBudgetDto: CreateBudgetDto): Promise<Budget> {
    const { budgetPlanId, partnerMunicipalityId, partnerStateId } =
      createBudgetDto;

    const budgetPlan = this.getRepository(Budget).create({
      budgetPlanId,
      partnerMunicipalityId,
      partnerStateId,
    });

    return await this.getRepository(Budget).save(budgetPlan);
  }

  async _duplicate(data: Partial<Budget>): Promise<Budget> {
    const budget = this.getRepository(Budget).create({
      budgetPlanId: data.budgetPlanId,
      partnerMunicipalityId: data.partnerMunicipalityId,
      partnerStateId: data.partnerStateId,
      valueInCents: data.valueInCents,
    });

    return await this.getRepository(Budget).save(budget);
  }

  async _findOneById(id: number, relations: string[] = []) {
    const budget = await this.getRepository(Budget).findOne({
      where: {
        id,
      },
      relations,
    });

    return {
      budget,
    };
  }

  async _findOneWithResultsById(id: number) {
    const budget = await this.getRepository(Budget)
      .createQueryBuilder("Budgets")
      .select([
        "Budgets.id",
        "Budgets.budgetPlanId",
        "partnerState.id",
        "partnerState.name",
        "partnerMunicipality.id",
        "partnerMunicipality.name",
        "partnerMunicipality.uf",
        "budgetResults.id",
        "budgetResults.valueInCents",
        "budgetResults.costCenterSubCategoryId",
        "budgetResults.costCenterCategoryId",
        "budgetResults.month",
      ])
      .leftJoin("Budgets.partnerState", "partnerState")
      .leftJoin("Budgets.partnerMunicipality", "partnerMunicipality")
      .leftJoin("Budgets.budgetResults", "budgetResults")
      .where("Budgets.id = :id", { id })
      .getOne();

    return {
      budget,
    };
  }

  async _findOneWithTotalById(id: number): Promise<{ valueInCents: number }> {
    const { valueInCents } = await this.getRepository(Budget)
      .createQueryBuilder("Budgets")
      .innerJoin("Budgets.budgetResults", "budgetResults")
      .innerJoin("budgetResults.costCenterSubCategory", "costCenterSubCategory")
      .select("SUM(budgetResults.valueInCents)", "valueInCents")
      .where("Budgets.id = :id", { id })
      .andWhere("costCenterSubCategory.active = TRUE")
      .getRawOne();

    return {
      valueInCents: valueInCents ?? 0,
    };
  }

  async _findOneByBudgetPlanAndPartner(
    budgetPlanId: number,
    data: Partial<Budget>,
  ) {
    const queryBuilder = this.getRepository(Budget)
      .createQueryBuilder("Budgets")
      .where("Budgets.budgetPlanId = :budgetPlanId", {
        budgetPlanId,
      });

    if (data.partnerMunicipalityId) {
      queryBuilder.andWhere(
        "Budgets.partnerMunicipalityId = :partnerMunicipalityId",
        { partnerMunicipalityId: data.partnerMunicipalityId },
      );
    }

    if (data.partnerStateId) {
      queryBuilder.andWhere("Budgets.partnerStateId = :partnerStateId", {
        partnerStateId: data.partnerStateId,
      });
    }

    const budget = await queryBuilder.getOne();

    return {
      budget,
    };
  }

  async _findOneByPartnerStateIdAndBudgetPlanId(
    budgetPlanId: number,
    partnerStateId: number,
  ) {
    const budget = await this.getRepository(Budget).findOne({
      where: {
        budgetPlanId,
        partnerStateId,
      },
    });

    return {
      budget,
    };
  }

  async _findOneByPartnerMunicipalityIdAndBudgetPlanId(
    budgetPlanId: number,
    partnerMunicipalityId: number,
  ) {
    const budget = await this.getRepository(Budget).findOne({
      where: {
        budgetPlanId,
        partnerMunicipalityId,
      },
    });

    return {
      budget,
    };
  }

  async _removeByBudgetPlanId(budgetPlanId: number): Promise<void> {
    await this.getRepository(Budget).delete({
      budgetPlanId,
    });
  }

  async _delete(id: number): Promise<void> {
    await this.getRepository(Budget).delete(id);
  }

  async _countPartnerStatesByBudgetPlanId(budgetPlanId: number) {
    const countPartnerStates = await this.getRepository(Budget).count({
      where: {
        budgetPlanId,
        partnerStateId: Not(IsNull()),
      },
    });

    return {
      countPartnerStates,
    };
  }

  async _countPartnerMunicipalitiesByBudgetPlanId(budgetPlanId: number) {
    const countPartnerMunicipalities = await this.getRepository(Budget).count({
      where: {
        budgetPlanId,
        partnerMunicipalityId: Not(IsNull()),
      },
    });

    return {
      countPartnerMunicipalities,
    };
  }

  async _findManyByBudgetPlanId(budgetPlanId: number) {
    const budgets = await this.getRepository(Budget).find({
      where: {
        budgetPlanId,
      },
    });

    return {
      budgets,
    };
  }

  async _findAll({
    page,
    limit,
    budgetPlanId,
    partnerStateId,
    partnerMunicipalityId,
    isCsv,
  }: PaginateParamsBudgets) {
    const queryBuilder = this.getRepository(Budget)
      .createQueryBuilder("Budgets")
      .select([
        "Budgets.id",
        "Budgets.valueInCents",
        "partnerState.name",
        "partnerMunicipality.name",
        "partnerMunicipality.uf",
      ])
      .leftJoin("Budgets.partnerState", "partnerState")
      .leftJoin("Budgets.partnerMunicipality", "partnerMunicipality")
      .where("Budgets.budgetPlanId = :budgetPlanId", { budgetPlanId });

    if (partnerStateId) {
      queryBuilder.andWhere("Budgets.partnerStateId = :partnerStateId", {
        partnerStateId,
      });
    }

    if (partnerMunicipalityId) {
      queryBuilder.andWhere(
        "Budgets.partnerMunicipalityId = :partnerMunicipalityId",
        {
          partnerMunicipalityId,
        },
      );
    }

    const data = await paginateData(page, limit, queryBuilder, isCsv);

    return data;
  }

  async _update(id: number, data: Partial<Budget>): Promise<void> {
    await this.getRepository(Budget).update(id, data);
  }
}
