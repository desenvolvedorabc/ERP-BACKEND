import { ConflictException, NotFoundException } from "@nestjs/common";

export class NotFoundSupplier extends NotFoundException {
  constructor() {
    super("Fornecedor não encontrado.");
  }
}

export class ConflictExceptionSupplier extends ConflictException {
  constructor() {
    super("Atenção! Já existe um fornecedor com esse CNPJ.");
  }
}
