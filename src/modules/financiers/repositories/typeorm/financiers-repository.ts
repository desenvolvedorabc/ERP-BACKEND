import { Injectable } from "@nestjs/common";
import { paginateData } from "src/common/utils/paginate-data";
import { PaginateParams } from "src/common/utils/paginate-params.dto";
import { DataSource } from "typeorm";
import { CreateFinancierDto } from "../../dto/create-financier.dto";
import { Financier } from "../../entities/financier.entity";
import { defaultSelectColumnsFinancier } from "../consts";
import { BaseRepository } from "src/database/typeorm/base-repository";
import { GenericOptions } from "src/common/DTOs/options.dto";
import { ContractStatus } from "src/modules/contracts/enums";
import { maskCNPJ } from "src/common/utils/masks";

export interface ResponseFinancier {
  financier: Financier | null;
}

@Injectable()
export class FinanciersRepository extends BaseRepository<Financier> {
  constructor(dataSource: DataSource) {
    super(Financier, dataSource);
  }

  async _create(createFinancierDto: CreateFinancierDto): Promise<void> {
    const {
      name,
      cnpj,
      corporateName,
      legalRepresentative,
      address,
      telephone,
    } = createFinancierDto;

    const financier = await this.getRepository(Financier).create({
      name,
      cnpj,
      corporateName,
      legalRepresentative,
      address,
      telephone,
    });

    await this.getRepository(Financier).save(financier);
  }

  async _findOneById(id: number): Promise<ResponseFinancier> {
    const financier = await this.getRepository(Financier).findOne({
      where: {
        id,
      },
    });

    return {
      financier,
    };
  }

  async _findOneByCnpj(cnpj: string): Promise<ResponseFinancier> {
    const financier = await this.getRepository(Financier).findOne({
      where: {
        cnpj,
      },
    });

    return {
      financier,
    };
  }

  async _findAll({ page, limit, search, order }: PaginateParams) {
    const queryBuilder = this.getRepository(Financier)
      .createQueryBuilder("Financiers")
      .select([
        "Financiers.id",
        "Financiers.name",
        "Financiers.legalRepresentative",
        "Financiers.cnpj",
        "Financiers.active",
      ])
      .orderBy("Financiers.name", order);

    if (search) {
      queryBuilder.andWhere("Financiers.name LIKE :q", { q: `%${search}%` });
    }

    const data = await paginateData(page, limit, queryBuilder);

    return data;
  }

  async _update(id: number, data: Partial<Financier>) {
    await this.getRepository(Financier).update(id, data);
  }

  async _findOneByNameOrCNPJ(nameOrCNPJ: string): Promise<Financier> {
    return await this.getRepository(Financier)
      .createQueryBuilder("Financier")
      .leftJoin(
        "Financier.contracts",
        "Contracts",
        "Contracts.contractStatus = :sStatus OR Contracts.contractStatus = :ogStatus",
        {
          sStatus: ContractStatus.SIGNED,
          ogStatus: ContractStatus.ONGOING,
        },
      )
      .leftJoin("Contracts.budgetPlan", "Contracts_BudgetPlan")
      .leftJoin("Contracts.financier", "Contracts_Financier")
      .leftJoin("Contracts.receivable", "Contracts_Receivable")
      .leftJoin("Contracts.program", "Program")
      .select(defaultSelectColumnsFinancier)
      .where("Financier.name LIKE :q OR Financier.cnpj LIKE :q", {
        q: `%${nameOrCNPJ}%`,
      })
      .andWhere("Financier.active = true")
      .getOne();
  }

  async _getOptions(): Promise<GenericOptions[]> {
    const financiers = await this.getRepository(Financier).find({
      where: {
        active: true,
      },
      select: ["id", "name", "cnpj"],
    });

    return financiers?.map((financier) => ({
      id: financier.id,
      name: `${financier?.name} - ${maskCNPJ(financier?.cnpj)}`,
    }));
  }
}
