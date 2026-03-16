import { ConflictException, NotFoundException } from "@nestjs/common";

export class NotFoundBudgetPlan extends NotFoundException {
  constructor() {
    super("Plano orçamentário não encontrado.");
  }
}

export class ConflictExceptionBudgetPlan extends ConflictException {
  constructor() {
    super("Atenção! Já existe um plano orçamentário com essas informações.");
  }
}
