import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

export class GenerateApprovalsError extends InternalServerErrorException {
  constructor() {
    super("Erro ao gerar aprovações.");
  }
}

export class ForbiddenApprovalError extends ForbiddenException {
  constructor() {
    super("Credenciais inválidas ou expiradas.");
  }
}

export class AlreadyApprovedError extends ForbiddenException {
  constructor() {
    super("Conta a pagar já aprovada pelo usuário.");
  }
}

export class NotFoundApprovalError extends NotFoundException {
  constructor() {
    super("Aprovação não encontrada.");
  }
}

export class ApprovalError extends InternalServerErrorException {
  constructor() {
    super("Erro ao processar aprovação.");
  }
}

export class NoMassApprovalUserError extends ForbiddenException {
  constructor() {
    super("O sistema deve ter ao menos um aprovador em massa ativo.");
  }
}