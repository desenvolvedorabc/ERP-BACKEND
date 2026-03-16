import { Injectable } from "@nestjs/common";
import { IPaginationMeta, Pagination } from "nestjs-typeorm-paginate";
import { paginateData } from "src/common/utils/paginate-data";
import { ContractStatus } from "src/modules/contracts/enums";
import {
  DataSource,
  In,
  Not,
  ObjectLiteral,
  SelectQueryBuilder,
} from "typeorm";
import {
  defaultListPayablesSelect,
  defaultSelectColumnsExportCnabPayables,
  defaultSelectColumnsPayables,
  queryFields,
} from "../constants";
import { CreatePartialPayableDTO } from "../dto/payable/createPartialPayable.dto";
import { CreatePayableDTO } from "../dto/payable/createPayable.dto";
import { PayablePaginateParams } from "../dto/payable/payablePaginateParams.dto";
import { UpdatePayableDTO } from "../dto/payable/updatePayable.dto";
import { Payables } from "../entities/payable.entity";
import { PayableStatus, PaymentType } from "../enums";
import { BaseRepository } from "src/database/typeorm/base-repository";
import { applyWhereClauses } from "src/common/utils/query/query-builder-util";
import { ApprovalsParamsDTO } from "../dto/approvals/ApprovalsParams.dto";

@Injectable()
export class PayablesRepository extends BaseRepository<Payables> {
  constructor(dataSource: DataSource) {
    super(Payables, dataSource);
  }

  async _create(
    data:
      | Omit<CreatePayableDTO, "categorization">
      | Payables
      | CreatePartialPayableDTO,
  ): Promise<Payables> {
    const newPayable = await this.getRepository(Payables).create(data);
    await this.getRepository(Payables).save(newPayable);
    return newPayable;
  }

  async _findById(id: number): Promise<Payables> {
    const queryBuilder =
      this.getRepository(Payables).createQueryBuilder("Payable");

    this.joinTablesForGetOne(queryBuilder);

    return queryBuilder
      .select(defaultSelectColumnsPayables)
      .where("Payable.id = :id", { id })
      .getOne();
  }

  async _findRawByIds(ids: number[]): Promise<Payables[]> {
    return await this.getRepository(Payables).find({ where: { id: In(ids) } });
  }

  async _findByIds(ids: number[]): Promise<Payables[]> {
    return await this.getRepository(Payables)
      .createQueryBuilder("Payables")
      .select(defaultSelectColumnsExportCnabPayables)
      .leftJoin("Payables.account", "Account")
      .leftJoin("Payables.installments", "Installments")
      .leftJoin("Payables.supplier", "Supplier")
      .leftJoin("Payables.collaborator", "Collaborator")
      .leftJoinAndSelect('Payables.contract', 'PayablesContract')
      .leftJoinAndSelect('PayablesContract.collaborator', 'collaborator')
      .leftJoinAndSelect('PayablesContract.supplier', 'supplier')
      .where("Payables.id IN (:...ids)", { ids })
      .andWhere(
        "Payables.payableStatus = :approvedStatus OR Payables.payableStatus = :dueStatus",
        {
          approvedStatus: PayableStatus.APPROVED,
          dueStatus: PayableStatus.DUE,
        },
      )
      .getMany();
  }

  async _update(
    id: number,
    data: UpdatePayableDTO | { payableStatus: PayableStatus },
  ): Promise<void> {
    await this.getRepository(Payables).update(id, data);
  }

  async _updateManyStatus(
    ids: number[],
    data: { payableStatus: PayableStatus },
  ): Promise<void> {
    await this.getRepository(Payables).update({ id: In(ids) }, data);
  }

  async _delete(id: number): Promise<void> {
    await this.getRepository(Payables).delete({ id });
  }

  async _existsById(id: number): Promise<boolean> {
    return await this.getRepository(Payables).exist({ where: { id } });
  }

  async _isPendingOrApprovingOrRejected(id: number): Promise<boolean> {
    return await this.getRepository(Payables).exist({
      where: [
        { id, payableStatus: PayableStatus.PENDING },
        { id, payableStatus: PayableStatus.APPROVING },
        { id, payableStatus: PayableStatus.REJECTED },
      ],
    });
  }

  async _isDistratoOrTermo(id: number): Promise<boolean> {
    return await this.getRepository(Payables).exist({
      where: [
        { id, paymentType: PaymentType.DISTRATO },
        { id, paymentType: PaymentType.TERMO },
      ],
    });
  }

  async _existsByIdentifierCode(
    code: string,
    relatedReceptorId: number,
    id: number = -1,
  ): Promise<boolean> {
    return await this.getRepository(Payables).exist({
      where: [
        { identifierCode: code, id: Not(id), supplierId: relatedReceptorId },
        {
          identifierCode: code,
          id: Not(id),
          collaboratorId: relatedReceptorId,
        },
      ],
    });
  }

  async _isApproved(id: number): Promise<boolean> {
    const { payableStatus } = await this.getRepository(Payables).findOne({
      where: { id },
      select: { payableStatus: true },
    });
    return payableStatus === PayableStatus.APPROVED;
  }

  async _markManyAsOverdue(ids: number[]) {
    await this.getRepository(Payables).update(
      { id: In(ids) },
      { payableStatus: PayableStatus.DUE },
    );
  }

  async _findAll(
    params: PayablePaginateParams,
  ): Promise<Pagination<Payables, IPaginationMeta>> {
    const queryBuilder =
      this.getRepository(Payables).createQueryBuilder("Payable");
    this.joinBaseTables(queryBuilder);
    this.selectFields(queryBuilder, defaultListPayablesSelect);
    this.applyFilters(queryBuilder, params);

    const data = await paginateData(params.page, params.limit, queryBuilder);

    return data;
  }

  async _findAllForApprovals(
    params: ApprovalsParamsDTO,
  ): Promise<Pagination<Payables, IPaginationMeta>> {
    const queryBuilder =
      this.getRepository(Payables).createQueryBuilder("Payable");
    this.selectFields(queryBuilder, defaultListPayablesSelect);
    this.joinBaseTables(queryBuilder);
    this.applyFiltersForApprovals(queryBuilder, params);

    const data = await paginateData(params.page, params.limit, queryBuilder);

    return data;
  }

  async _findAllForMassApproval(
    params: ApprovalsParamsDTO,
  ): Promise<Pagination<Payables, IPaginationMeta>> {
    const queryBuilder =
      this.getRepository(Payables).createQueryBuilder("Payable");
    this.selectFields(queryBuilder, defaultListPayablesSelect);
    this.joinBaseTables(queryBuilder);
    
    queryBuilder.where("Payable.payableStatus = 'EM APROVAÇÃO'");

    const data = await paginateData(params.page, params.limit, queryBuilder);

    return data;
  }

  async _findAllForCollaboratorApprovals(
    params: ApprovalsParamsDTO,
    collaboratorId: number,
  ): Promise<Pagination<Payables, IPaginationMeta>> {
    const queryBuilder =
      this.getRepository(Payables).createQueryBuilder("Payable");
    this.selectFields(queryBuilder, defaultListPayablesSelect);
    this.joinBaseTables(queryBuilder);
    
    queryBuilder.where(
      "Payable.payableStatus = 'EM APROVAÇÃO' AND Approvals.collaboratorId = :collaboratorId",
      { collaboratorId }
    );

    const data = await paginateData(params.page, params.limit, queryBuilder);

    return data;
  }

  async _findAndSelectAllForCSV(
    params: PayablePaginateParams,
  ): Promise<Payables[]> {
    const queryBuilder =
      this.getRepository(Payables).createQueryBuilder("Payable");

    const filteredDefaultSelect = defaultListPayablesSelect.filter(
      (p) => !p.startsWith("Payable"),
    );
    filteredDefaultSelect.push(
      "Payable",
      "Program.name",
      "BudgetPlan.scenarioName",
      "BudgetPlan.year",
      "BudgetPlan.version",
      "Account.name",
    );

    this.selectFields(queryBuilder, filteredDefaultSelect);
    this.joinBaseTables(queryBuilder);
    this.joinsForCSV(queryBuilder);
    this.applyFilters(queryBuilder, params);

    return queryBuilder.getMany();
  }

  private joinBaseTables<T>(
    queryBuilder: SelectQueryBuilder<T>,
    conditionsContracts?: string,
    parametersContracts?: ObjectLiteral,
  ) {
    queryBuilder
      .leftJoin("Payable.supplier", "Supplier")
      .leftJoin("Payable.collaborator", "Collaborator")
      .leftJoin("Payable.approvals", "Approvals")
      .leftJoin("Approvals.user", "User")
      .leftJoin("Payable.categorization", "Categorization")
      .leftJoin("Categorization.costCenter", "CostCenter")
      .leftJoin("Categorization.costCenterCategory", "CostCenterCategory")
      .leftJoin("Categorization.costCenterSubCategory", "CostCenterSubCategory")
      .leftJoin("Payable.installments", "Installment")
      .leftJoin(
        "Payable.contract",
        "Contract",
        conditionsContracts,
        parametersContracts,
      );
  }

  private joinTablesForGetOne<T>(queryBuilder: SelectQueryBuilder<T>) {
    this.joinBaseTables(
      queryBuilder,
      "Contract.contractStatus != :status1 AND Contract.contractStatus != :status2",
      {
        status1: ContractStatus.FINISHED,
        status2: ContractStatus.PENDING,
      },
    );
    this.joinsForSupplier(queryBuilder);
    this.joinsForCollaborator(queryBuilder);
    queryBuilder
      .leftJoin("Payable.files", "Files")
      .leftJoin("Categorization.budgetPlan", "BudgetPlan")
      .leftJoin("Categorization.program", "Program")
      .leftJoin("Approvals.collaborator", "ApprovalsCollaborators")
      .leftJoin("Approvals.user", "ApprovalsUser")
      .leftJoin("Contract.program", "ContractProgram")
      .leftJoin("Contract.budgetPlan", "ContractBudgetPlan");
  }

  private joinsForCollaborator<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder
      .leftJoin(
        "Collaborator.contracts",
        "CollaboratorContracts",
        "CollaboratorContracts.contractStatus = :sStatus OR CollaboratorContracts.contractStatus = :ogStatus",
        {
          sStatus: ContractStatus.SIGNED,
          ogStatus: ContractStatus.ONGOING,
        },
      )
      .leftJoin("CollaboratorContracts.payable", "CollaboratorContractsP")
      .leftJoin("CollaboratorContracts.receivable", "CollaboratorContractsR");
  }

  private joinsForSupplier<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder
      .leftJoin(
        "Supplier.contracts",
        "SupplierContracts",
        "SupplierContracts.contractStatus = :sStatus OR SupplierContracts.contractStatus = :ogStatus",
        {
          sStatus: ContractStatus.SIGNED,
          ogStatus: ContractStatus.ONGOING,
        },
      )
      .leftJoin("SupplierContracts.payable", "SupplierContractsP")
      .leftJoin("SupplierContracts.receivable", "SupplierContractsR");
  }

  private joinsForCSV<T>(queryBuilder: SelectQueryBuilder<T>) {
    queryBuilder
      .leftJoin("Categorization.program", "Program")
      .leftJoin("Categorization.budgetPlan", "BudgetPlan")
      .leftJoin("Payable.account", "Account");
  }

  private applyFilters<T>(
    queryBuilder: SelectQueryBuilder<T>,
    params: PayablePaginateParams,
  ) {
    const { search, ...payableOptions } = params;
    if (search) {
      const numericSearch = search.replace(/\D/g, "");
      if (numericSearch) {
        queryBuilder.where(
          "(Supplier.name LIKE :q OR Supplier.cnpj LIKE :d) OR (Collaborator.name LIKE :q OR Collaborator.cpf LIKE :d)",
          {
            q: `%${search}%`,
            d: numericSearch.concat("%"),
          },
        );
      } else {
        queryBuilder.where(
          "(Supplier.name LIKE :q) OR (Collaborator.name LIKE :q)",
          {
            q: `%${search}%`,
          },
        );
      }
    }
    if (payableOptions) {
      applyWhereClauses(queryBuilder, payableOptions, queryFields);
    }
  }

  private applyFiltersForApprovals<T>(
    queryBuilder: SelectQueryBuilder<T>,
    params: ApprovalsParamsDTO,
  ) {
    queryBuilder.where(
      "Payable.payableStatus = 'EM APROVAÇÃO' AND Approvals.userId = :id",
      {
        id: params.userId,
      },
    );
  }

  private selectFields<T>(
    queryBuilder: SelectQueryBuilder<T>,
    defaultSelected: string[],
  ) {
    queryBuilder.select(defaultSelected).addOrderBy("Payable.id", "DESC");
  }
}
