import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { isAfter, isDate } from "date-fns";
import { RecurenceDataDTO } from "../DTOs/recurrenceData.dto";

@ValidatorConstraint()
export class IsStartDateGreatherThanEndDateConstraint
  implements ValidatorConstraintInterface
{
  validate(recurrence: RecurenceDataDTO) {
    const startDate = recurrence.startDate;
    const endDate = recurrence.endDate;
    if (isDate(endDate) && isDate(startDate)) {
      return isAfter(endDate, startDate);
    }
    return false;
  }

  defaultMessage() {
    return `Data inicial deve ser maior que a data final.`;
  }
}

export function IsStartDateGreatherThanEndDate(
  validationOptions?: ValidationOptions,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: "isStartDateGreatherThanEndDate",
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: IsStartDateGreatherThanEndDateConstraint,
    });
  };
}
