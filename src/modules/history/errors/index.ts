import {
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

export class CreatingHistoryError extends InternalServerErrorException {
  constructor() {
    super("Erro ao criar histórico.");
  }
}

export class DeletingHistoryError extends InternalServerErrorException {
  constructor() {
    super("Erro ao deletar histórico.");
  }
}

export class FetchingHistoryByIdError extends InternalServerErrorException {
  constructor() {
    super("Erro ao buscar histórico por ID.");
  }
}

export class HistoryNotFoundError extends NotFoundException {
  constructor() {
    super("Histórico não encontrado.");
  }
}
