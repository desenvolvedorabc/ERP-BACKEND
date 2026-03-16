import { DataSource } from "typeorm";
import { Injectable } from "@nestjs/common";
import { BudgetResult } from "../../entities/budget-result.entity";
import {
  Education,
  EmploymentRelationship,
} from "src/modules/collaborators/enum";
import { CostCenterSubCategory } from "src/modules/cost-centers/entities/cost-center-sub-category.entity";
import { BaseRepository } from "src/database/typeorm/base-repository";

export interface BudgetResultData {
  month: number;
  baseValueInCents: number | null;
  numberOfEnrollments: number | null;
  ipca: number | null;
  justification: string | null;
  education: Education | null;
  employmentRelationship: EmploymentRelationship | null;
  numberOfFinancialDirectors: number;
  salaryInCents: number | null;
  salaryAdjustment: number | null;
  inssEmployer: number | null;
  inss: number | null;
  fgtsCharges: number | null;
  pisCharges: number | null;
  transportationVouchersInCents: number | null;
  foodVoucherInCents: number | null;
  healthInsuranceInCents: number | null;
  lifeInsuranceInCents: number | null;
  holidaysAndChargesInCents: number | null;
  allowanceInCents: number | null;
  thirteenthInCents: number | null;
  fgtsInCents: number | null;
  accommodationInCents: number | null;
  foodInCents: number | null;
  transportInCents: number | null;
  carAndFuelInCents: number | null;
  airfareInCents: number | null;
  numberOfPeople: number | null;
  dailyAccommodation: number | null;
  dailyFood: number | null;
  dailyTransport: number | null;
  dailyCarAndFuel: number | null;
  totalTrips: number | null;
}

export interface ICreateBudgetResult {
  month: number;
  valueInCents: number;
  data: Partial<BudgetResultData>;
  budgetId: number;
  costCenterSubCategoryId: number;
  costCenterCategoryId: number;
}

@Injectable()
export class BudgetResultsRepository extends BaseRepository<BudgetResult> {
  constructor(dataSource: DataSource) {
    super(BudgetResult, dataSource);
  }

  async _create(request: Partial<ICreateBudgetResult>): Promise<void> {
    const {
      budgetId,
      costCenterCategoryId,
      costCenterSubCategoryId,
      month,
      valueInCents,
      data,
    } = request;

    const budgetResult = this.getRepository(BudgetResult).create({
      budgetId,
      costCenterSubCategoryId,
      costCenterCategoryId,
      month,
      valueInCents,
      data,
    });

    await this.getRepository(BudgetResult).save(budgetResult);
  }

  async _duplicate(data: Partial<BudgetResult>): Promise<void> {
    const budgetResult = this.getRepository(BudgetResult).create({
      budgetId: data.budgetId,
      costCenterCategoryId: data.costCenterCategoryId,
      costCenterSubCategoryId: data.costCenterSubCategoryId,
      valueInCents: data.valueInCents,
      month: data.month,
      data: data.data,
    });

    await this.getRepository(BudgetResult).save(budgetResult);
  }

  async _findOneById(id: number) {
    const budgetResult = await this.getRepository(BudgetResult).findOne({
      where: {
        id,
      },
    });

    return {
      budgetResult,
    };
  }

  async _getTotalInCentsByBudgetIdAndCategoryId(
    budgetId: number = null,
    costCenterCategoryId: number = null,
  ): Promise<{ valueInCents: number }> {
    const queryBuilder = this.getRepository(BudgetResult)
      .createQueryBuilder("BudgetResults")
      .innerJoin("BudgetResults.costCenterSubCategory", "costCenterSubCategory")
      .select("SUM(BudgetResults.valueInCents)", "valueInCents")

      .andWhere("costCenterSubCategory.active = TRUE");

    if (budgetId) {
      queryBuilder.andWhere("BudgetResults.budgetId = :budgetId", { budgetId });
    }

    if (costCenterCategoryId) {
      queryBuilder.andWhere(
        "BudgetResults.costCenterCategoryId = :costCenterCategoryId",
        {
          costCenterCategoryId,
        },
      );
    }

    const { valueInCents } = await queryBuilder.getRawOne();

    return {
      valueInCents,
    };
  }

  async _findOneByBudgetAndSubCategoryAndMonth(
    budgetId: number,
    subCategory: number,
    month: number,
  ) {
    const budgetResult = await this.getRepository(BudgetResult).findOne({
      where: {
        budgetId,
        costCenterSubCategoryId: subCategory,
        month,
      },
    });

    return {
      budgetResult,
    };
  }

  async _getTotalInCentsByBudgetIdAndSubCategory(
    budgetId: number,
    subCategory: number,
    month: number,
  ) {
    const budgetResult = await this.getRepository(BudgetResult)
      .createQueryBuilder("BudgetResults")
      .andWhere("BudgetResults.budgetId = :budgetId", { budgetId })
      .andWhere("BudgetResults.costCenterSubCategoryId = :subCategory", {
        subCategory,
      })
      .andWhere("BudgetResults.month = :month", { month })
      .getOne();

    return {
      budgetResult,
    };
  }

  async _findManyByBudgetIdAndCategoryId(budgetId: number, categoryId: number) {
    const budgetResults = await this.getRepository(BudgetResult).find({
      where: {
        budgetId,
        costCenterCategoryId: categoryId,
      },
    });

    return {
      budgetResults,
    };
  }

  async _getTotalInCentsByBudgetAndCategoryAndMonth(
    isFilterByBudget = false,
    budgetId: number,
    categoryId: number,
    month: number,
  ): Promise<{ valueInCents: number }> {
    const queryBuilder = this.getRepository(BudgetResult)
      .createQueryBuilder("BudgetResults")
      .innerJoin("BudgetResults.costCenterSubCategory", "costCenterSubCategory")
      .select("SUM(BudgetResults.valueInCents)", "valueInCents")
      .andWhere("BudgetResults.costCenterCategoryId = :categoryId", {
        categoryId,
      })
      .andWhere("BudgetResults.month = :month", { month });

    if (isFilterByBudget) {
      queryBuilder.andWhere("BudgetResults.budgetId = :budgetId", { budgetId });
    }

    const { valueInCents } = await queryBuilder.getRawOne();

    return {
      valueInCents,
    };
  }

  async _findManyByBudgetIdAndSubCategoryId(
    budgetId: number,
    subCategoryId: number,
  ) {
    const budgetResults = await this.getRepository(BudgetResult).find({
      where: {
        budgetId,
        costCenterSubCategoryId: subCategoryId,
      },
    });

    return {
      budgetResults,
    };
  }

  async _findManyByBudgetId(budgetId: number) {
    const budgetResults = await this.getRepository(BudgetResult).find({
      where: {
        budgetId,
      },
      relations: [
        "costCenterSubCategory",
        "costCenterSubCategory.costCenterCategory",
        "costCenterSubCategory.costCenterCategory.costCenter",
      ],
    });

    return {
      budgetResults,
    };
  }

  async _findManyByBudgetIdAndSubCategoryName(
    budgetId: number,
    costCenterSubCategory: CostCenterSubCategory,
  ) {
    const budgetResults = await this.getRepository(BudgetResult)
      .createQueryBuilder("BudgetResults")
      .innerJoin("BudgetResults.costCenterSubCategory", "costCenterSubCategory")
      .innerJoin(
        "costCenterSubCategory.costCenterCategory",
        "costCenterCategory",
      )
      .where("BudgetResults.budgetId = :budgetId", { budgetId })
      .andWhere("costCenterSubCategory.name = :subCategoryName", {
        subCategoryName: costCenterSubCategory.name,
      })
      .andWhere("costCenterCategory.name = :categoryName", {
        categoryName: costCenterSubCategory.costCenterCategory.name,
      })
      .andWhere("costCenterSubCategory.active = TRUE")
      .getMany();

    return {
      budgetResults,
    };
  }

  async _update(id: number, data: Partial<BudgetResult>): Promise<void> {
    await this.getRepository(BudgetResult).update(id, data);
  }

  async _delete(id: number): Promise<void> {
    await this.getRepository(BudgetResult).delete(id);
  }
}
