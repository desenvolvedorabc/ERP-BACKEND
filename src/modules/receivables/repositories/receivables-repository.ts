import { Injectable } from "@nestjs/common";
import { IPaginationMeta, Pagination } from "nestjs-typeorm-paginate";
import { paginateData } from "src/common/utils/paginate-data";
import { ContractStatus } from "src/modules/contracts/enums";
import { DataSource, In, Not, SelectQueryBuilder } from "typeorm";
import {
  defaultListReceivablesSelect,
  defaultSelectColumnsReceivable,
  queryFields,
} from "../constants";
import { CreatePartialReceivableDTO } from "../dto/createPartialReceivable.dto";
import { CreateReceivableDTO } from "../dto/createReceivable.dto";
import { ReceivablesPaginateParams } from "../dto/receivablePaginateParams.dto";
import { UpdateReceivableDTO } from "../dto/updateReceivable.dto";
import { Receivables } from "../entities/receivables.entity";
import { ReceivableStatus } from "../enums";
import { BaseRepository } from "src/database/typeorm/base-repository";
import { applyWhereClauses } from "src/common/utils/query/query-builder-util";

@Injectable()
export class ReceivablesRepository extends BaseRepository<Receivables> {
  constructor(dataSource: DataSource) {
    super(Receivables, dataSource);
  }

  async _create(
    data:
      | Omit<CreateReceivableDTO, "categorization">
      | Receivables
      | CreatePartialReceivableDTO,
  ): Promise<Receivables> {
    const newPayable = await this.getRepository(Receivables).create(data);
    await this.getRepository(Receivables).save(newPayable);
    return newPayable;
  }

  async _findById(id: number): Promise<Receivables> {
    const queryBuilder =
      await this.getRepository(Receivables).createQueryBuilder("Receivable");

    this.joinsForFindOne(queryBuilder);

    return queryBuilder
      .select(defaultSelectColumnsReceivable)
      .where("Receivable.id = :id", { id })
      .getOne();
  }

  async _update(
    id: number,
    data: UpdateReceivableDTO | { receivableStatus: ReceivableStatus },
  ): Promise<void> {
    await this.getRepository(Receivables)
      .createQueryBuilder()
      .update(Receivables)
      .set(data)
      .where("id = :id", { id })
      .execute();
  }

  async _delete(id: number): Promise<void> {
    await this.getRepository(Receivables).delete({ id });
  }

  async _markManyAsOverdue(ids: number[]) {
    return await this.getRepository(Receivables).update(
      { id: In(ids) },
      { receivableStatus: ReceivableStatus.DUE },
    );
  }

  async _existsByIdentifierCode(
    code: string,
    financierId: number = -1,
    id: number = -1,
  ): Promise<boolean> {
    return await this.getRepository(Receivables).exist({
      where: { identifierCode: code, id: Not(id), financierId },
    });
  }

  async _findAll(
    params: ReceivablesPaginateParams,
  ): Promise<Pagination<Receivables, IPaginationMeta>> {
    const queryBuilder =
      this.getRepository(Receivables).createQueryBuilder("Receivable");
    this.selectFields(queryBuilder, defaultListReceivablesSelect);
    this.joinBaseTables(queryBuilder);
    this.applyFilters(queryBuilder, params);

    const data = await paginateData(params.page, params.limit, queryBuilder);

    return data;
  }

  async _findAndSelectAllForCSV(
    params: ReceivablesPaginateParams,
  ): Promise<Receivables[]> {
    const queryBuilder =
      this.getRepository(Receivables).createQueryBuilder("Receivable");

    const filteredDefaultSelect = defaultListReceivablesSelect.filter(
      (p) => !p.startsWith("Receivable"),
    );
    filteredDefaultSelect.push(
      "Receivable",
      "Program.name",
      "BudgetPlan.scenarioName",
      "BudgetPlan.year",
      "BudgetPlan.version",
      "Contract.contractCode",
      "Account.name",
    );

    this.selectFields(queryBuilder, filteredDefaultSelect);
    this.joinBaseTables(queryBuilder);
    this.joinsForCSV(queryBuilder);
    this.applyFilters(queryBuilder, params);

    return queryBuilder.getMany();
  }

  private joinBaseTables<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder
      .leftJoin("Receivable.financier", "Financier")
      .leftJoin("Receivable.categorization", "Categorization")
      .leftJoin("Categorization.costCenter", "CostCenter")
      .leftJoin("Categorization.costCenterCategory", "CostCenterCategory")
      .leftJoin("Categorization.costCenterSubCategory", "CostCenterSubCategory")
      .leftJoin("Receivable.installments", "Installments");
  }

  private joinsForFindOne<T>(queryBuilder: SelectQueryBuilder<T>) {
    this.joinBaseTables(queryBuilder);
    this.joinFinanciers(queryBuilder);
    this.joinContracts(queryBuilder);
    queryBuilder
      .leftJoin("Receivable.files", "Files")
      .leftJoin("Categorization.budgetPlan", "BudgetPlan")
      .leftJoin("Categorization.program", "Program");
  }

  private joinFinanciers<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder
      .leftJoin(
        "Financier.contracts",
        "FinancierContracts",
        "FinancierContracts.contractStatus = :sStatus OR FinancierContracts.contractStatus = :ogStatus",
        {
          sStatus: ContractStatus.SIGNED,
          ogStatus: ContractStatus.ONGOING,
        },
      )
      .leftJoin("FinancierContracts.payable", "FinancierContractsP")
      .leftJoin("FinancierContracts.receivable", "FinancierContractsR");
  }

  private joinContracts<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder
      .leftJoin(
        "Receivable.contract",
        "ReceivableContract",
        "ReceivableContract.contractStatus != :status1 AND ReceivableContract.contractStatus != :status2",
        { status1: ContractStatus.FINISHED, status2: ContractStatus.PENDING },
      )
      .leftJoin("ReceivableContract.financier", "ReceivableContractFinancier")
      .leftJoin(
        "ReceivableContract.budgetPlan",
        "ReceivableContractBudgetPlan",
      );
  }

  private joinsForCSV<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder
      .leftJoin("Receivable.contract", "Contract")
      .leftJoin("Categorization.program", "Program")
      .leftJoin("Categorization.budgetPlan", "BudgetPlan")
      .leftJoin("Receivable.account", "Account");
  }

  private applyFilters<T>(
    queryBuilder: SelectQueryBuilder<T>,
    params: ReceivablesPaginateParams,
  ) {
    const { search, ...receivableOptions } = params;
    if (search) {
      const numericSearch = search.replace(/\D/g, "");
      if (numericSearch) {
        queryBuilder.where(
          "(Financier.name LIKE :q OR Financier.cnpj LIKE :d)",
          {
            q: `%${search}%`,
            d: numericSearch.concat("%"),
          },
        );
      } else {
        queryBuilder.where("(Financier.name LIKE :q )", {
          q: `%${search}%`,
        });
      }
    }

    if (receivableOptions) {
      applyWhereClauses(queryBuilder, receivableOptions, queryFields);
    }
  }

  private selectFields<T>(
    queryBuilder: SelectQueryBuilder<T>,
    defaultSelected: string[],
  ) {
    queryBuilder.select(defaultSelected).addOrderBy("Receivable.id", "DESC");
  }
}
