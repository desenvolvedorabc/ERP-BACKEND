import { Injectable } from "@nestjs/common";
import { DataSource, EntityTarget, SelectQueryBuilder } from "typeorm";
import { ReportPositionParamsDTO } from "../dtos/reportFilterParams.dto";
import {
  queryFieldsCardMov,
  queryFieldsPayable,
  queryFieldsReceivable,
} from "../consts/query";
import { applyWhereClauses } from "src/common/utils/query/query-builder-util";
import { Receivables } from "src/modules/receivables/entities/receivables.entity";
import { Payables } from "src/modules/payables/entities/payable.entity";
import {
  BaseTypeCashFlow,
  BaseTypeCashFlowChart,
  CashFlowRawData,
} from "../types/cashflow";
import { PayableStatus } from "src/modules/payables/enums";
import { InstallmentStatus } from "src/modules/installments/enum";
import { CardMovimentation } from "src/modules/creditCard/entities/cardMovimentation.entity";
import { RootField } from "../types/shared";
import { BankRecordApi } from "src/modules/bank-reconciliation/entities/bank-record-api.entity";

@Injectable()
export class CashFlowReportRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findCashFlowReportData(
    params: ReportPositionParamsDTO,
  ): Promise<CashFlowRawData> {
    const receivableData = await this.findCashFlowDataForAccounts(
      Receivables,
      params,
      "Receivable",
      queryFieldsReceivable,
    );
    const payableData = await this.findCashFlowDataForAccounts(
      Payables,
      params,
      "Payable",
      queryFieldsPayable,
      "-",
    );
    const cardMov = await this.findCashFlowDataForCardMov(
      CardMovimentation,
      params,
      "CardMovimentation",
      queryFieldsCardMov,
    );

    const bankRecon = await this.findCashFlowDataForBankRecon(params);

    return { receivableData, payableData, cardMov, bankRecon };
  }

  async findCashFlowReportDataForGraph(
    params: ReportPositionParamsDTO,
  ): Promise<BaseTypeCashFlowChart[]> {
    const receivableData = await this.findCashFlowDataForChartForAccounts(
      Receivables,
      params,
      "Receivable",
      queryFieldsReceivable,
    );
    const payableData = await this.findCashFlowDataForChartForAccounts(
      Payables,
      params,
      "Payable",
      queryFieldsPayable,
      "-",
    );
    const cardMov = await this.findCashFlowDataForChartCardMov(
      CardMovimentation,
      params,
      "CardMovimentation",
      queryFieldsCardMov,
    );

    return [...payableData, ...receivableData, ...cardMov]; // precisa agrupar dados por dia, somando os receivables e payables
  }

  private async findCashFlowDataForAccounts<T>(
    entityTarget: EntityTarget<T>,
    params: ReportPositionParamsDTO,
    rootField: Omit<RootField, "CardMovimentation">,
    queryFields: Record<string, string>,
    signal: "-" | "+" = "+",
  ): Promise<BaseTypeCashFlow[]> {
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .from(entityTarget, rootField as string);

    this.selectFieldsForAccounts(queryBuilder, signal);
    this.joinTablesForAccounts(queryBuilder, rootField);
    this.applyFilters(queryBuilder, params, queryFields);
    this.groupBy(queryBuilder);

    return await queryBuilder.getRawMany();
  }

  private async findCashFlowDataForCardMov<T>(
    entityTarget: EntityTarget<T>,
    params: ReportPositionParamsDTO,
    rootField: RootField,
    queryFields: Record<string, string>,
  ): Promise<BaseTypeCashFlow[]> {
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .from(entityTarget, rootField);

    this.selectFieldsForCardMov(queryBuilder);
    this.joinTablesForCardMov(queryBuilder, rootField);
    this.applyFilters(queryBuilder, params, queryFields);
    this.groupBy(queryBuilder);

    return await queryBuilder.getRawMany();
  }

  private async findCashFlowDataForChartForAccounts<T>(
    entityTarget: EntityTarget<T>,
    params: ReportPositionParamsDTO,
    rootField: "Payable" | "Receivable",
    queryFields: Record<string, string>,
    signal: "-" | "+" = "+",
  ): Promise<BaseTypeCashFlowChart[]> {
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .from(entityTarget, rootField);

    this.selectFieldsForAccounts(queryBuilder, signal);
    this.selectFieldsForGraph(queryBuilder);
    this.joinTablesForAccounts(queryBuilder, rootField);
    this.applyFilters(queryBuilder, params, queryFields);
    this.groupBy(queryBuilder);
    this.groupByForChart(queryBuilder);

    return await queryBuilder.getRawMany();
  }

  private async findCashFlowDataForChartCardMov<T>(
    entityTarget: EntityTarget<T>,
    params: ReportPositionParamsDTO,
    rootField: RootField,
    queryFields: Record<string, string>,
  ): Promise<BaseTypeCashFlowChart[]> {
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .from(entityTarget, rootField);

    this.selectFieldsForCardMov(queryBuilder);
    this.selectFieldsForGraphCardMov(queryBuilder);
    this.joinTablesForCardMov(queryBuilder, rootField);
    this.applyFilters(queryBuilder, params, queryFields);
    this.groupBy(queryBuilder);
    this.groupByForChart(queryBuilder);

    return await queryBuilder.getRawMany();
  }

  async findCashFlowDataForBankRecon(
    params: ReportPositionParamsDTO,
  ): Promise<Array<BaseTypeCashFlow>> {
    try {
      const queryBuilder = this.dataSource
        .createQueryBuilder()
        .from(BankRecordApi, "BankRecordApi")
        .leftJoin("BankRecordApi.bankReconciliation", "BankRecon")
        .leftJoin("BankRecon.recordSystem", "Installments");

      this.joinTablesForBankRecon(queryBuilder, "BankRecordApi" as RootField);
      this.selectFieldsForBankRecon(queryBuilder, "BankRecordApi");
      this.applyFilters(queryBuilder, params, queryFieldsPayable);
      this.groupByForBankRecon(queryBuilder, "BankRecordApi");

      return await queryBuilder.getRawMany();
    } catch (error) {
      console.error(error);
    }
  }

  private selectFields<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder
      .addSelect([
        `COALESCE(Category.name, '') AS Category_name`,
        `COALESCE(MAX(Category.id), '') AS Category_id`,
      ])
      .addSelect([
        `COALESCE(SubCategory.name, '') AS SubCategory_name`,
        `COALESCE(MAX(SubCategory.id), '') AS SubCategory_id`,
      ]);
  }

  private selectFieldsForAccounts<T>(
    queryBuilder: SelectQueryBuilder<T>,
    signal: "-" | "+",
  ) {
    const multiplier = `${signal}1`;
    const realizedStatus = InstallmentStatus.PAID;
    const expectedStatus = [
      InstallmentStatus.OVERDUE,
      InstallmentStatus.PENDING,
    ];
    this.selectFields(queryBuilder);
    queryBuilder
      .addSelect(
        `
        TRUNCATE(SUM(CASE WHEN Installments.status = (:realizedStatus) THEN Installments.value ELSE 0 END),2) * ${multiplier} as REALIZED,
        TRUNCATE(SUM(CASE WHEN Installments.status IN (:...expectedStatus) THEN Installments.value ELSE 0 END),2) * ${multiplier} as EXPECTED
        `,
      )
      .setParameter("realizedStatus", realizedStatus)
      .setParameter("expectedStatus", expectedStatus);
  }

  private selectFieldsForCardMov<T>(queryBuilder: SelectQueryBuilder<T>) {
    const realizedStatus = [PayableStatus.PAID, PayableStatus.CONCLUDED];
    const expectedStatus = [PayableStatus.DUE, PayableStatus.APPROVED];
    this.selectFields(queryBuilder);
    queryBuilder
      .addSelect(
        `
        TRUNCATE(SUM(CASE WHEN Payable.payableStatus IN (:...realizedStatus) THEN CardMovimentation.value ELSE 0 END),2) * -1 as REALIZED,
        TRUNCATE(SUM(CASE WHEN Payable.payableStatus IN (:...expectedStatus) THEN CardMovimentation.value ELSE 0 END),2) * -1 as EXPECTED
        `,
      )
      .setParameter("realizedStatus", realizedStatus)
      .setParameter("expectedStatus", expectedStatus);
  }

  private selectFieldsForGraph<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder.addSelect(
      "DATE_FORMAT(Installments.dueDate,'%d/%m/%Y') AS Installments_dueDate",
    );
  }

  private selectFieldsForGraphCardMov<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder.addSelect(
      "DATE_FORMAT(Payable.dueDate,'%d/%m/%Y') AS Installments_dueDate",
    );
  }

  private selectFieldsForBankRecon<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: string,
  ) {
    this.selectFields(queryBuilder);

    queryBuilder
      .addSelect("Installments.dueDate")
      .addSelect(
        `
      CASE 
        WHEN BankRecon.type = 'TAX' THEN 'saida'
        WHEN BankRecon.type = 'TRANSFER' THEN 'saida'
        WHEN BankRecon.type = 'PROFIT' THEN 'entrada'
        WHEN BankRecon.type = 'TRANSACTION_ENTRY' THEN 'entrada'
      END
      `,
        "type",
      )
      .addSelect(`${rootField}.transactionAmount`, "REALIZED")
      .addSelect(
        `DATE_FORMAT(${rootField}.transactionDate, '%m/%y')`,
        "monthYear",
      );
  }

  private joinBaseCategorization<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder
      .leftJoin(`Categorization.costCenterCategory`, `Category`)
      .leftJoin(`Categorization.costCenterSubCategory`, `SubCategory`);
  }

  private innerJoinCategorization<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: RootField,
  ) {
    queryBuilder.innerJoin(`${rootField}.categorization`, "Categorization");
    this.joinBaseCategorization(queryBuilder);
  }

  private leftJoinCategorization<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: RootField,
  ) {
    queryBuilder.leftJoin(`${rootField}.categorization`, "Categorization");
    this.joinBaseCategorization(queryBuilder);
  }

  private joinTablesForAccounts<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: Omit<RootField, "CardMovimentation">,
  ) {
    if (rootField === "Payable") {
      this.innerJoinCategorization(queryBuilder, rootField as RootField);
    } else {
      this.leftJoinCategorization(queryBuilder, rootField as RootField);
    }
    queryBuilder.innerJoin(`${rootField}.installments`, `Installments`);
  }

  private joinTablesForCardMov<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: RootField,
  ) {
    this.innerJoinCategorization(queryBuilder, rootField);
    queryBuilder.innerJoin(
      `${rootField}.payable`,
      "Payable",
      "Payable.payableStatus NOT IN (:...q)",
      {
        q: [PayableStatus.REJECTED, PayableStatus.PENDING],
      },
    );
  }

  private joinBaseTables<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder
      .leftJoin(`Categorization.budgetPlan`, "BudgetPlan")
      .leftJoin(`Categorization.costCenter`, "CostCenter")
      .leftJoin(`Categorization.program`, "Program");
  }

  private joinTablesForBankRecon<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: string,
  ) {
    this.leftJoinCategorization(queryBuilder, "BankRecordApi" as RootField);
    this.joinBaseTables(queryBuilder);
  }

  private applyFilters<T>(
    queryBuilder: SelectQueryBuilder<T>,
    params: ReportPositionParamsDTO,
    queryFields: Record<string, string>,
  ) {
    applyWhereClauses(queryBuilder, params, queryFields);
  }

  private groupBy<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder.groupBy(`Category.name`).addGroupBy(`SubCategory.name`);
  }

  private groupByForChart<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder.addGroupBy(`Installments_dueDate`);
  }

  private groupByForBankRecon<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: string,
  ) {
    this.groupBy(queryBuilder);
    queryBuilder
      .addGroupBy(`${rootField}.transactionDate`)
      .addGroupBy(`DATE_FORMAT(${rootField}.transactionDate, '%M/%Y')`);
  }
}
