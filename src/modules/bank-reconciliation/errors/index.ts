import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

export class CreatingBankReconciliationError extends InternalServerErrorException {
  constructor() {
    super("Erro ao criar dados bancários.");
  }
}

export class UpdatingBankReconciliationError extends InternalServerErrorException {
  constructor() {
    super("Erro ao atualizar dados bancários.");
  }
}

export class FindBankReconciliationError extends InternalServerErrorException {
  constructor() {
    super("Erro ao encontrar dados bancários.");
  }
}

export class DeletingBankReconciliationError extends InternalServerErrorException {
  constructor() {
    super("Erro ao deletar dados bancários.");
  }
}

export class NotFoundBankReconciliation extends NotFoundException {
  constructor() {
    super("Dados bancários não encontrada.");
  }
}

export class InvalidDateBetweenRecordsError extends BadRequestException {
  constructor() {
    super("Data do lançamento do sistema e do extrato são diferentes.");
  }
}
