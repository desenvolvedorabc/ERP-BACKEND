import { Injectable } from "@nestjs/common";
import { DataSource, SelectQueryBuilder } from "typeorm";
import { InstallmentType } from "src/modules/installments/enum";
import { Receivables } from "src/modules/receivables/entities/receivables.entity";
import { Payables } from "src/modules/payables/entities/payable.entity";
import { PayableStatus } from "src/modules/payables/enums";
import { CardMovimentation } from "src/modules/creditCard/entities/cardMovimentation.entity";
import { Contracts } from "src/modules/contracts/entities/contracts.entity";
import { BankReconciliation } from "src/modules/bank-reconciliation/entities/bank-reconciliation.entity";
import { columnsConfig } from "../consts/columns";
import {
  AwaitedQueries,
  DEFAULTCOLUMNS,
  ENTITY,
  GeneralReportReturn,
  OmmitedGeneralReportParams,
} from "../types/generalReport";
import { GeneralReportParamsDTO } from "../dtos/generalReportParams.dto";
import {
  applyGroupedWhereClauses,
  applyWhereClauses,
} from "src/common/utils/query/query-builder-util";
import {
  queryFieldsCardMov,
  queryFieldsContractsP,
  queryFieldsContractsR,
  queryFieldsPayable,
  queryFieldsReceivable,
} from "../consts/query";
import { plainToInstance } from "class-transformer";
import { GeneralReportResponseDTO } from "../dtos/response/generalReportResponse.dto";
import { MovimentationStatus } from "src/modules/creditCard/enums";
import { ReportType } from "../enums";
import { omit, every, isNull } from "lodash";
import { BankReconciliationType } from "src/modules/bank-reconciliation/enums";
import { RootField } from "../types/shared";

@Injectable()
export class GeneralReportRepository {
  constructor(private readonly dataSource: DataSource) {}

  async unifiedReport(params: GeneralReportParamsDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { dueBetween, page, limit, ...cleanParams } = params;
    const allQueries = await this.getAllQueries(cleanParams);

    const result = await this.unionQuery(params, allQueries);
    const { total } = await this.countQuery(params, allQueries);

    return {
      data: plainToInstance(GeneralReportResponseDTO, result),
      meta: {
        page,
        limit,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / limit),
      },
    };
  }

  async unionReportCSV(params: GeneralReportParamsDTO) {
    const cleanParams = omit(params, ["page", "limit", "dueBetween"]);
    const allQueries = await this.getAllQueries(cleanParams);
    return this.unionQuery(params, allQueries, false);
  }

  private async unionQuery(
    { dueBetween, page, limit, ...params }: GeneralReportParamsDTO,
    allQueries: AwaitedQueries,
    pagination = true,
  ) {
    const unionQuery = this.dataSource.createQueryBuilder().select("*");
    this.combineQueries(unionQuery, allQueries);
    this.setParams(unionQuery, allQueries);
    this.filterDatesInCombined(unionQuery, { dueBetween });
    if (pagination) this.paginationAndOrder(unionQuery, page, limit, params);

    return await unionQuery.getRawMany<GeneralReportReturn>();
  }

  private async countQuery(
    params: GeneralReportParamsDTO,
    allQueries: AwaitedQueries,
  ) {
    const countQuery = this.dataSource
      .createQueryBuilder()
      .select("COUNT(*)", "total");
    this.combineQueries(countQuery, allQueries);
    this.setParams(countQuery, allQueries);
    this.filterDatesInCombined(countQuery, params);
    return await countQuery.getRawOne();
  }

  private combineQueries<T>(
    queryBuilder: SelectQueryBuilder<T>,
    allQueries: AwaitedQueries,
  ) {
    const queries = [];
    if (allQueries.contracts) queries.push(allQueries.contracts.getQuery());
    if (allQueries.payables) queries.push(allQueries.payables.getQuery());
    if (allQueries.receivables) queries.push(allQueries.receivables.getQuery());
    if (allQueries.cardMov) queries.push(allQueries.cardMov.getQuery());
    if (allQueries.appointments)
      queries.push(allQueries.appointments.getQuery());
    queryBuilder.from(
      `(
        ${queries.join(" UNION ALL ")}
        )`,
      "combined",
    );
  }

  private setParams<T>(
    queryBuilder: SelectQueryBuilder<T>,
    allQueries: AwaitedQueries,
  ) {
    const { contracts, payables, receivables, cardMov, appointments } =
      allQueries;
    let allParams = {
      t: InstallmentType.LIQUID,
      q: [PayableStatus.REJECTED, PayableStatus.PENDING],
      ms: MovimentationStatus.PROCESSED,
    };
    if (allQueries.contracts)
      allParams = { ...allParams, ...contracts.getParameters() };
    if (allQueries.payables)
      allParams = { ...allParams, ...payables.getParameters() };
    if (allQueries.receivables)
      allParams = { ...allParams, ...receivables.getParameters() };
    if (allQueries.cardMov)
      allParams = { ...allParams, ...cardMov.getParameters() };
    if (allQueries.appointments)
      allParams = { ...allParams, ...appointments.getParameters() };

    queryBuilder.setParameters(allParams);
  }

  private filterDatesInCombined<T>(
    queryBuilder: SelectQueryBuilder<T>,
    { dueBetween }: Pick<GeneralReportParamsDTO, "dueBetween">,
  ) {
    if (dueBetween && dueBetween.start && dueBetween.end) {
      queryBuilder.where("combined.data BETWEEN :start AND :end");
      queryBuilder.setParameters(dueBetween);
    }
  }

  private paginationAndOrder<T>(
    queryBuilder: SelectQueryBuilder<T>,
    page: number,
    limit: number,
    { columns }: Pick<GeneralReportParamsDTO, "columns">,
  ) {
    queryBuilder
      .offset((page - 1) * limit)
      .limit(limit)
      .orderBy(`combined.data`, "DESC");

    if (columns.includes("PARCELA") || columns.length === 0) {
      queryBuilder.addOrderBy("combined.parcela", "ASC");
    }
  }

  private async getAllQueries(
    params: OmmitedGeneralReportParams,
  ): Promise<AwaitedQueries> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { columns, reportType, ...rest } = params;
    const allNull = every(rest, isNull);
    const allQueries: AwaitedQueries = {} as AwaitedQueries;

    if (reportType === ReportType.PAYABLE || reportType === null) {
      allQueries.payables = await this.getPayablesQuery(params);
      allQueries.cardMov = await this.getCardMovQuery(params);
    }

    if (reportType === ReportType.RECEIVABLE || reportType === null) {
      allQueries.receivables = await this.getReceivablesQuery(params);
    }

    if (allNull) {
      allQueries.appointments = await this.getAppointmentsQuery(params);
    }

    allQueries.contracts = await this.getContractsQuery(params);

    return allQueries;
  }

  private async getContractsQuery({
    reportType,
    columns,
    ...params
  }: OmmitedGeneralReportParams) {
    const queryBuilder = this.dataSource
      .getRepository(Contracts)
      .createQueryBuilder("Contract");
    this.selectQuery(queryBuilder, "contract", columns, reportType);
    this.joinsContractsQuery(queryBuilder, reportType);
    this.applyFiltersContracts(queryBuilder, params, reportType);

    return queryBuilder;
  }

  private async getPayablesQuery({
    columns,
    ...params
  }: OmmitedGeneralReportParams) {
    const queryBuilder = this.dataSource
      .getRepository(Payables)
      .createQueryBuilder("Payable");
    this.selectQuery(queryBuilder, "payable", columns);
    this.joinPayablesQuery(queryBuilder);
    this.applyFilters(queryBuilder, params, queryFieldsPayable);
    return queryBuilder;
  }

  private async getReceivablesQuery({
    columns,
    ...params
  }: OmmitedGeneralReportParams) {
    const queryBuilder = this.dataSource
      .getRepository(Receivables)
      .createQueryBuilder("Receivable");
    this.selectQuery(queryBuilder, "receivable", columns);
    this.joinReceivablesQuery(queryBuilder);
    this.applyFilters(queryBuilder, params, queryFieldsReceivable);
    queryBuilder.andWhere("Receivable.contractId IS NULL");
    return queryBuilder;
  }

  private async getCardMovQuery({
    columns,
    ...params
  }: OmmitedGeneralReportParams) {
    const queryBuilder = this.dataSource
      .getRepository(CardMovimentation)
      .createQueryBuilder("CardMovimentation");
    this.selectQuery(queryBuilder, "CardMovimentation", columns);
    this.joinsCardMovQuery(queryBuilder);
    this.applyFilters(queryBuilder, params, queryFieldsCardMov);
    queryBuilder.andWhere("CardMovimentation.status = :ms");
    return queryBuilder;
  }

  private async getAppointmentsQuery({
    columns,
    reportType,
  }: OmmitedGeneralReportParams) {
    const queryBuilder = this.dataSource
      .getRepository(BankReconciliation)
      .createQueryBuilder("Reconciliation");
    this.selectQuery(queryBuilder, "appointment", columns);
    this.joinsAppointmentsQuery(queryBuilder);
    this.applyFiltersAppointments(queryBuilder, reportType);

    return queryBuilder;
  }

  private selectQuery<T>(
    queryBuilder: SelectQueryBuilder<T>,
    entity: ENTITY,
    fields: Array<keyof DEFAULTCOLUMNS>,
    reportType?: ReportType,
  ) {
    const columns = this.getColumns(entity, fields, reportType);
    queryBuilder.select(columns);
  }

  private joinsContractsQuery<T>(
    queryBuilder: SelectQueryBuilder<T>,
    typeQuery: ReportType,
  ) {
    if (typeQuery === ReportType.RECEIVABLE || typeQuery === null) {
      queryBuilder.leftJoin(`Contract.receivable`, "Receivable");
      this.joinReceivablesQuery(queryBuilder, "R");
    }
    if (typeQuery === ReportType.PAYABLE || typeQuery === null) {
      queryBuilder.leftJoin(`Contract.payable`, "Payable");
      this.joinPayablesQuery(queryBuilder, "P");
    }
  }

  private joinsCardMovQuery<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder.innerJoin(
      `CardMovimentation.payable`,
      "Payable",
      "Payable.payableStatus NOT IN (:...q)",
    );
    this.joinPayablesQuery(queryBuilder);
  }

  private joinsAppointmentsQuery<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder.innerJoin("Reconciliation.recordApi", "Appointment");
    this.leftJoinCategorization(queryBuilder, "Appointment");
    this.commonCategorizationJoins(queryBuilder);
  }

  private joinPayablesQuery<T>(
    queryBuilder: SelectQueryBuilder<T>,
    prefix?: "P",
  ) {
    queryBuilder.leftJoin("Payable.supplier", "Supplier");
    queryBuilder.leftJoin("Payable.collaborator", "Collaborator");
    this.leftJoinCategorization(queryBuilder, "Payable", prefix);
    this.commonJoins(queryBuilder, "Payable", prefix);
  }

  private joinReceivablesQuery<T>(
    queryBuilder: SelectQueryBuilder<T>,
    prefix?: "R",
  ) {
    queryBuilder.leftJoin("Receivable.financier", "Financier");
    this.leftJoinCategorization(queryBuilder, "Receivable", prefix);
    this.commonJoins(queryBuilder, "Receivable", prefix);
  }

  private innerJoinCategorization<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: RootField,
    prefix = "",
  ) {
    const categorizationAlias = `${prefix}Categorization`;

    queryBuilder.innerJoin(
      `${rootField}.categorization`,
      `${categorizationAlias}`,
    );
  }

  private leftJoinCategorization<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: RootField,
    prefix = "",
  ) {
    const categorizationAlias = `${prefix}Categorization`;

    queryBuilder.leftJoin(
      `${rootField}.categorization`,
      `${categorizationAlias}`,
    );
  }

  private commonJoins<T>(
    queryBuilder: SelectQueryBuilder<T>,
    rootField: Omit<RootField, "CardMovimentation">,
    prefix = "",
  ) {
    const installmentAlias = `${prefix}Installment`;
    const reconciliationAlias = `${prefix}Reconciliation`;

    queryBuilder
      .leftJoin(
        `${rootField}.installments`,
        installmentAlias,
        `${installmentAlias}.type = :t`,
      )
      .leftJoin(`${installmentAlias}.bankReconciliation`, reconciliationAlias)
      .leftJoin(`${reconciliationAlias}.recordApi`, `${prefix}Appointment`);

    this.commonCategorizationJoins(queryBuilder, prefix);
  }

  private commonCategorizationJoins<T>(
    queryBuilder: SelectQueryBuilder<T>,
    prefix = "",
  ) {
    const categorizationAlias = `${prefix}Categorization`;
    queryBuilder
      .leftJoin(`${categorizationAlias}.costCenter`, `${prefix}CostCenter`)
      .leftJoin(
        `${categorizationAlias}.costCenterCategory`,
        `${prefix}Category`,
      )
      .leftJoin(
        `${categorizationAlias}.costCenterSubCategory`,
        `${prefix}SubCategory`,
      );
  }

  private applyFiltersContracts<T>(
    queryBuilder: SelectQueryBuilder<T>,
    params: Omit<OmmitedGeneralReportParams, "columns" | "reportType">,
    reportType: ReportType,
  ) {
    if (reportType === ReportType.PAYABLE) {
      this.applyFilters(queryBuilder, params, queryFieldsContractsP);
      queryBuilder.andWhere("(Contract.financierId IS NULL)");
    } else if (reportType === ReportType.RECEIVABLE) {
      this.applyFilters(queryBuilder, params, queryFieldsContractsR);
      queryBuilder.andWhere(
        "(Contract.supplierId IS NULL AND Contract.collaboratorId IS NULL)",
      );
    } else {
      this.applyFilters(queryBuilder, params, [
        queryFieldsContractsP,
        queryFieldsContractsR,
      ]);
    }
  }

  private applyFiltersAppointments<T>(
    queryBuilder: SelectQueryBuilder<T>,
    reportType: ReportType,
  ) {
    if (reportType === ReportType.PAYABLE) {
      queryBuilder.andWhere("Reconciliation.type = :ct1", {
        ct1: BankReconciliationType.TAX,
      });
    } else if (reportType === ReportType.RECEIVABLE) {
      queryBuilder.andWhere("Reconciliation.type = :ct2", {
        ct2: BankReconciliationType.PROFIT,
      });
    } else {
      queryBuilder.andWhere(
        "Reconciliation.type = :ct1 OR Reconciliation.type = :ct2",
        {
          ct1: BankReconciliationType.TAX,
          ct2: BankReconciliationType.PROFIT,
        },
      );
    }
  }

  private applyFilters<T>(
    queryBuilder: SelectQueryBuilder<T>,
    params: Omit<OmmitedGeneralReportParams, "columns" | "reportType">,
    queryFields: Record<string, string> | Record<string, string>[],
  ) {
    if (Array.isArray(queryFields)) {
      applyGroupedWhereClauses(queryBuilder, params, queryFields);
    } else if (!Array.isArray(queryFields)) {
      applyWhereClauses(queryBuilder, params, queryFields);
    }
  }

  private getColumns(
    entity: ENTITY,
    fields: Array<keyof DEFAULTCOLUMNS>,
    reportType?: ReportType,
  ) {
    const prefixEntity = `${reportType ?? ""}${entity}`;
    const DEFAULT_COLUMNS = [
      columnsConfig.ID[entity] + " AS ID",
      columnsConfig.DATA[entity] + " AS data",
      columnsConfig.E_ID[prefixEntity] + " AS E_ID",
    ];
    const CUSTOM_COLUMNS = {
      NUMERO_CONTRATO:
        (columnsConfig.NUMERO_CONTRATO[entity] ??
          columnsConfig.NUMERO_CONTRATO.DEFAULT) + " AS numero_contrato",
      TIPO: columnsConfig.TIPO[prefixEntity] + " AS tipo",
      CODE: columnsConfig.CODE[prefixEntity] + " AS code",
      VENCIMENTO:
        (columnsConfig.VENCIMENTO[prefixEntity] ??
          columnsConfig.VENCIMENTO.DEFAULT) + " AS vencimento",
      PARCELA:
        (columnsConfig.PARCELA[prefixEntity] ?? columnsConfig.PARCELA.DEFAULT) +
        " AS parcela",
      APONTAMENTO:
        (columnsConfig.APONTAMENTO[prefixEntity] ??
          columnsConfig.APONTAMENTO.DEFAULT) + " AS apontamento",
      FORNECEDOR:
        (columnsConfig.FORNECEDOR[prefixEntity] ??
          columnsConfig.FORNECEDOR.DEFAULT) + " AS fornecedor",
      FINANCIADOR:
        (columnsConfig.FINANCIADOR[prefixEntity] ??
          columnsConfig.FINANCIADOR.DEFAULT) + " AS financiador",
      COLABORADOR:
        (columnsConfig.COLABORADOR[prefixEntity] ??
          columnsConfig.COLABORADOR.DEFAULT) + " AS colaborador",
      CENTRO_CUSTO:
        (columnsConfig.CENTRO_CUSTO[prefixEntity] ??
          columnsConfig.CENTRO_CUSTO.DEFAULT) + " AS centro_custo",
      CATEGORIA:
        (columnsConfig.CATEGORIA[prefixEntity] ??
          columnsConfig.CATEGORIA.DEFAULT) + " AS categoria",
      SUB_CATEGORIA:
        (columnsConfig.SUB_CATEGORIA[prefixEntity] ??
          columnsConfig.SUB_CATEGORIA.DEFAULT) + " AS sub_categoria",
      PIX: columnsConfig.PIX[entity] + " AS pix",
      BANCARY: columnsConfig.BANCARY[entity] + " AS bancary",
    };

    if (fields.length === 0) {
      return Object.values(CUSTOM_COLUMNS).concat(DEFAULT_COLUMNS);
    }

    return fields
      .map((f) => {
        return CUSTOM_COLUMNS[f];
      })
      .concat(DEFAULT_COLUMNS)
      .filter(Boolean);
  }
}
