export const EXCEL_MIME_TYPES = {
  XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  XLS: "application/vnd.ms-excel",
  CSV: "text/csv",
} as const;

export type ExcelMimeType =
  (typeof EXCEL_MIME_TYPES)[keyof typeof EXCEL_MIME_TYPES];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
