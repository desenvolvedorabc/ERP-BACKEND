import { DataSource } from "typeorm";
import { Injectable } from "@nestjs/common";
import { BudgetResult } from "src/modules/budgets/entities/budget-result.entity";
import { CostCenter } from "src/modules/cost-centers/entities/cost-center.entity";
import { RealizedReportParamsDTO } from "../dtos/realizedReportFilterParams.dto";
import { CostCenterType } from "src/modules/cost-centers/enum";
import { BankReconciliation } from "src/modules/bank-reconciliation/entities/bank-reconciliation.entity";
import { Contracts } from "src/modules/contracts/entities/contracts.entity";
import { ContractStatus } from "src/modules/contracts/enums";

@Injectable()
export class RealizedReportRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getBudgetResults(year: number) {
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .select("BudgetResults")
      .from(BudgetResult, "BudgetResults")
      .innerJoin("BudgetResults.budget", "Budget")
      .innerJoin("Budget.budgetPlan", "BudgetPlan", "BudgetPlan.year = :year", {
        year,
      });

    return await queryBuilder.getMany();
  }

  async getCostCentersWithCategories(filters: RealizedReportParamsDTO) {
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .from(CostCenter, "CostCenters")
      .where("CostCenters.type = :type", {
        type: CostCenterType.PAGAR,
      })
      .select([
        "CostCenters.id",
        "CostCenters.name",
        "CostCenters.budgetPlanId",
        "categories.id",
        "categories.name",
        "subCategories.id",
        "subCategories.name",
      ])
      .innerJoin(
        "CostCenters.budgetPlan",
        "BudgetPlan",
        "BudgetPlan.year = :year",
        {
          year: filters.year.getFullYear(),
        },
      )
      .leftJoin(
        "CostCenters.categories",
        "categories",
        "categories.active = true",
      )
      .leftJoin(
        "categories.subCategories",
        "subCategories",
        "subCategories.active = true",
      )
      .leftJoin("BudgetPlan.budgets", "Budget");

    if (filters?.budgetPlanId) {
      queryBuilder.andWhere("CostCenters.budgetPlanId = :budgetPlanId", {
        budgetPlanId: filters.budgetPlanId,
      });
    }

    if (filters?.programId) {
      queryBuilder.andWhere("BudgetPlan.programId = :programId", {
        programId: filters.programId,
      });
    }

    if (filters?.partnerStateId) {
      queryBuilder.andWhere("Budget.partnerStateId = :partnerStateId", {
        partnerStateId: filters.partnerStateId,
      });
    }

    if (filters?.partnerMunicipalityId) {
      queryBuilder.andWhere(
        "Budget.partnerMunicipalityId = :partnerMunicipalityId",
        {
          partnerMunicipalityId: filters.partnerMunicipalityId,
        },
      );
    }

    return await queryBuilder.getMany();
  }

  async getContractsProvisioned(year: number) {
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .select([
        "Contracts.contractPeriod.start",
        "Contracts.totalValue",
        "Categorization.categoryId",
        "Categorization.subCategoryId",
      ])
      .from(Contracts, "Contracts")
      .where("Contracts.contractStatus <> :status", {
        status: ContractStatus.PENDING,
      })
      .andWhere("YEAR(Contracts.contractPeriod.start) = :year", {
        year,
      })
      .leftJoin("Contracts.payable", "Payables")
      .leftJoin("Payables.categorization", "Categorization");

    return await queryBuilder.getMany();
  }

  async getAllRealizedByCurrentDate(year: number): Promise<
    {
      categoryId: number;
      subCategoryId: number;
      total: number;
      month: number;
    }[]
  > {
    // essa query build não funcionou, mas seu log da query gerada foi usado para criar a query bruta
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .from(BankReconciliation, "BankReconciliation")
      .select("SUM(Installments.value)", "total")
      .addSelect("MONTH(Installments.dueDate)", "month")
      .addSelect("Categorization.categoryId", "categoryId")
      .addSelect("Categorization.subCategoryId", "subCategoryId")
      .innerJoin(
        "BankReconciliation.recordSystem",
        "Installments",
        "YEAR(Installments.dueDate) = :date",
        {
          date: year,
        },
      )
      .innerJoin("Installments.payable", "Payables")
      .leftJoin("Payables.categorization", "Categorization")
      .groupBy("MONTH(Installments.dueDate)")
      .addGroupBy("Payables.id")
      .addGroupBy("Categorization.categoryId")
      .addGroupBy("Categorization.subCategoryId");

    const result = await queryBuilder.getRawMany();

    /*
    const rawQuery = `
      SELECT 
        \`Payables\`.\`categoryId\` AS \`categoryId\`, 
        \`Payables\`.\`subCategoryId\` AS \`subCategoryId\`, 
        SUM(\`Installments\`.\`value\`) AS \`total\`, 
        MONTH(\`Installments\`.\`dueDate\`) AS \`month\` 
      FROM 
        \`bank-reconciliation\` \`BankReconciliation\` 
      INNER JOIN 
        \`installments\` \`Installments\` ON \`Installments\`.\`id\`=\`BankReconciliation\`.\`recordSystemId\` 
      INNER JOIN 
        \`payables\` \`Payables\` ON \`Payables\`.\`id\`=\`Installments\`.\`payableId\` 
      WHERE 
        YEAR(\`Installments\`.\`dueDate\`) = ${year}
      GROUP BY 
        MONTH(\`Installments\`.\`dueDate\`), 
        \`Payables\`.\`id\`, 
        \`Payables\`.\`categoryId\`, 
        \`Payables\`.\`subCategoryId\`
    `
    const result = await this.dataSource.query(rawQuery)
    */
    return result;
  }

  async getAllBankReconByYear(year: number) {
    const bankRecon = await this.dataSource
      .createQueryBuilder()

      .from(BankReconciliation, "BankReconciliation")
      .leftJoin("BankReconciliation.recordSystem", "Installments")
      .leftJoin("Installments.payable", "Payables")
      .leftJoin("Payables.categorization", "Categorization")
      .leftJoin("Categorization.costCenterCategory", "CostCenterCategory")
      .leftJoin("Categorization.costCenterSubCategory", "CostCenterSubCategory")
      .leftJoin("Categorization.costCenter", "CostCenter")
      .where("YEAR(Installments.dueDate) = :year", { year: year })
      .select("BankReconciliation.id", "id")
      .addSelect("CostCenter.id", "CostCenterId")
      .addSelect("COALESCE(CostCenter.name, null)", "name")
      .addSelect("COALESCE(Categorization.budgetPlanId, null)", "BudgetPlanId")
      .addSelect("SUM(Installments.value)", "totalRealized")
      .addSelect("CostCenterCategory.id", "categoryId")
      .addSelect("CostCenterSubCategory.id", "subCategoryId")
      .addSelect(
        "GROUP_CONCAT(DISTINCT CostCenterCategory.name ORDER BY CostCenterCategory.name ASC SEPARATOR ', ')",
        "categories",
      )
      .groupBy("BankReconciliation.id")
      .getRawMany();

    return bankRecon;
  }
}
