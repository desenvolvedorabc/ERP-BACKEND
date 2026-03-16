import { HttpException, HttpStatus } from '@nestjs/common';

export class UserWithPendingApprovalsError extends HttpException {
  constructor() {
    super(
      'Não é possível editar ou desativar este usuário pois ele possui despesas em aprovação.',
      HttpStatus.FORBIDDEN,
    );
  }
}

export class CollaboratorWithPendingApprovalsError extends HttpException {
  constructor() {
    super(
      'Não é possível editar ou desativar este colaborador pois ele possui despesas em aprovação.',
      HttpStatus.FORBIDDEN,
    );
  }
}

export class UserWithCollaboratorPendingApprovalsError extends HttpException {
  constructor() {
    super(
      'Não é possível editar ou desativar este usuário pois o colaborador associado possui despesas em aprovação.',
      HttpStatus.FORBIDDEN,
    );
  }
}
