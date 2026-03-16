import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

export class CreatingPayableError extends InternalServerErrorException {
  constructor() {
    super("Erro ao criar despesa.");
  }
}

export class UpdatingPayableError extends InternalServerErrorException {
  constructor() {
    super("Erro ao atualizar despesa.");
  }
}

export class UpdatingPayableCategoryError extends InternalServerErrorException {
  constructor() {
    super("Erro ao atualizar categoria da despesa.");
  }
}

export class ApprovePayableError extends InternalServerErrorException {
  constructor() {
    super("Erro ao aprovar/reprovar despesa.");
  }
}

export class DeletingPayableError extends InternalServerErrorException {
  constructor() {
    super("Erro ao deletar despesa.");
  }
}

export class FetchingPayableError extends InternalServerErrorException {
  constructor() {
    super("Erro ao buscar despesas.");
  }
}

export class FetchingPayableByIdError extends InternalServerErrorException {
  constructor() {
    super("Erro ao buscar despesa por ID.");
  }
}

export class FetchingPayableInstallmentsByIdError extends InternalServerErrorException {
  constructor() {
    super("Erro ao buscar parecelas da despesa por ID.");
  }
}

export class PayableNotFoundError extends NotFoundException {
  constructor() {
    super("Despesa não encontrada.");
  }
}

export class PayableConflictError extends ConflictException {
  constructor() {
    super("Atenção! Já existe uma despesa com código identificador.");
  }
}

export class PayableEditError extends ForbiddenException {
  constructor() {
    super(
      "Não é possível editar uma despesa que não esteja pendente, em aprovação ou rejeitada.",
    );
  }
}

export class PayableDeletingError extends ForbiddenException {
  constructor() {
    super(
      "Não é possível deletar uma despesa que não esteja pendente ou em aprovação.",
    );
  }
}

export class PayableDeletingTypeError extends ForbiddenException {
  constructor() {
    super(
      "Não é possível deletar uma despesa que seja do tipo Distrato ou Termo de quitação.",
    );
  }
}

export class NoPayablesException extends NotFoundException {
  constructor() {
    super("Nenhuma despesa encontrada.");
  }
}
