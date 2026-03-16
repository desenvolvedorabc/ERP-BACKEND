import { z, ZodSchema } from "zod";
import { FieldConfig } from "./types";
import { ArquivoHeader, fieldHeader } from "./layout/Bradesco/ArquivoHeader";

export const fieldConfigToZodSchema = <T>(
  fields: FieldConfig[],
): ZodSchema<T> => {
  const schemaObject: Record<string, ZodSchema<any>> = {};

  fields?.forEach((field) => {
    let fieldSchema = z.string();

    if (field.type === "numeric") {
      fieldSchema = fieldSchema.regex(
        /^\d+$/,
        `(${field.id}) deve ser numérico`,
      );
    } else if (field.type === "date") {
      fieldSchema = fieldSchema.regex(
        /^\d{8}$/,
        `${field.field} deve ser no formato YYYYMMDD`,
      );
    } else if (field.type === "hour") {
      fieldSchema = fieldSchema.regex(
        /^\d{6}$/,
        `(${field.id}) deve ser no formato HHMMSS`,
      );
    }

    if (field.required) {
      fieldSchema = fieldSchema.min(1, `(${field.id}) é obrigatório`);
    } else if (field.default === undefined) {
      // @ts-ignore
      fieldSchema = fieldSchema.optional();
    }

    if (field.default !== undefined) {
      // @ts-ignore
      fieldSchema = fieldSchema.default(field.default);
    }

    schemaObject[field.field] = fieldSchema;
  });

  return z.object(schemaObject) as unknown as ZodSchema<T>;
};
