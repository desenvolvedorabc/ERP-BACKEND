import { HttpException, HttpStatus } from "@nestjs/common";
import { ValidationError } from "class-validator";

function getFirstConstraint(error: ValidationError): string | null {
  console.log({ error });
  if (error.constraints) {
    const firstConstraint = Object.entries(error.constraints)[0];
    if (firstConstraint) {
      return firstConstraint[1];
    }
  }
  if (error.children && error.children.length > 0) {
    return getFirstConstraint(error.children[0]);
  }
  return null;
}

function getCustomValidationError(message: string) {
  return {
    statusCode: 422,
    message,
    error: "Unprocessable Entity",
    errorCode: "VALIDATION_FAILED",
  };
}

function getCustomExceptionFactory(errors: ValidationError[]) {
  const firstErrorMessage = getFirstConstraint(errors[0]);

  if (firstErrorMessage) {
    return new HttpException(
      getCustomValidationError(firstErrorMessage),
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  } else {
    return new HttpException(
      getCustomValidationError("Validation failed"),
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

export { getCustomExceptionFactory };
