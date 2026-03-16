import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

export class CreatingAccountError extends InternalServerErrorException {
  constructor() {
    super("Erro ao criar conta.");
  }
}

export class UpdatingAccountError extends InternalServerErrorException {
  constructor() {
    super("Erro ao atualizar conta.");
  }
}

export class FindAccountError extends InternalServerErrorException {
  constructor() {
    super("Erro ao encontrar conta.");
  }
}

export class DeletingAccountError extends InternalServerErrorException {
  constructor() {
    super("Erro ao deletar conta.");
  }
}

export class NotFoundAccount extends NotFoundException {
  constructor() {
    super("Conta não encontrada.");
  }
}

export class NotFoundAccountsError extends NotFoundException {
  constructor() {
    super("Nenhuma conta encontrada.");
  }
}
