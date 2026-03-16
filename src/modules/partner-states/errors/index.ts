import { ConflictException, NotFoundException } from "@nestjs/common";

export class NotFoundPartnerState extends NotFoundException {
  constructor() {
    super("Estado parceiro não encontrado.");
  }
}

export class ConflictExceptionPartnerSate extends ConflictException {
  constructor() {
    super("Atenção! Já existe um estado parceiro com esse nome.");
  }
}
