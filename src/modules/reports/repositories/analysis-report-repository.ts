/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { DataSource, SelectQueryBuilder } from "typeorm";
import { ReportPositionParamsDTO } from "../dtos/reportFilterParams.dto";
import { queryFieldsCardMov, queryFieldsPayable } from "../consts/query";
import { applyWhereClauses } from "src/common/utils/query/query-builder-util";
import { Payables } from "src/modules/payables/entities/payable.entity";
import { RawData } from "../types/analysis";
import { InstallmentStatus } from "src/modules/installments/enum";
import { Receivables } from "src/modules/receivables/entities/receivables.entity";
import { CardMovimentation } from "src/modules/creditCard/entities/cardMovimentation.entity";
import { PayableStatus } from "src/modules/payables/enums";
import { RootField } from "../types/shared";
import { BankRecordApi } from "src/modules/bank-reconciliation/entities/bank-record-api.entity";
import { Financier } from "src/modules/financiers/entities/financier.entity";

@Injectable()
export class AnalysisReportRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findReceivables(
    params: ReportPositionParamsDTO,
  ): Promise<Array<RawData>> {
    try {
      const queryBuilder = this.dataSource
        .createQueryBuilder()
        .from(Receivables, "Receivable");

      this.leftJoinCategorization(queryBuilder, "Receivable");
      this.joinTablesForAccounts(queryBuilder, "Receivable");
      this.selectFieldsForAccounts(queryBuilder, "Receivable");
      this.applyFilters(queryBuilder, params, queryFieldsPayable);
      this.groupByForAccounts(queryBuilder, "Receivable");

      return await queryBuilder.getRawMany();
    } catch (error) {
      console.error(error);
    }
  }

  async findPayables(params: ReportPositionParamsDTO): Promise<Array<RawData>> {
    try {
      const queryBuilder = this.dataSource
        .createQueryBuilder()
        .from(Payables, "Payable");

      this.innerJoinCategorization(queryBuilder, "Payable");
      this.joinTablesForAccounts(queryBuilder, "Payable");
      this.selectFieldsForAccounts(queryBuilder, "Payable");
      this.applyFilters(queryBuilder, params, queryFieldsPayable);
      this.groupByForAccounts(queryBuilder, "Payable");

      const results = await queryBuilder.getRawMany();
      const cardMovimentations = await this.findCardMov(params);

      return results.concat(cardMovimentations);
    } catch (error) {
      console.error(error);
    }
  }

  private async findCardMov(
    params: ReportPositionParamsDTO,
  ): Promise<Array<RawData>> {
    try {
      const queryBuilder = this.dataSource
        .createQueryBuilder()
        .from(CardMovimentation, "CardMovimentation");
      this.joinTablesForCardMov(queryBuilder, "CardMovimentation");
      this.selectFieldsForCardMovs(queryBuilder, "CardMovimentation");
      this.applyFilters(queryBuilder, params, queryFieldsCardMov);
      this.groupByForCardMov(queryBuilder, "CardMovimentation");

      return await queryBuilder.getRawMany();
    } catch (error) {
      console.error(error);
    }
  }

  async findBankReconciliationReport(
    params: ReportPositionParamsDTO,
  ): Promise<Array<RawData>> {
    try {
      const queryBuilder = this.dataSource
        .createQueryBuilder()
        .from(BankRecordApi, "BankRecordApi")
        .leftJoin("BankRecordApi.bankReconciliation", "BankRecon")
        .leftJoin("BankRecon.recordSystem", "Installments");

      this.joinTablesForBankRecon(queryBuilder, "BankRecordApi");
      this.selectFieldsForBankRecon(queryBuilder, "BankRecordApi");
      this.applyFilters(queryBuilder, params, queryFieldsPayable);
      this.groupByForBankRecon(queryBuilder, "BankRecordApi");

      return await queryBuilder.getRawMany();
    } catch (error) {
      console.error(error);
    }
  }

  async groupByFinanciers(): Promise<
    Array<{
      id: number;
      name: string;
      total: number;
    }>
  > {
    try {
      const queryBuilder = this.dataSource
        .createQueryBuilder()
        .from(Financier, "Financier")
        .select("Financier.id", "id")
        .addSelect("Financier.name", "name")
        .addSelect("COALESCE(SUM(Receivable.totalValue), 0)", "total")
        .leftJoin("Financier.receivables", "Receivable")
        .groupBy("Financier.id");

      return await queryBuilder.getRawMany();
    } catch (error) {
      console.error(error);
    }
  }

  private selectFields<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: string,
  ) {
    queryBuilder
      .addSelect(`${rootField}.id`)
      .addSelect(["CostCenter.name", "CostCenter.id"])
      .addSelect("BudgetPlan.id")
      .addSelect(
        `
        CASE 
          WHEN BudgetPlan.scenarioName IS NULL 
          THEN CONCAT(BudgetPlan.year, ' ',Program.name, ' ',FORMAT(BudgetPlan.version, 1))
          ELSE BudgetPlan.scenarioName
        END`,
        "BudgetPlan_name",
      );
  }

  private selectFieldsForAccounts<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: string,
  ) {
    this.selectFields(queryBuilder, rootField);
    queryBuilder
      .addSelect("SUM(Installments.value)", "total")
      .addSelect("DATE_FORMAT(Installments.dueDate, '%m/%y')", "monthYear");
  }

  private selectFieldsForCardMovs<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: string,
  ) {
    this.selectFields(queryBuilder, rootField);
    queryBuilder
      .addSelect("CardMovimentation.value", "total")
      .addSelect(
        "DATE_FORMAT(CardMovimentation.purchaseDate, '%m/%y')",
        "monthYear",
      );
  }

  private selectFieldsForBankRecon<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: string,
  ) {
    this.selectFields(queryBuilder, rootField);

    queryBuilder
      .addSelect("Installments.dueDate")
      .addSelect("CostCenter.name", "CostCenter_name")
      .addSelect(`${rootField}.transactionAmount`, "total")
      .addSelect(
        `DATE_FORMAT(${rootField}.transactionDate, '%m/%y')`,
        "monthYear",
      );
  }

  private joinBaseTables<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder
      .leftJoin(`Categorization.budgetPlan`, "BudgetPlan")
      .leftJoin(`Categorization.costCenter`, "CostCenter")
      .leftJoin(`Categorization.program`, "Program");
  }

  private innerJoinCategorization<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: RootField,
  ) {
    queryBuilder.innerJoin(`${rootField}.categorization`, "Categorization");
  }

  private leftJoinCategorization<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: RootField,
  ) {
    queryBuilder.leftJoin(`${rootField}.categorization`, "Categorization");
  }

  private joinTablesForAccounts<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: string,
  ) {
    this.joinBaseTables(queryBuilder);
    queryBuilder.innerJoin(
      `${rootField}.installments`,
      "Installments",
      "Installments.status != :q",
      {
        q: InstallmentStatus.CANCELLED,
      },
    );
  }

  private joinTablesForCardMov<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: string,
  ) {
    this.leftJoinCategorization(queryBuilder, "CardMovimentation");
    this.joinBaseTables(queryBuilder);
    queryBuilder.innerJoin(
      `${rootField}.payable`,
      "Payable",
      "Payable.payableStatus NOT IN (:...q)",
      {
        q: [PayableStatus.REJECTED, PayableStatus.PENDING],
      },
    );
  }

  private joinTablesForBankRecon<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: RootField,
  ) {
    this.leftJoinCategorization(queryBuilder, rootField);
    this.joinBaseTables(queryBuilder);
  }

  private applyFilters<T>(
    queryBuilder: SelectQueryBuilder<T>,
    params: ReportPositionParamsDTO,
    queryFields: Record<string, string>,
  ) {
    applyWhereClauses(queryBuilder, params, queryFields);
  }

  private groupBy<T>(queryBuilder: SelectQueryBuilder<T>, rootField: string) {
    queryBuilder
      .groupBy(`${rootField}.id`)
      .addGroupBy("BudgetPlan.id")
      .addGroupBy("CostCenter.id");
  }

  private groupByForAccounts<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: string,
  ) {
    this.groupBy(queryBuilder, rootField);
    queryBuilder
      .addGroupBy("Installments.dueDate")
      .addGroupBy("DATE_FORMAT(Installments.dueDate, '%M/%Y')");
  }

  private groupByForCardMov<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: string,
  ) {
    this.groupBy(queryBuilder, rootField);
    queryBuilder
      .addGroupBy("CardMovimentation.purchaseDate")
      .addGroupBy("DATE_FORMAT(CardMovimentation.purchaseDate, '%M/%Y')");
  }

  private groupByForBankRecon<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: string,
  ) {
    this.groupBy(queryBuilder, rootField);
    queryBuilder
      .addGroupBy(`${rootField}.transactionDate`)
      .addGroupBy(`DATE_FORMAT(${rootField}.transactionDate, '%M/%Y')`);
  }
}
