import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

export class CreatingReceivableError extends InternalServerErrorException {
  constructor() {
    super("Erro ao criar recebivel.");
  }
}

export class UpdatingReceivableError extends InternalServerErrorException {
  constructor() {
    super("Erro ao atualizar recebivel.");
  }
}

export class UpdatingReceivableCategoryError extends InternalServerErrorException {
  constructor() {
    super("Erro ao atualizar categoria do recebivel.");
  }
}

export class DeletingReceivableError extends InternalServerErrorException {
  constructor() {
    super("Erro ao deletar recebivel.");
  }
}

export class FetchingReceivableError extends InternalServerErrorException {
  constructor() {
    super("Erro ao buscar recebiveis.");
  }
}

export class FetchingReceivableByIdError extends InternalServerErrorException {
  constructor() {
    super("Erro ao buscar recebivel por ID.");
  }
}

export class FetchingReceivableInstallmentsByIdError extends InternalServerErrorException {
  constructor() {
    super("Erro ao buscar parcelas do recebivel por ID.");
  }
}
export class ReceivableNotFoundError extends NotFoundException {
  constructor() {
    super("Recebivel não encontrado.");
  }
}

export class ReceivableDeletingError extends ForbiddenException {
  constructor() {
    super(
      "Não é possível deletar uma receita que não esteja pendente ou em aprovação.",
    );
  }
}

export class ReceivableConflictError extends ConflictException {
  constructor() {
    super("Atenção! Já existe um recebivel com este código identificador.");
  }
}

export class ReceivableEditError extends ForbiddenException {
  constructor() {
    super("Não é possível editar um recebivel já recebido.");
  }
}

export class NoReceivablesException extends NotFoundException {
  constructor() {
    super("Nenhum recebivel encontrado.");
  }
}
