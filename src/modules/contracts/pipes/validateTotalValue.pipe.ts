import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from "@nestjs/common";
import { PaymentType } from "src/modules/payables/enums";
import { ReceivableType } from "src/modules/receivables/enums";
import { ContractsService } from "../services/contracts.service";

@Injectable()
export class ValidateTotalValuePipe implements PipeTransform {
  constructor(private contractService: ContractsService) {}

  async transform(value: any, { metatype }: ArgumentMetadata) {
    const { contractId, totalValue, paymentType, receivableType } = value;

    if (
      paymentType !== PaymentType.CONTRACT &&
      receivableType !== ReceivableType.CONTRACT
    ) {
      return value;
    }

    if (!contractId) {
      throw new BadRequestException(
        "A conta precisa está associado a um contrato.",
      );
    }

    const contract = await this.contractService.findOneById(contractId);

    if (!contract) {
      throw new BadRequestException("Contrato não encontrado.");
    }

    if (totalValue > contract.totalValue) {
      throw new BadRequestException(
        "O valor total deve ser menor ou igual ao valor total do contrato.",
      );
    }

    return value;
  }
}
