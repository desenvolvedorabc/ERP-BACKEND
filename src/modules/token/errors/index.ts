import {
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

export class CreatingTokenError extends InternalServerErrorException {
  constructor() {
    super("Erro ao criar token.");
  }
}

export class FetchingTokendAPIError extends InternalServerErrorException {
  constructor() {
    super("Erro ao buscar token na api.");
  }
}

export class FetchingTokendError extends InternalServerErrorException {
  constructor() {
    super("Erro ao buscar token no banco.");
  }
}

export class TokenNotFoundError extends NotFoundException {
  constructor() {
    super("Token não encontrado.");
  }
}
