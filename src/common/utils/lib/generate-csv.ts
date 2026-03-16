import { Parser } from "json2csv";

export function generateCsv(data: any, delimiter = ";") {
  if (Array.isArray(data) && data.length === 0) {
    return { csvData: "" };
  }
  const parser = new Parser({
    withBOM: true,
    delimiter,
  });

  const csvData = parser.parse(data);

  return {
    csvData,
  };
}
