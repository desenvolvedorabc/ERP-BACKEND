import { ConflictException, NotFoundException, ForbiddenException } from "@nestjs/common";

export class ConflictUser extends ConflictException {
  constructor(attribute: string) {
    super(`Atenção! Já existe um usuário cadastrado com esse ${attribute}.`);
  }
}

export class NotFoundUser extends NotFoundException {
  constructor() {
    super("Usuário não encontrado.");
  }
}

export class UserWithPendingApprovalsError extends ForbiddenException {
  constructor() {
    super("Não é possível desativar este usuário pois ele possui contas pendentes de aprovação.");
  }
}
