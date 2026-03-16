import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { PixTypes } from "src/modules/suppliers/enum";
import { isValidCNPJ } from "../utils/validators/validateCnpj";
import { isValidCPF } from "../utils/validators/validateCpf";

@ValidatorConstraint()
export class IsValidCPFOrCNPJConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const keyType = (args.object as any).key_type ?? "CNPJ";
    if (!value) return false;
    if (keyType === PixTypes.CPF) {
      return isValidCPF(value.replace(/\D/g, ""));
    } else if (keyType === PixTypes.CNPJ) {
      return isValidCNPJ(value.replace(/\D/g, ""));
    } else {
      return true;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const keyType = (args.object as any).key_type ?? "CNPJ";
    return args.constraints[0] || `Chave deve ser um ${keyType} válido.`;
  }
}

export function IsValidCPFOrCNPJ(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: "isValidCPFOrCNPJ",
      target: object.constructor,
      propertyName,
      constraints: [validationOptions?.message],
      options: validationOptions,
      validator: IsValidCPFOrCNPJConstraint,
    });
  };
}
