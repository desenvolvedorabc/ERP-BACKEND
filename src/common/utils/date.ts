import {
  startOfMonth,
  endOfMonth,
  format,
  set,
  parseISO,
  startOfYear,
  endOfYear,
  isValid,
} from "date-fns";
import { ptBR } from "date-fns/locale";

const parseDateIso = (value: string) => {
  return set(parseISO(value), {
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
};

export const getPeriod = (date: Date) => {
  const startDate = format(startOfMonth(date), "yyyy-MM-dd");
  const endDate = format(endOfMonth(date), "yyyy-MM-dd");
  return {
    startDate: parseDateIso(startDate),
    endDate: parseDateIso(endDate),
  };
};

export const getAnnualPeriod = (date: Date) => {
  const startDate = format(startOfYear(date), "yyyy-MM-dd");
  const endDate = format(endOfYear(date), "yyyy-MM-dd");
  return {
    startDate: parseDateIso(startDate),
    endDate: parseDateIso(endDate),
  };
};

export const handleDates = (
  date: Date | undefined | null | string,
): Date | undefined => {
  if (!date) return undefined;

  const parsedDate: Date | undefined =
    typeof date === "string" ? parseISO(date) : date;

  return isValid(parsedDate) ? parsedDate : undefined;
};

export const formatDate = (date: Date | undefined | null | string) => {
  const parsedDate = handleDates(date);
  if (parsedDate) {
    return format(parsedDate, "dd/MM/yyyy", { locale: ptBR });
  }
  return "N/A";
};
