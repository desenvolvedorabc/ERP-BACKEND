import { parse, format } from "date-fns";

export function formatTelephone(telephone: string) {
  let value = telephone.replace(/\D/g, "");
  value = value.replace(/(\d{2})(\d)/, "($1) $2");
  value = value.replace(/(\d)(\d{4})$/, "$1-$2");
  return value;
}

export function formatCPF(cpf: string) {
  const cpfFormatted = cpf.replace(/[^\d]/g, "");

  return cpfFormatted.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatCnpj(value: string) {
  const cnpjFormatted = value.replace(/\D/g, "");

  return cnpjFormatted.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g,
    "$1.$2.$3/$4-$5",
  );
}

export function formatValueInCentsForBRL(valueInCents: number) {
  const value = (valueInCents / 100).toLocaleString("pt-br", {
    style: "currency",
    currency: "BRL",
  });

  return value;
}

export function formatDateBradesco(date: string): Date {
  const parsedDate = parse(date, "dd/MM/yyyy", new Date());

  return parsedDate;
}

export function convertToCents(value: number) {
  let valueString = (value + "").replace(/[^\d.-]/g, "");
  if (valueString && valueString.includes(".")) {
    valueString = valueString.substring(0, valueString.indexOf(".") + 3);
  }

  const valueRounded = valueString
    ? Math.round(parseFloat(valueString) * 100)
    : 0;

  return valueRounded;
}
