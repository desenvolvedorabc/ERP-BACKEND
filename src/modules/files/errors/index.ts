import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

export class CreatingFileError extends InternalServerErrorException {
  constructor() {
    super("Erro ao criar arquivo.");
  }
}

export class UpdatingFileError extends InternalServerErrorException {
  constructor() {
    super("Erro ao atualziar arquivos.");
  }
}

export class DeletingFileError extends InternalServerErrorException {
  constructor() {
    super("Erro ao deletar arquivo.");
  }
}

export class InvalidFilePath extends ForbiddenException {
  constructor() {
    super("Caminho de arquivo inválido.");
  }
}

export class NotFoundFile extends NotFoundException {
  constructor() {
    super("Arquivo não encontrado.");
  }
}
