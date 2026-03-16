import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { CreatePayableDTO } from "src/modules/payables/dto/payable/createPayable.dto";
import { PaymentMethod } from "src/modules/payables/enums";

@ValidatorConstraint()
export class IsBarCodeRequiredConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const { paymentMethod, barcode, recurrent } =
      args.object as CreatePayableDTO;
    if (paymentMethod === PaymentMethod.BILL && !barcode) {
      return false;
    }
    if (paymentMethod === PaymentMethod.BILL && recurrent) {
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const { paymentMethod, barcode, recurrent } =
      args.object as CreatePayableDTO;
    if (paymentMethod === PaymentMethod.BILL && !barcode) {
      return "O código de barras é obrigatório para pagamentos via boleto.";
    }
    if (paymentMethod === PaymentMethod.BILL && recurrent) {
      return "Pagamentos recorrentes não podem ser feitos via boleto.";
    }
    return "";
  }
}

export function IsBarCodeRequired(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: "isBarcodeRequired",
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: IsBarCodeRequiredConstraint,
    });
  };
}
