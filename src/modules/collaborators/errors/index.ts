import { ConflictException, NotFoundException } from "@nestjs/common";

export class NotFoundCollaborator extends NotFoundException {
  constructor() {
    super("Colaborador não encontrado.");
  }
}

export class ConflictExceptionCollaborator extends ConflictException {
  constructor() {
    super("Atenção! Já existe um colaborador com essas informações.");
  }
}
