import { Injectable } from "@nestjs/common";
import { addDays, endOfDay } from "date-fns";
import { IPaginationMeta, Pagination } from "nestjs-typeorm-paginate";
import {
  DataSource,
  IsNull,
  LessThanOrEqual,
  Not,
  SelectQueryBuilder,
} from "typeorm";
import {
  defaultChildSelectedFields,
  defaultListContractsSelect,
  defaultSelectColumnsContracts,
  queryFields,
} from "../constants";
import { CreateContractDTO } from "../dto/createContract.dto";
import { ContractPaginateParams } from "../dto/paginateParamsContract.dto";
import { UpdateContractDTO } from "../dto/UpdateContract.dto";
import { Contracts } from "../entities/contracts.entity";
import { ContractStatus, ContractType } from "./../enums/index";
import { BaseRepository } from "src/database/typeorm/base-repository";
import { applyWhereClauses } from "src/common/utils/query/query-builder-util";
import { InstallmentStatus } from "src/modules/installments/enum";

@Injectable()
export class ContractsRepository extends BaseRepository<Contracts> {
  constructor(dataSource: DataSource) {
    super(Contracts, dataSource);
  }

  async _create(
    data: CreateContractDTO,
    contractCode: string,
  ): Promise<number> {
    const repo = this.getRepository(Contracts);
    const newContract = await repo.create({ ...data, contractCode });
    await repo.save(newContract);
    return newContract.id;
  }

  async _findById(id: number): Promise<Contracts> {
    return await this.getRepository(Contracts).findOne({
      where: { id },
      relations: {
        files: true,
        budgetPlan: true,
        financier: true,
        supplier: true,
        contractPeriod: true,
        payable: true,
        receivable: true,
        collaborator: true,
        historys: true,
        children: {
          files: true,
          budgetPlan: true,
          financier: true,
          collaborator: true,
          supplier: true,
          contractPeriod: true,
          payable: true,
          receivable: true,
          historys: true,
          program: true,
        },
        program: true,
      },
      select: {
        ...defaultSelectColumnsContracts,
        children: { ...defaultSelectColumnsContracts, parentId: true },
      },
      order: {
        children: {
          createdAt: "desc",
        },
      },
    });
  }

  async _findFullOne(id: number): Promise<Contracts> {
    return await this.getRepository(Contracts)
      .createQueryBuilder("contract")
      .leftJoinAndSelect("contract.payable", "payable")
      .leftJoinAndSelect("payable.installments", "payableInstallments")
      .leftJoinAndSelect("contract.receivable", "receivable")
      .leftJoinAndSelect("receivable.installments", "receivableInstallments")
      .where("contract.id = :id", { id })
      .getOne();
  }

  async _findPaymentHistory(id: number): Promise<Contracts> {
    return await this.getRepository(Contracts).findOne({
      where: { id },
      relations: {
        payable: {
          installments: true,
        },
        receivable: {
          installments: true,
        },
        historys: {
          user: true,
        },
      },
      select: {
        id: true,
        contractCode: true,
        payable: {
          id: true,
          paymentType: true,
          installments: true,
        },
        receivable: {
          id: true,
          receivableType: true,
          installments: true,
        },
        historys: {
          id: true,
          actionType: true,
          user: {
            id: true,
            name: true,
            email: true,
          },
          createdAt: true,
          updatedAt: true,
        },
      },
    });
  }

  async _findAll(params: ContractPaginateParams) {
    const queryBuilder = this.getRepository(Contracts)
      .createQueryBuilder("Contracts")
      .andWhere("Contracts.parentId IS NULL");

    this.applySelect(
      queryBuilder,
      defaultListContractsSelect.concat(defaultChildSelectedFields),
    );
    this.applyContractJoins(queryBuilder);
    this.applyChildrenJoins(queryBuilder);
    this.applyOrderBy(queryBuilder);
    this.applyFilters(queryBuilder, params);

    return await this.paginateContracts(queryBuilder, params);
  }

  async _findForCSV(params: ContractPaginateParams) {
    const queryBuilder = this.getRepository(Contracts)
      .createQueryBuilder("Contracts")
      .distinct(true);

    this.applySelect(queryBuilder, defaultListContractsSelect);
    this.applyContractJoins(queryBuilder);
    this.applyOrderBy(queryBuilder);
    this.applyFilters(queryBuilder, params);

    queryBuilder
      .leftJoin("Contracts.parent", "Parent")
      .addSelect("Parent.contractCode");

    return await queryBuilder.getRawMany();
  }

  async _update(
    id: number,
    data: UpdateContractDTO | { contractStatus: ContractStatus },
  ): Promise<void> {
    await this.getRepository(Contracts).save({ id, ...data });
  }

  async _uploadSignedContract(
    id: number,
    fileUrl: string,
    status: ContractStatus,
  ): Promise<void> {
    await this.getRepository(Contracts).update(id, {
      signedContractUrl: fileUrl,
      contractStatus: status,
    });
  }

  async _uploadSettledTerm(id: number, fileUrl: string): Promise<void> {
    await this.getRepository(Contracts).update(id, {
      settleTermUrl: fileUrl,
      contractStatus: ContractStatus.FINISHED,
    });
  }

  async _uploadWithdrawal(id: number, fileUrl: string): Promise<void> {
    try {
      await this.getRepository(Contracts).update(id, {
        withdrawalUrl: fileUrl,
        contractStatus: ContractStatus.FINISHED,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async _delete(id: number): Promise<void> {
    await this.getRepository(Contracts).delete({ id });
  }

  async _existsById(id: number): Promise<boolean> {
    return await this.getRepository(Contracts).exist({ where: { id } });
  }

  async _existsByContractCode(code: string, id: number = -1): Promise<boolean> {
    return await this.getRepository(Contracts).exist({
      where: { contractCode: code, id: Not(id) },
    });
  }

  async _isAditive(id: number): Promise<boolean> {
    return await this.getRepository(Contracts).exist({
      where: { parentId: Not(IsNull()), id },
    });
  }

  async _finishAllExpiredContracts(): Promise<number> {
    const result = await this.getRepository(Contracts).update(
      {
        contractPeriod: {
          end: LessThanOrEqual(endOfDay(addDays(new Date(), -7))),
        },
        contractStatus: Not(ContractStatus.FINISHED),
      },
      {
        contractStatus: ContractStatus.FINISHED,
      },
    );

    return result.affected;
  }

  async _initContractsVigency(): Promise<number> {
    const result = await this.getRepository(Contracts).update(
      {
        contractPeriod: {
          start: LessThanOrEqual(endOfDay(new Date())),
        },
        contractStatus: ContractStatus.SIGNED,
      },
      {
        contractStatus: ContractStatus.ONGOING,
      },
    );

    return result.affected;
  }

  async _findLastContractCode(contractType: ContractType): Promise<string> {
    const contract = await this.getRepository(Contracts).findOne({
      where: { contractType, parentId: IsNull() },
      order: { id: "DESC" },
      select: { contractCode: true },
    });

    return contract?.contractCode;
  }

  async _findLastAditiveCode(parentId: number): Promise<string | null> {
    const contract = await this.getRepository(Contracts).findOne({
      where: { parentId },
      order: { id: "DESC" },
      select: { contractCode: true },
    });

    return contract?.contractCode;
  }

  private applyContractJoins(queryBuilder: SelectQueryBuilder<Contracts>) {
    queryBuilder
      .leftJoin("Contracts.financier", "Financier")
      .leftJoin("Contracts.supplier", "Supplier")
      .leftJoin("Contracts.collaborator", "Collaborator")
      .leftJoin("Contracts.budgetPlan", "BudgetPlan")
      .leftJoin("Contracts.program", "Program")
      .leftJoin("Contracts.payable", "Payable")
      .leftJoin("Contracts.receivable", "Receivable");
  }

  private applyChildrenJoins(queryBuilder: SelectQueryBuilder<Contracts>) {
    queryBuilder
      .leftJoin("Contracts.children", "Children")
      .leftJoin("Children.financier", "Children_Financier")
      .leftJoin("Children.supplier", "Children_Supplier")
      .leftJoin("Children.collaborator", "Children_Collaborator")
      .leftJoin("Children.budgetPlan", "Children_BudgetPlan")
      .leftJoin("Children.program", "Children_program");
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Contracts>,
    { search, contractPeriod, ...contractsOptions }: ContractPaginateParams,
  ) {
    if (search) {
      const numericSearch = search.replace(/\D/g, "");
      if (numericSearch) {
        queryBuilder.where(
          "(Financier.name LIKE :q OR Financier.cnpj LIKE :d) OR (Supplier.name LIKE :q OR Supplier.cnpj LIKE :d) OR (Collaborator.name LIKE :q OR Collaborator.cpf LIKE :d)",
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

    if (contractPeriod) {
      queryBuilder.andWhere(
        "Contracts.contractPeriodStart >= :pStart AND Contracts.contractPeriodEnd <= :pEnd",
        { pStart: contractPeriod.start, pEnd: contractPeriod.end },
      );
    }

    if (contractsOptions) {
      applyWhereClauses(queryBuilder, contractsOptions, queryFields);
    }
  }

  private applyOrderBy(queryBuilder: SelectQueryBuilder<Contracts>) {
    queryBuilder.orderBy("Contracts.id", "DESC");
  }

  private applySelect(
    queryBuilder: SelectQueryBuilder<Contracts>,
    selectOptions: Array<string>,
  ) {
    queryBuilder.select(selectOptions).setParameters({
      type: ContractType.FINANCIER,
      iStatus: [InstallmentStatus.OVERDUE, InstallmentStatus.PENDING],
    });
  }

  private async paginateContracts<T>(
    queryBuilder: SelectQueryBuilder<T>,
    { limit, page }: ContractPaginateParams,
  ): Promise<Pagination<Contracts & { pending: number }, IPaginationMeta>> {
    const count = await queryBuilder.getCount();
    const rawResults = await queryBuilder
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();

    type ContractWithPending = Contracts & { pending: number };

    const contractsMap = new Map<number, ContractWithPending>();

    const createContractFromRaw = (result: any): ContractWithPending =>
      ({
        id: result.Contracts_id,
        agreement: result.Contracts_agreement,
        createdAt: result.Contracts_createdAt,
        updatedAt: result.Contracts_updatedAt,
        contractType: result.Contracts_contractType,
        contractCode: result.Contracts_contractCode,
        object: result.Contracts_object,
        contractPeriod: {
          start: result.Contracts_contractPeriodStart,
          end: result.Contracts_contractPeriodEnd,
          isIndefinite: result.Contracts_contractPeriodIsIndefinite,
        },
        totalValue: result.Contracts_totalValue,
        contractStatus: result.Contracts_contractStatus,
        signedContractUrl: result.Contracts_signedContractUrl,
        settleTermUrl: result.Contracts_settleTermUrl,
        withdrawalUrl: result.Contracts_withdrawalUrl,
        financier: result.Financier_id
          ? {
              id: result.Financier_id,
              name: result.Financier_name,
            }
          : null,
        supplier: result.Supplier_id
          ? {
              id: result.Supplier_id,
              name: result.Supplier_name,
            }
          : null,
        collaborator: result.Collaborator_id
          ? {
              id: result.Collaborator_id,
              name: result.Collaborator_name,
            }
          : null,
        budgetPlan: result.BudgetPlan_id
          ? {
              id: result.BudgetPlan_id,
              scenarioName: result.BudgetPlan_scenarioName,
              year: result.BudgetPlan_year,
              version: result.BudgetPlan_version,
            }
          : null,
        program: result.Program_id
          ? {
              id: result.Program_id,
              name: result.Program_name,
            }
          : null,
        children: [],
        pending: result.pending,
      }) as ContractWithPending;

    const createChildFromRaw = (result: any): ContractWithPending =>
      ({
        id: result.Children_id,
        contractCode: result.Children_contractCode,
        createdAt: result.Children_createdAt,
        updatedAt: result.Children_updatedAt,
        contractType: result.Children_contractType,
        contractModel: result.Children_contractModel,
        contractStatus: result.Children_contractStatus,
        financier: result.Children_Financier_id
          ? {
              id: result.Children_Financier_id,
              name: result.Children_Financier_name,
            }
          : null,
        supplier: result.Children_Supplier_id
          ? {
              id: result.Children_Supplier_id,
              name: result.Children_Supplier_name,
            }
          : null,
        collaborator: result.Children_Collaborator_id
          ? {
              id: result.Children_Collaborator_id,
              name: result.Children_Collaborator_name,
            }
          : null,
        budgetPlan: result.Children_BudgetPlan_id
          ? {
              id: result.Children_BudgetPlan_id,
              scenarioName: result.Children_BudgetPlan_scenarioName,
              year: result.Children_BudgetPlan_year,
              version: result.Children_BudgetPlan_version,
            }
          : null,
        object: result.Children_object,
        contractPeriod: {
          start: result.Children_contractPeriodstart,
          end: result.Children_contractPeriodend,
          isIndefinite: result.Children_contractPeriodIsIndefinite,
        },
        totalValue: result.Children_totalValue,
        signedContractUrl: result.Children_signedContractUrl,
        settleTermUrl: result.Children_settleTermUrl,
        withdrawalUrl: result.Children_withdrawalUrl,
        pending: result.Children_pending,
      }) as ContractWithPending;

    for (const result of rawResults) {
      const contractId = result.Contracts_id;

      let contract = contractsMap.get(contractId);
      if (!contract) {
        contract = createContractFromRaw(result);
        contractsMap.set(contractId, contract);
      }

      if (result.Children_id) {
        contract.children.push(createChildFromRaw(result));
      }
    }

    const contracts = Array.from(contractsMap.values());

    return {
      items: contracts,
      meta: {
        currentPage: page,
        itemCount: contracts.length,
        itemsPerPage: limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}
