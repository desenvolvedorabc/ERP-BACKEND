import * as fs from "node:fs";
import { generateCsv } from "./lib/generate-csv";

export async function generateCsvAndSave(
  data: any,
  host: string,
): Promise<{ fileName: string }> {
  const { csvData } = generateCsv(data);

  const dir = `./public/${host}`;

  const fileName = `${Date.now()}-${host}.csv`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFile(`${dir}/${fileName}`, csvData, async (err) => {
    if (err) {
      console.log(err);
    }
  });

  return {
    fileName,
  };
}
