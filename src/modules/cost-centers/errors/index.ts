import { ConflictException, NotFoundException } from "@nestjs/common";

export class NotFoundCostCenter extends NotFoundException {
  constructor() {
    super("Centro de custo não encontrado.");
  }
}

export class NotFoundCostCenterCategory extends NotFoundException {
  constructor() {
    super("Categoria não encontrada.");
  }
}

export class NotFoundCostCenterSubCategory extends NotFoundException {
  constructor() {
    super("Sub Categoria não encontrada.");
  }
}

export class DuplicatedCostCenter extends ConflictException {
  constructor() {
    super("Já existe um centro de custo com esse nome e tipo.");
  }
}

export class DuplicatedCategory extends ConflictException {
  constructor() {
    super("Já existe uma categoria com este nome para este centro de custo.");
  }
}

export class DuplicatedSubCategory extends ConflictException {
  constructor() {
    super("Já existe uma sub categoria com este nome para esta categoria.");
  }
}
