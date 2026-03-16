import {
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

export class CreatingCategorizationError extends InternalServerErrorException {
  constructor() {
    super("Erro ao criar Categorização.");
  }
}

export class DeletingCategorizationError extends InternalServerErrorException {
  constructor() {
    super("Erro ao deletar Categorização.");
  }
}

export class FetchingCategorizationByIdError extends InternalServerErrorException {
  constructor() {
    super("Erro ao buscar Categorização por ID.");
  }
}

export class CategorizationNotFoundException extends NotFoundException {
  constructor() {
    super("Categorização não encontrada.");
  }
}
