import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

export class CreatingContractError extends InternalServerErrorException {
  constructor() {
    super("Erro ao criar contrato.");
  }
}

export class UpdatingContractError extends InternalServerErrorException {
  constructor() {
    super("Erro ao atualizar contrato.");
  }
}

export class DeletingContractError extends InternalServerErrorException {
  constructor() {
    super("Erro ao deletar contrato.");
  }
}

export class FetchingContractError extends InternalServerErrorException {
  constructor() {
    super("Erro ao buscar contratos.");
  }
}

export class FetchingContractByIdError extends InternalServerErrorException {
  constructor() {
    super("Erro ao buscar contrato por ID.");
  }
}

export class ContractNotFoundError extends NotFoundException {
  constructor() {
    super("contrato não encontrado.");
  }
}

export class ContractDeletingError extends ForbiddenException {
  constructor() {
    super("Não é possível deletar um contrato que não esteja pendente.");
  }
}

export class ContractConflictError extends ConflictException {
  constructor() {
    super("Atenção! Já existe um contrato com este código.");
  }
}

export class ContractEditError extends ForbiddenException {
  constructor() {
    super("Não é possível editar um contrato já assinado.");
  }
}

export class ContractSettleError extends ForbiddenException {
  constructor() {
    super("Não é possível quitar ou distratar um contrato não assinado.");
  }
}

export class NoContractsException extends NotFoundException {
  constructor() {
    super("Nenhum contrato encontrado.");
  }
}

export class Aditive7DaysError extends ForbiddenException {
  constructor() {
    super(
      "Não é possível adicionar um aditivo a um contrato finalizado há mais de 7 dias.",
    );
  }
}

export class CreatingAditiveError extends InternalServerErrorException {
  constructor() {
    super("Erro ao criar aditivo.");
  }
}

export class CreateAditiveInAditiveError extends InternalServerErrorException {
  constructor() {
    super("Um aditivo não pode ter um aditivo.");
  }
}

export class CreateAditiveSignedError extends InternalServerErrorException {
  constructor() {
    super(
      "Um aditivo so pode ser criado em um contrato assinado ou finalizado.",
    );
  }
}

export class SigningContractError extends InternalServerErrorException {
  constructor() {
    super("Erro ao anexar contrato assinado.");
  }
}

export class TermoContractError extends InternalServerErrorException {
  constructor() {
    super("Erro ao anexar termo de quitação.");
  }
}

export class DistratoContractError extends InternalServerErrorException {
  constructor() {
    super("Erro ao anexar distrato.");
  }
}
