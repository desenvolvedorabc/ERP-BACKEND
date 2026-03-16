import { ConflictException, NotFoundException } from "@nestjs/common";

export class NotFoundPartnerMunicipality extends NotFoundException {
  constructor() {
    super("Município parceiro não encontrado.");
  }
}

export class ConflictExceptionPartnerMunicipality extends ConflictException {
  constructor() {
    super("Atenção! Já existe um município parceiro com esse nome.");
  }
}
