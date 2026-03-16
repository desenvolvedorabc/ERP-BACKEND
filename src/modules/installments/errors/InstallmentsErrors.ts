import { InternalServerErrorException } from "@nestjs/common";

export class CreatingInstallmentsError extends InternalServerErrorException {
  constructor() {
    super("Erro ao criar parcelas.");
  }
}

export class GeneratingInstallmentsError extends InternalServerErrorException {
  constructor() {
    super("Erro ao gerar parcelas.");
  }
}

export class FetchingInstallmentsError extends InternalServerErrorException {
  constructor() {
    super("Erro ao buscar parcelas.");
  }
}

export class StatusUpdateError extends InternalServerErrorException {
  constructor() {
    super("Erro ao atualizar status da parcela.");
  }
}

export class MarkAsPaidError extends InternalServerErrorException {
  constructor() {
    super("Erro ao marcar parcela como paga.");
  }
}

export class CancelError extends InternalServerErrorException {
  constructor() {
    super("Erro ao cancelar parcelas.");
  }
}

export class UpdateManyInstallmentsDate extends InternalServerErrorException {
  constructor() {
    super("Erro ao atualizar datas de pagamento.");
  }
}
