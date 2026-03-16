import { ConflictException, NotFoundException } from "@nestjs/common";

export class NotFoundFinancier extends NotFoundException {
  constructor() {
    super("Financiador não encontrado.");
  }
}

export class ConflictExceptionFinancier extends ConflictException {
  constructor() {
    super("Atenção! Já existe um financiador com esse CNPJ.");
  }
}
