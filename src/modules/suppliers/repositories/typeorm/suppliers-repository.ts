import { Injectable } from "@nestjs/common";
import { paginateData } from "src/common/utils/paginate-data";
import { ContractStatus } from "src/modules/contracts/enums";
import { DataSource } from "typeorm";
import { CreateSupplierDto } from "../../dto/create-supplier.dto";
import { PaginateSuppliersParams } from "../../dto/paginate-suppliers-params.dto";
import { Supplier } from "../../entities/supplier.entity";
import { defaultSelectColumnsSupplier } from "../consts";
import { BaseRepository } from "src/database/typeorm/base-repository";
import { GenericOptions } from "src/common/DTOs/options.dto";
import { maskCNPJ } from "src/common/utils/masks";

export interface ResponseSupplier {
  supplier: Supplier | null;
}

@Injectable()
export class SuppliersRepository extends BaseRepository<Supplier> {
  constructor(dataSource: DataSource) {
    super(Supplier, dataSource);
  }

  async _create(createSupplierDto: CreateSupplierDto): Promise<void> {
    const {
      name,
      email,
      cnpj,
      corporateName,
      fantasyName,
      serviceCategory,
      commentEvaluation,
      serviceEvaluation,
      pixInfo,
      bancaryInfo,
    } = createSupplierDto;

    const supplier = this.getRepository(Supplier).create({
      name,
      email,
      cnpj,
      corporateName,
      fantasyName,
      serviceCategory,
      commentEvaluation,
      serviceEvaluation,
      pixInfo,
      bancaryInfo,
    });

    await this.getRepository(Supplier).save(supplier);
  }

  async _findOneById(id: number): Promise<ResponseSupplier> {
    const supplier = await this.getRepository(Supplier).findOne({
      where: {
        id,
      },
    });

    return {
      supplier,
    };
  }

  async _findOneByCnpj(cnpj: string): Promise<ResponseSupplier> {
    const supplier = await this.getRepository(Supplier).findOne({
      where: {
        cnpj,
      },
    });

    return {
      supplier,
    };
  }

  async _findAll(
    { page, limit, search, active, order, categories }: PaginateSuppliersParams,
    isCsv = false,
  ) {
    const queryBuilder = this.getRepository(Supplier)
      .createQueryBuilder("Suppliers")
      .orderBy("Suppliers.name", order);

    if (!isCsv) {
      queryBuilder.select([
        "Suppliers.id",
        "Suppliers.name",
        "Suppliers.email",
        "Suppliers.cnpj",
        "Suppliers.active",
      ]);
    }

    if (search) {
      queryBuilder.andWhere(
        "Suppliers.name LIKE :q OR Suppliers.cnpj LIKE :q",
        {
          q: `%${search}%`,
        },
      );
    }

    if (active !== null) {
      queryBuilder.andWhere("Suppliers.active = :active", { active });
    }

    if (categories?.length) {
      queryBuilder.andWhere("Suppliers.serviceCategory IN(:...categories)", {
        categories,
      });
    }

    if (isCsv) {
      const items = await queryBuilder.getMany();

      return {
        items,
      };
    }

    const data = await paginateData(page, limit, queryBuilder);

    return data;
  }

  async _findOneByNameOrCNPJ(nameOrCNPJ: string): Promise<Supplier> {
    return await this.getRepository(Supplier)
      .createQueryBuilder("Suppliers")
      .leftJoin(
        "Suppliers.contracts",
        "Contracts",
        "Contracts.contractStatus = :sStatus OR Contracts.contractStatus = :ogStatus",
        {
          sStatus: ContractStatus.SIGNED,
          ogStatus: ContractStatus.ONGOING,
        },
      )
      .leftJoin("Contracts.budgetPlan", "Contracts_BudgetPlan")
      .leftJoin("Contracts.supplier", "Contracts_Supplier")
      .leftJoin("Contracts.collaborator", "Contracts_Collaborator")
      .leftJoin("Contracts.payable", "Payable")
      .leftJoin("Contracts.program", "Program")
      .select(defaultSelectColumnsSupplier)
      .where("Suppliers.name LIKE :q OR Suppliers.cnpj LIKE :q", {
        q: `%${nameOrCNPJ}%`,
      })
      .andWhere("Suppliers.active = true")
      .getOne();
  }

  async _update(id: number, data: Partial<Supplier>): Promise<void> {
    await this.getRepository(Supplier).update(id, data);
  }

  async _getOptions(): Promise<GenericOptions[]> {
    const suppliers = await this.getRepository(Supplier).find({
      where: {
        active: true,
      },
      select: {
        id: true,
        cnpj: true,
        name: true,
      },
    });

    return suppliers?.map((supplier) => ({
      id: supplier.id,
      name: `${supplier?.name} - ${maskCNPJ(supplier?.cnpj)}`,
    }));
  }

  async _findBradesco() {
    return await this.getRepository(Supplier).findOne({
      where: { cnpj: "60746948000112" },
      select: { id: true },
    });
  }
}
