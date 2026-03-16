import {
  BadGatewayException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

export class PayableStatusError extends NotFoundException {
  constructor() {
    super("Selecione apenas contas com status aprovado ou atrasado.");
  }
}

export class InvalidPayableDataCnabError extends InternalServerErrorException {
  constructor(field: string, payableName: string) {
    super(
      `Campo ${field} inválido da conta ${payableName} para a geração do CNAB.`,
    );
  }
}

export class PayableBankAccountNotFoundError extends NotFoundException {
  constructor() {
    super("Conta bancária do contrato ou fornecedor não encontrada.");
  }
}

export class PayablePixNotFoundError extends NotFoundException {
  constructor() {
    super("Dados do Pix do contrato não encontrado.");
  }
}

export class InvalidPaymentTypeError extends InternalServerErrorException {
  constructor() {
    super("Apenas pagamento de Pix, TED e DOC são permitidos.");
  }
}

export class SendingCnabError extends InternalServerErrorException {
  constructor() {
    super(
      "Erro ao enviar algum arquivo cnab para VAN, confira seu extrato bancário antes de confirmar pagamentos.",
    );
  }
}

export class PayableDocumentFoundError extends NotFoundException {
  constructor() {
    super("Documento do favorecido não encontrado");
  }
}

export class CnabValidationError extends BadGatewayException {
  constructor(msg: string) {
    super(msg);
  }
}

export class NotFoundInstallmentError extends NotFoundException {
  constructor(payable: string) {
    super(
      `Não encontramos a parcela mais próxima que ainda não venceu da conta: ${payable}`,
    );
  }
}
