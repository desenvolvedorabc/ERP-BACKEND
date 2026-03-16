import {
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

export class CreatingCreditCardError extends InternalServerErrorException {
  constructor() {
    super("Erro ao criar cartão.");
  }
}

export class UpdatingCreditCardError extends InternalServerErrorException {
  constructor() {
    super("Erro ao atualizar cartão.");
  }
}

export class FindCreditCardError extends InternalServerErrorException {
  constructor() {
    super("Erro ao encontrar cartão.");
  }
}

export class DeletingCreditCardError extends InternalServerErrorException {
  constructor() {
    super("Erro ao deletar cartão.");
  }
}

export class NotFoundCreditCard extends NotFoundException {
  constructor() {
    super("Cartão não encontrado.");
  }
}

export class HasPendingPayableException extends NotFoundException {
  constructor() {
    super(
      "O cartão tem uma conta a pagar pendente, portanto, não pode ser excluido.",
    );
  }
}

export class NotFoundCreditCardsError extends NotFoundException {
  constructor() {
    super("Nenhum cartão encontrado.");
  }
}

export class CreatingMovimentationError extends InternalServerErrorException {
  constructor() {
    super("Erro ao criar movimentação.");
  }
}

export class UpdatingMovimentationError extends InternalServerErrorException {
  constructor() {
    super("Erro ao atualizar movimentação.");
  }
}

export class FindMovimentationError extends InternalServerErrorException {
  constructor() {
    super("Erro ao encontrar movimentação.");
  }
}

export class GeneratePartialPayableError extends InternalServerErrorException {
  constructor() {
    super("Erro ao gerar pagamento parcial.");
  }
}

export class DeletingMovimentationError extends InternalServerErrorException {
  constructor() {
    super("Erro ao deletar movimentação.");
  }
}

export class NotFoundMovimentation extends NotFoundException {
  constructor() {
    super("Movimentação não encontrada.");
  }
}

export class NotFoundMovimentationsError extends NotFoundException {
  constructor() {
    super("Nenhuma movimentação encontrada.");
  }
}
