import { Injectable, NotFoundException } from "@nestjs/common";
import { InternalServerError } from "src/common/errors";
import { formatSuppliersForCsv } from "src/common/mappers/csv/format-suppliers-for-csv";
import { filterContracts } from "src/common/utils/filterContracts";
import { generateCsv } from "src/common/utils/lib/generate-csv";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { PaginateSuppliersParams } from "./dto/paginate-suppliers-params.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { Supplier } from "./entities/supplier.entity";
import { ConflictExceptionSupplier, NotFoundSupplier } from "./errors";
import { SuppliersRepository } from "./repositories/typeorm/suppliers-repository";
import { GenericOptions } from "src/common/DTOs/options.dto";

@Injectable()
export class SuppliersService {
  constructor(private suppliersRepository: SuppliersRepository) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<void> {
    await this.validateUserExistsByCnpj(createSupplierDto.cnpj);

    try {
      await this.suppliersRepository._create(createSupplierDto);
    } catch (e) {
      throw new InternalServerError();
    }
  }

  findAll(params: PaginateSuppliersParams) {
    return this.suppliersRepository._findAll(params);
  }

  async findOneByNameOrCNPJ(
    nameOrCNPJ: string,
    payableOrReceivableId?: number,
  ): Promise<Supplier> {
    const supplier =
      await this.suppliersRepository._findOneByNameOrCNPJ(nameOrCNPJ);
    if (!supplier)
      throw new NotFoundException("Fornecedor não encontrado ou inativo.");

    const filteredContracts = filterContracts(
      supplier.contracts,
      payableOrReceivableId,
    );

    return {
      ...supplier,
      contracts: filteredContracts,
    };
  }

  async findOne(id: number) {
    const { supplier } = await this.suppliersRepository._findOneById(id);

    if (!supplier) {
      throw new NotFoundSupplier();
    }

    return {
      supplier,
    };
  }

  async findBradesco() {
    const bradesco = await this.suppliersRepository._findBradesco();

    if (!bradesco) {
      throw new NotFoundException(
        "Fornecedor padrão não encontrado para geração de fatura.",
      );
    }

    return bradesco;
  }

  async toggleActive(id: number): Promise<void> {
    const { supplier } = await this.findOne(id);

    const active = !supplier.active;

    try {
      await this.suppliersRepository._update(supplier.id, {
        active,
      });
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async update(id: number, dto: UpdateSupplierDto): Promise<void> {
    const { supplier } = await this.findOne(id);

    const newCnpj: string = supplier.cnpj !== dto?.cnpj ? dto.cnpj : null;

    await this.validateUserExistsByCnpj(newCnpj);

    try {
      await this.suppliersRepository._update(supplier.id, dto);
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async findAllInCsv(params: PaginateSuppliersParams) {
    const { items } = await this.suppliersRepository._findAll(params, true);

    const { data } = formatSuppliersForCsv(items);

    if (!data?.length) {
      throw new NotFoundException("Nenhum fornecedor encontrado.");
    }

    const { csvData } = generateCsv(data);

    return {
      csvData,
    };
  }

  private async validateUserExistsByCnpj(cnpj: string): Promise<void> {
    if (cnpj) {
      const { supplier: findByCnpj } =
        await this.suppliersRepository._findOneByCnpj(cnpj);

      if (findByCnpj) {
        throw new ConflictExceptionSupplier();
      }
    }
  }

  async getOptions(): Promise<GenericOptions[]> {
    return await this.suppliersRepository._getOptions();
  }
}
