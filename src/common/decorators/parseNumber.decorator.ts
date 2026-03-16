import { Transform } from "class-transformer";

export const parseNumber = () => {
  return Transform(({ value }) => {
    if (!value) return null;
    const parsedValue = Number(value);
    return isNaN(parsedValue) ? null : parsedValue;
  });
};
