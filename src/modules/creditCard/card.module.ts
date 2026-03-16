/*
https://docs.nestjs.com/modules
*/

import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CreditCard } from "./entities/creditCard.entity";
import { CreditCardService } from "./services/creditCard.service";
import { CreditCardRepository } from "./repositories/creditCard-repository";
import { CardController } from "./controllers/card.controller";
import { CreditCardValidator } from "./validations/creditCard.validate";
import { CardMovimentationValidator } from "./validations/cardMov.validate";
import { CardMovService } from "./services/cardMov.service";
import { CardMovimentationRepository } from "./repositories/cardMov-repository";
import { PayableModule } from "../payables/payable.module";
import { CardMovimentation } from "./entities/cardMovimentation.entity";
import { CardMovimentationController } from "./controllers/mov.controller";
import { CategorizationModule } from "../categorization/categorization.module";
import { SuppliersModule } from "../suppliers/suppliers.module";
import { CardMovPDFService } from "./services/cardmov-pdf.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([CreditCard, CardMovimentation]),
    forwardRef(() => PayableModule),
    CategorizationModule,
    SuppliersModule,
  ],
  controllers: [CardController, CardMovimentationController],
  providers: [
    CreditCardService,
    CreditCardRepository,
    CreditCardValidator,
    CardMovimentationValidator,
    CardMovService,
    CardMovimentationRepository,
    CardMovPDFService,
  ],
  exports: [CreditCardService, CardMovService],
})
export class CardModule {}
