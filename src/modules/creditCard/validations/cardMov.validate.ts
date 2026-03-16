import { NotFoundMovimentation } from "../errors";
import { Injectable } from "@nestjs/common";
import { CardMovimentationRepository } from "../repositories/cardMov-repository";

@Injectable()
export class CardMovimentationValidator {
  constructor(private cardMovRepository: CardMovimentationRepository) {}
  async Exists(id: number): Promise<void> {
    const exists = this.cardMovRepository.existsBy({ id });
    if (!exists) {
      throw new NotFoundMovimentation();
    }
  }

  async ExistsByUUID(UUID: string): Promise<void> {
    const exists = this.cardMovRepository.existsBy({ installmentId: UUID });
    if (!exists) {
      throw new NotFoundMovimentation();
    }
  }
}
