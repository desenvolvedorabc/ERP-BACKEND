import { ConflictException, NotFoundException } from "@nestjs/common";

export class NotFoundBudget extends NotFoundException {
  constructor() {
    super("Orçamento não encontrado.");
  }
}

export class ConflictExceptionBudget extends ConflictException {
  constructor() {
    super("Atenção! Já existe um orçamento com essas informações.");
  }
}
