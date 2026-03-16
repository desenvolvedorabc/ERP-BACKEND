import { Injectable } from "@nestjs/common";
import { DataSource, SelectQueryBuilder } from "typeorm";
import { ReportPositionParamsDTO } from "../dtos/reportFilterParams.dto";
import { queryFieldsPayable } from "../consts/query";
import { applyWhereClauses } from "src/common/utils/query/query-builder-util";
import { Payables } from "src/modules/payables/entities/payable.entity";
import { PayableStatus, PaymentType } from "src/modules/payables/enums";
import { NoContractRawData } from "../types/noContracts";

@Injectable()
export class NoContractSuppliersReportRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findNoContractSuppliersReportData(
    params: ReportPositionParamsDTO,
  ): Promise<Array<NoContractRawData>> {
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .from(Payables, "Payable");

    this.selectFields(queryBuilder);
    this.joinTables(queryBuilder);
    this.applyFilters(queryBuilder, params, queryFieldsPayable);
    this.groupBy(queryBuilder);

    return await queryBuilder.getRawMany();
  }

  private selectFields<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder
      .select([`Payable.id`])
      .addSelect(["Supplier.id", "Supplier.name"])
      .addSelect(["BudgetPlan.id"])
      .addSelect(
        `
        CASE 
          WHEN BudgetPlan.scenarioName IS NULL 
          THEN CONCAT(BudgetPlan.year, ' ',Program.name, ' ',FORMAT(BudgetPlan.version, 1))
          ELSE BudgetPlan.scenarioName
        END`,
        "budgetPlan_name",
      )
      .addSelect("SUM(Payable.totalValue)", "total")
      .where(
        "Payable.contractId IS NULL AND Payable.payableStatus != :q1 AND Payable.payableStatus != :q2 AND Payable.paymentType = :q3",
        {
          q1: PayableStatus.APPROVING,
          q2: PayableStatus.REJECTED,
          q3: PaymentType.NO_CONTRACT,
        },
      );
  }

  private joinTables<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder
      .innerJoin("Payable.categorization", "Categorization")
      .leftJoin(`Categorization.budgetPlan`, "BudgetPlan")
      .leftJoin(`Categorization.program`, "Program")
      .innerJoin("Payable.supplier", "Supplier");
  }

  private applyFilters<T>(
    queryBuilder: SelectQueryBuilder<T>,
    params: ReportPositionParamsDTO,
    queryFields: Record<string, string>,
  ) {
    applyWhereClauses(queryBuilder, params, queryFields);
  }

  private groupBy<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder
      .groupBy("Supplier.id")
      .addGroupBy("BudgetPlan.id")
      .addGroupBy("Payable.id");
  }
}
