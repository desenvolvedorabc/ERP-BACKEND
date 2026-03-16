import { Injectable } from "@nestjs/common";
import { DataSource, SelectQueryBuilder } from "typeorm";
import { ReportPositionParamsDTO } from "../dtos/reportFilterParams.dto";
import { InstallmentStatus } from "src/modules/installments/enum";
import {
  queryFieldsCardMov,
  queryFieldsPayable,
  queryFieldsReceivable,
} from "../consts/query";
import { applyWhereClauses } from "src/common/utils/query/query-builder-util";
import { Receivables } from "src/modules/receivables/entities/receivables.entity";
import { Payables } from "src/modules/payables/entities/payable.entity";
import { RawData } from "../types/positions";
import { PayableStatus } from "src/modules/payables/enums";
import { CardMovimentation } from "src/modules/creditCard/entities/cardMovimentation.entity";
import { RootField } from "../types/shared";
import { BankRecordApi } from "src/modules/bank-reconciliation/entities/bank-record-api.entity";

@Injectable()
export class PositionReportsRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findReceivablesPositionReportData(
    params: ReportPositionParamsDTO,
  ): Promise<Array<RawData>> {
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .from(Receivables, "Receivable");

    // VOLTAR PARA INNER JOIN
    this.innerJoinCategorization(queryBuilder, "Receivable");
    this.selectFieldsForAccounts(queryBuilder, "Financier");
    this.joinTablesForAccounts(
      queryBuilder,
      "Receivable",
      "financier",
      "Financier",
    );
    this.applyFilters(queryBuilder, params, queryFieldsReceivable);
    this.groupBy(queryBuilder, "Financier.id");

    return await queryBuilder.getRawMany();
  }

  async findPayablesPositionReportData(
    params: ReportPositionParamsDTO,
  ): Promise<Array<RawData>> {
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .from(Payables, "Payable");

    // VOLTAR PARA INNER JOIN!
    this.innerJoinCategorization(queryBuilder, "Payable");
    this.joinTablesForAccounts(queryBuilder, "Payable", "supplier", "Supplier");
    this.selectFieldsForAccounts(queryBuilder, "Supplier");
    this.applyFilters(queryBuilder, params, queryFieldsPayable);
    this.groupBy(queryBuilder, "Supplier.id");

    return await queryBuilder.getRawMany();
  }

  async findCardMovPositionReportData(
    params: ReportPositionParamsDTO,
  ): Promise<Array<RawData>> {
    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .from(CardMovimentation, "CardMovimentation");

    // VOLTAR PARA INNER JOIN!
    this.innerJoinCategorization(queryBuilder, "CardMovimentation");
    this.joinTablesForCardMov(queryBuilder, "CardMovimentation");
    this.selectFieldsForCardMov(queryBuilder, "Supplier");
    this.applyFiltersForCardMov(queryBuilder, params, queryFieldsCardMov);
    this.groupBy(queryBuilder, "Supplier.id");

    return await queryBuilder.getRawMany();
  }

  async findPositionDataForBankRecon(
    params: ReportPositionParamsDTO,
  ): Promise<Array<RawData>> {
    try {
      const queryBuilder = this.dataSource
        .createQueryBuilder()
        .from(BankRecordApi, "BankRecordApi")
        .leftJoin("BankRecordApi.bankReconciliation", "BankRecon")
        .leftJoin("BankRecon.recordSystem", "Installments");
      this.leftJoinCategorization(queryBuilder, "BankRecordApi" as RootField);
      this.joinTablesForBankRecon(queryBuilder, "BankRecordApi" as RootField);
      this.selectFieldsForBankRecon(queryBuilder, "BankRecordApi");
      this.applyFilters(queryBuilder, params, queryFieldsPayable);
      this.groupByForBankRecon(queryBuilder, "BankRecordApi");

      return await queryBuilder.getRawMany();
    } catch (error) {
      console.error(error);
    }
  }

  private selectFieldsForAccounts<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: string,
  ) {
    queryBuilder
      .select([`${rootField}.name AS name`, `${rootField}.id AS id`])
      .addSelect(["CostCenter.name", "CostCenter.id"])
      .addSelect(["Category.name", "Category.id"])
      .addSelect(
        `
        SUM(CASE WHEN Installments.status = (:s1) THEN Installments.value ELSE 0 END) as PENDENTE,
        SUM(CASE WHEN Installments.status = (:s2) THEN Installments.value ELSE 0 END) as PAGO,
        SUM(CASE WHEN Installments.status = (:s3) THEN Installments.value ELSE 0 END) as ATRASADO
        `,
      )
      .setParameters({
        s1: InstallmentStatus.PENDING,
        s2: InstallmentStatus.PAID,
        s3: InstallmentStatus.OVERDUE,
      });
  }

  private selectFieldsForCardMov<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: string,
  ) {
    queryBuilder
      .select([`${rootField}.name AS name`, `${rootField}.id AS id`])
      .addSelect(["CostCenter.name", "CostCenter.id"])
      .addSelect(["Category.name", "Category.id"])
      .addSelect(
        `
        SUM(CASE WHEN Payable.payableStatus = (:s1) THEN CardMovimentation.value ELSE 0 END) as PENDENTE,
        SUM(CASE WHEN Payable.payableStatus IN (:...s2) THEN CardMovimentation.value ELSE 0 END) as PAGO,
        SUM(CASE WHEN Payable.payableStatus = (:s3) THEN CardMovimentation.value ELSE 0 END) as ATRASADO
        `,
      )
      .setParameters({
        s1: PayableStatus.APPROVED,
        s3: PayableStatus.DUE,
      })
      .setParameter("s2", [PayableStatus.CONCLUDED, PayableStatus.PAID]);
  }

  private selectFields<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder.addSelect([
      `COALESCE(Category.name, '') AS Category_name`,
      `COALESCE(MAX(Category.id), '') AS Category_id`,
    ]);
  }

  private selectFieldsForBankRecon<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: string,
  ) {
    this.selectFields(queryBuilder);

    queryBuilder
      .addSelect(`${rootField}.id`, "id")
      .addSelect(["CostCenter.id", "CostCenter.name"])
      .addSelect("Installments.dueDate")
      .addSelect(`${rootField}.transactionAmount`, "PAGO")
      .addSelect(
        `DATE_FORMAT(${rootField}.transactionDate, '%m/%y')`,
        "monthYear",
      );
  }

  private joinTables<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder
      .leftJoin(`Categorization.costCenter`, "CostCenter")
      .leftJoin(`Categorization.costCenterCategory`, "Category");
  }

  private joinTablesForAccounts<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: "Receivable" | "Payable",
    field: string,
    alias: string,
  ) {
    this.joinTables(queryBuilder);
    queryBuilder
      .innerJoin(`${rootField}.${field}`, alias)
      .innerJoin(
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
    this.joinTables(queryBuilder);
    queryBuilder
      .innerJoin(
        `${rootField}.payable`,
        "Payable",
        "Payable.payableStatus NOT IN (:...q)",
        {
          q: [PayableStatus.REJECTED, PayableStatus.PENDING],
        },
      )
      .innerJoin(`Payable.supplier`, "Supplier");
  }

  private joinTablesForBankRecon<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: string,
  ) {
    this.joinTables(queryBuilder);
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

  private applyFilters<T>(
    queryBuilder: SelectQueryBuilder<T>,
    params: ReportPositionParamsDTO,
    queryFields: Record<string, string>,
  ) {
    applyWhereClauses(queryBuilder, params, queryFields);
  }

  private applyFiltersForCardMov<T>(
    queryBuilder: SelectQueryBuilder<T>,
    params: ReportPositionParamsDTO,
    queryFields: Record<string, string>,
  ) {
    this.applyFilters(queryBuilder, params, queryFields);
  }

  private groupBy<T>(queryBuilder: SelectQueryBuilder<T>, rootGroup: string) {
    queryBuilder
      .groupBy(rootGroup)
      .addGroupBy("CostCenter.id")
      .addGroupBy("Category.id");
  }

  private groupByForBankRecon<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: string,
  ) {
    queryBuilder
      .addGroupBy(`Category.name`)
      .addGroupBy(`${rootField}.transactionDate`)
      .addGroupBy(`DATE_FORMAT(${rootField}.transactionDate, '%M/%Y')`);
  }
}
