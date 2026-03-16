import JsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import * as fs from "fs";
import { join } from "path";
import { InternalServerErrorException } from "@nestjs/common";

export class PDFBuilder {
  private orientation: "portrait" | "landscape" = "portrait";
  private title: string = "Relatório";
  private header: Array<string> = [];
  private body: Array<RowInput> = [];

  constructor(
    orientation: "portrait" | "landscape",
    title: string,
    header: Array<string>,
    body: Array<RowInput>,
  ) {
    this.orientation = orientation;
    this.title = title;
    this.header = header;
    this.body = body;
  }

  buildPDF() {
    try {
      const doc = new JsPDF(this.orientation, "px", "a4");
      doc.setFontSize(20);
      autoTable(doc, {
        head: [this.header],
        body: this.body,
        theme: "striped",
        margin: { top: 100, bottom: 50 },
        pageBreak: "auto",
        willDrawPage: ({ doc }: { doc: JsPDF }) => {
          this.addWatermark(doc);
          this.addTitle(doc);
        },
        styles: { fontSize: 5, overflow: "linebreak" },
      });

      return doc.output("arraybuffer");
    } catch (error) {
      console.error("Error building PDF:", error);
      throw new InternalServerErrorException("Error building PDF");
    }
  }

  private addWatermark(doc: JsPDF) {
    try {
      const imagePath = join(process.cwd(), "public", "watermarkABC.png");

      let watermarkBase64 = "";

      const imageData = fs.readFileSync(imagePath);
      watermarkBase64 = imageData.toString("base64");

      if (watermarkBase64) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.addImage(
          "data:image/png;base64," + watermarkBase64,
          "PNG",
          0,
          0,
          pageWidth,
          pageHeight,
        );

        doc.addImage(
          "data:image/png;base64," + watermarkBase64,
          "PNG",
          0,
          0,
          pageWidth,
          pageHeight,
        );
      }
    } catch (error) {
      console.error("Error reading watermark image:", error);
    }
  }

  private addTitle(doc: JsPDF) {
    const textWidth = doc.getTextWidth(this.title);
    const x = (doc.internal.pageSize.width - textWidth) / 2;
    doc.text(this.title, x, 80);
  }
}
