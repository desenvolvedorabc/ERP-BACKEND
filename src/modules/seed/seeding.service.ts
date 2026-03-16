/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { SuppliersRepository } from "../suppliers/repositories/typeorm/suppliers-repository";
import { CategorySupplier } from "../suppliers/enum";

@Injectable()
export class SeedingService {
  constructor(private supplierRepository: SuppliersRepository) {}

  async seed(): Promise<void> {
    await this.seedSuppliers();
  }

  private async seedSuppliers(): Promise<void> {
    const defaultSupplierCnpj = process.env.DEFAULT_SUPPLIER_CNPJ || "00000000000000";

    const existingSupplier = await this.supplierRepository.findOne({
      where: { cnpj: defaultSupplierCnpj },
    });

    if (!existingSupplier) {
      const defaultSupplierData = {
        name: "Banco Bradesco S.A.",
        email: "",
        cnpj: defaultSupplierCnpj,
        corporateName: "Banco Bradesco S.A.",
        fantasyName: "Banco Bradesco S.A.",
        serviceCategory: CategorySupplier.BANCO,
        active: true,
      };

      try {
        const supplier = this.supplierRepository.create(defaultSupplierData);
        await this.supplierRepository.save(supplier);
        console.log(`Fornecedor padrão Banco Bradesco S.A. criado.`);
      } catch (error) {
        console.error(
          `Falha na criação do fornecedor padrão Banco Bradesco S.A.`,
          error,
        );
      }
    } else {
      console.log("Fornecedor padrão Banco Bradesco S.A. já existe.");
    }
  }
}
