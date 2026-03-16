import { Injectable, NotFoundException } from "@nestjs/common";
import { InternalServerError } from "src/common/errors";
import { filterContracts } from "src/common/utils/filterContracts";
import { PaginateParams } from "src/common/utils/paginate-params.dto";
import { CreateFinancierDto } from "./dto/create-financier.dto";
import { UpdateFinancierDto } from "./dto/update-financier.dto";
import { Financier } from "./entities/financier.entity";
import { ConflictExceptionFinancier, NotFoundFinancier } from "./errors";
import {
  FinanciersRepository,
  ResponseFinancier,
} from "./repositories/typeorm/financiers-repository";
import { GenericOptions } from "src/common/DTOs/options.dto";

@Injectable()
export class FinanciersService {
  constructor(private readonly financiersRepository: FinanciersRepository) {}

  async create(createFinancierDto: CreateFinancierDto): Promise<void> {
    await this.validateExistsFinancierByCnpj(createFinancierDto.cnpj);

    try {
      await this.financiersRepository._create(createFinancierDto);
    } catch (e) {
      throw new InternalServerError();
    }
  }

  findAll(params: PaginateParams) {
    return this.financiersRepository._findAll(params);
  }

  async findOne(id: number): Promise<ResponseFinancier> {
    const { financier } = await this.financiersRepository._findOneById(id);

    if (!financier) {
      throw new NotFoundFinancier();
    }

    return {
      financier,
    };
  }

  async findOneByNameOrCNPJ(nameOrCNPJ: string): Promise<Financier> {
    const financier =
      await this.financiersRepository._findOneByNameOrCNPJ(nameOrCNPJ);
    if (!financier)
      throw new NotFoundException("Financiador não encontrado ou inativo.");

    const filteredContracts = filterContracts(financier.contracts);

    return {
      ...financier,
      contracts: filteredContracts,
    };
  }

  async toggleActive(id: number): Promise<void> {
    const { financier } = await this.findOne(id);

    const active = !financier.active;

    try {
      await this.financiersRepository.update(id, {
        active,
      });
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async update(
    id: number,
    updateFinancierDto: UpdateFinancierDto,
  ): Promise<void> {
    const { financier } = await this.findOne(id);

    const newCnpj =
      updateFinancierDto?.cnpj !== financier.cnpj
        ? updateFinancierDto.cnpj
        : null;

    await this.validateExistsFinancierByCnpj(newCnpj);

    try {
      await this.financiersRepository._update(id, updateFinancierDto);
    } catch (e) {
      throw new InternalServerError();
    }
  }

  private async validateExistsFinancierByCnpj(cnpj: string): Promise<void> {
    if (cnpj) {
      const { financier } =
        await this.financiersRepository._findOneByCnpj(cnpj);

      if (financier) {
        throw new ConflictExceptionFinancier();
      }
    }
  }

  async getOptions(): Promise<GenericOptions[]> {
    return await this.financiersRepository._getOptions();
  }
}
