import { Injectable } from "@nestjs/common";
import { RealizedReportParamsDTO } from "../dtos/realizedReportFilterParams.dto";
import { RealizedReportService } from "../services/realized-report.service";
import { format, getYear, setMonth, setYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { realizedHeaders } from "../consts/pdfHeaders";
import { NoDataToExportError } from "../errors";
import { PDFBuilder } from "src/common/utils/pfd/pfdBuilder";
import { formatValueInCentsForBRL } from "src/common/utils/formats";

@Injectable()
export class RealizedPDFService {
  constructor(private readonly realizedService: RealizedReportService) {}

  async getPDF(dto: RealizedReportParamsDTO) {
    const itens = await this.realizedService.findAllForMonth(dto);

    if (!itens?.costCenters.length) {
      throw new NoDataToExportError();
    }
    const headers = realizedHeaders;
    const body = this.mapData(itens, getYear(dto.year), dto.formatValues);

    const pdfBuilder = new PDFBuilder(
      "landscape",
      `Realizado x Esperado`,
      headers,
      body,
    );
    const pdfBuffer = pdfBuilder.buildPDF();

    return Buffer.from(pdfBuffer);
  }

  private mapData(
    data: Awaited<ReturnType<typeof this.realizedService.findAllForMonth>>,
    year: number,
    formatValues?: boolean,
  ) {
    const date = setYear(new Date(), year);
    const formatValue = (value: number) => formatValues ? formatValueInCentsForBRL(value) : value;
    
    return data.costCenters.flatMap((costCenter) => {
      const costCenterName = costCenter.name;
      const categoryData = costCenter.categories.flatMap((category) => {
        const categoryName = category.name;
        const subCategoryData = category.subCategories.flatMap(
          (subCategory) => {
            return subCategory.months.map((month) => [
              costCenterName,
              categoryName,
              subCategory.name,
              format(setMonth(date, month.month - 1), "MMM/yy", { locale: ptBR }),
              formatValue(month.expected),
              formatValue(month.realized),
            ]);
          },
        );

        const categoryItems = category.months.map((month) => [
          costCenterName,
          categoryName,
          "",
          format(setMonth(date, month.month - 1), "MMM/yy", { locale: ptBR }),
          formatValue(month.expected),
          formatValue(month.realized),
        ]);

        return [...categoryItems, [], ...subCategoryData];
      });

      return categoryData;
    });
  }
}
