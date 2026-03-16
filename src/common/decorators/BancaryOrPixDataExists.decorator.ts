import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint()
export class BancaryOrPixDataExistsConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;
    return object.bancaryInfo || object.pixInfo;
  }

  defaultMessage() {
    return `Dados bancários ou dados pix devem ser enviados.`;
  }
}

export function BancaryOrPixDataExists(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: "BancaryOrPixDataExists",
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: BancaryOrPixDataExistsConstraint,
    });
  };
}
