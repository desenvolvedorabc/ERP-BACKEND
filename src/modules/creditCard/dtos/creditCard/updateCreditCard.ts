import { CreateCreditCardDTO } from "./createCreditCard.dto";
import { PartialType } from "@nestjs/swagger";

export class UpdateCreditCardDTO extends PartialType(CreateCreditCardDTO) {}
