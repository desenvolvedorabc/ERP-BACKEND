import {
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

export class GeneratingRelatoryError extends InternalServerErrorException {
  constructor() {
    super("Erro ao gerar relatório.");
  }
}

export class ExportingRelatoryError extends InternalServerErrorException {
  constructor() {
    super("Erro ao exportar relatório.");
  }
}

export class NoDataToExportError extends NotFoundException {
  constructor() {
    super("Nenhum dado para exportar.");
  }
}
