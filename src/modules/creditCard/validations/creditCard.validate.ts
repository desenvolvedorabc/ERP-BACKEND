import { CreditCardRepository } from "../repositories/creditCard-repository";
import { HasPendingPayableException, NotFoundCreditCard } from "../errors";
import { Injectable, InternalServerErrorException } from "@nestjs/common";

@Injectable()
export class CreditCardValidator {
  constructor(private creditCardRepository: CreditCardRepository) {}
  async Exists(id: number): Promise<void> {
    if (isNaN(id)) {
      throw new InternalServerErrorException("Id enviado não é um número");
    }
    const exists = this.creditCardRepository.existsBy({ id });
    if (!exists) {
      throw new NotFoundCreditCard();
    }
  }

  async hasPendingPayable(id: number): Promise<void> {
    if (isNaN(id)) {
      throw new InternalServerErrorException("Id enviado não é um número");
    }
    const has = await this.creditCardRepository._hasPendingPayable(id);
    if (has) {
      throw new HasPendingPayableException();
    }
  }
}
