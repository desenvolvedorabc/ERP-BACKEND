import { Injectable } from "@nestjs/common";
import { numbersOfMonths } from "src/common/utils/constants/months";
import { RealizedReportRepository } from "../repositories/realized-report-repository";
import { RealizedReportParamsDTO } from "../dtos/realizedReportFilterParams.dto";
import { convertToCents, formatValueInCentsForBRL } from "src/common/utils/formats";
import { RealizedChartParamsDto } from "../dtos/realizedChartParams.dto";

@Injectable()
export class RealizedReportService {
  constructor(private readonly realizedRepo: RealizedReportRepository) {}

  async findAllForMonth(dto: RealizedReportParamsDTO) {
    const [
      costCenters,
      budgetResults,
      allRealized,
      allProvisioned,
      allBankRecon,
    ] = await Promise.all([
      this.realizedRepo.getCostCentersWithCategories(dto),
      this.realizedRepo.getBudgetResults(dto.year.getFullYear()),
      this.realizedRepo.getAllRealizedByCurrentDate(dto.year.getFullYear()),
      this.realizedRepo.getContractsProvisioned(dto.year.getFullYear()),
      this.realizedRepo.getAllBankReconByYear(dto.year.getFullYear()),
    ]);

    const bankReconMap = new Map<number, number>();
    allBankRecon.forEach((recon) => {
      bankReconMap.set(recon.CostCenterId, recon.totalRealized);
    });

    const formattedCostCenters = costCenters.map((costCenter) => {
      const bankReconValue = bankReconMap.get(costCenter.id) || 0;

      const formattedCategories = costCenter.categories.map((category) => {
        const formattedSubCategories = category.subCategories.map(
          (subCategory) => {
            const formattedItems = numbersOfMonths.map((month) => {
              const expected = budgetResults.find(
                (budgetResult) =>
                  budgetResult.costCenterSubCategoryId === subCategory.id &&
                  budgetResult.month === month,
              );

              const realized = allRealized.find(
                (realized) =>
                  realized.subCategoryId === subCategory.id &&
                  realized.month === month,
              );

              const provisioned = allProvisioned.find(
                (provisioned) =>
                  provisioned.payable?.some(
                    (p) => p.categorization?.subCategoryId === subCategory.id,
                  ) &&
                  provisioned.contractPeriod.start.getMonth() + 1 === month,
              );

              const combinedRealized =
                convertToCents(realized?.total || 0) + bankReconValue;

              return {
                month,
                expected: expected?.valueInCents || 0,
                realized: combinedRealized,
                provisioned: convertToCents(provisioned?.totalValue) || 0,
              };
            });

            const totalExpected = formattedItems.reduce(
              (acc, cur) => acc + +cur.expected,
              0,
            );
            const totalRealized = formattedItems.reduce(
              (acc, cur) => acc + +cur.realized,
              0,
            );
            const totalProvisioned = formattedItems.reduce(
              (acc, cur) => acc + +cur.provisioned,
              0,
            );

            return {
              totalExpected,
              totalRealized,
              totalProvisioned,
              id: subCategory.id,
              name: subCategory.name,
              months: formattedItems.reverse(),
            };
          },
        );

        const formattedItems = numbersOfMonths.map((month) => {
          const expected = budgetResults.find(
            (budgetResult) =>
              budgetResult.costCenterCategoryId === category.id &&
              budgetResult.month === month,
          );

          const realized = allRealized.find(
            (realized) =>
              realized.categoryId === category.id && realized.month === month,
          );

          const provisioned = allProvisioned.find(
            (provisioned) =>
              provisioned.payable?.some(
                (p) => p.categorization?.categoryId === category.id,
              ) && provisioned.contractPeriod.start.getMonth() + 1 === month,
          );

          const combinedRealized =
            convertToCents(realized?.total || 0) + bankReconValue;

          return {
            month,
            expected: expected?.valueInCents || 0,
            realized: combinedRealized,
            provisioned: convertToCents(provisioned?.totalValue) || 0,
          };
        });

        const totalExpected = formattedItems.reduce(
          (acc, cur) => acc + +cur.expected,
          0,
        );
        const totalRealized = formattedItems.reduce(
          (acc, cur) => acc + +cur.realized,
          0,
        );
        const totalProvisioned = formattedItems.reduce(
          (acc, cur) => acc + +cur.provisioned,
          0,
        );

        return {
          totalExpected,
          totalRealized,
          totalProvisioned,
          id: category.id,
          name: category.name,
          months: formattedItems.reverse(),
          subCategories: formattedSubCategories,
        };
      });

      const totalExpected = formattedCategories.reduce(
        (acc, cur) => acc + +cur.totalExpected,
        0,
      );
      const totalRealized = formattedCategories.reduce(
        (acc, cur) => acc + +cur.totalRealized,
        0,
      );
      const totalProvisioned = formattedCategories.reduce(
        (acc, cur) => acc + +cur.totalProvisioned,
        0,
      );

      return {
        id: costCenter.id,
        name: costCenter.name,
        totalExpected,
        totalRealized,
        totalProvisioned,
        budgetPlanId: costCenter.budgetPlanId,
        categories: formattedCategories,
      };
    });

    return {
      totalExpected: formattedCostCenters.reduce(
        (acc, cur) => acc + +cur.totalExpected,
        0,
      ),
      totalRealized: formattedCostCenters.reduce(
        (acc, cur) => acc + +cur.totalRealized,
        0,
      ),
      totalProvisioned: formattedCostCenters.reduce(
        (acc, cur) => acc + +cur.totalProvisioned,
        0,
      ),
      costCenters: formattedCostCenters,
    };
  }

  async getChartData({ year }: RealizedChartParamsDto) {
    const [budgetResults, allRealized] = await Promise.all([
      this.realizedRepo.getBudgetResults(year),
      this.realizedRepo.getAllRealizedByCurrentDate(year),
    ]);

    const chartData = numbersOfMonths.map((month) => {
      const expected = budgetResults
        .filter((result) => result.month === month)
        .reduce((acc, result) => acc + result.valueInCents / 100, 0);

      const realized = allRealized
        .filter((realized) => realized.month === month)
        .reduce(
          (acc, realized) => acc + convertToCents(realized?.total || 0) / 100,
          0,
        );

      return {
        month: new Date(0, month - 1).toLocaleString("pt-BR", {
          month: "long",
        }),
        expected,
        realized,
      };
    });

    return chartData;
  }

  async getCSV(dto: RealizedReportParamsDTO) {
    const data = await this.findAllForMonth(dto);

    const formatValue = (value: number) => {
      if (dto.formatValues) {
        return formatValueInCentsForBRL(value);
      }
      return value;
    };

    const csvData = data.costCenters.reduce((acc, costCenter) => {
      const categoryData = costCenter.categories.reduce((acc, category) => {
        const year = dto.year.getFullYear();
        
        const subCategoryData = category.subCategories.reduce(
          (acc, subCategory) => {
            const subCategoryItems = subCategory.months.map((month) => {
              const date = new Date(year, month.month - 1);
              return {
                "Centro de Custo": costCenter.name,
                Categoria: category.name,
                Subcategoria: subCategory.name,
                "Nome do Mês": date.toLocaleString("pt-BR", {
                  month: "long",
                }),
                "Valor Esperado": formatValue(month.expected),
                "Valor Realizado": formatValue(month.realized),
                "Valor Provisionado": formatValue(month.provisioned),
              };
            });

            return [...acc, ...subCategoryItems];
          },
          [],
        );

        const categoryItems = category.months.map((month) => {
          const date = new Date(year, month.month - 1);
          return {
            "Centro de Custo": costCenter.name,
            Categoria: category.name,
            Subcategoria: "",
            "Nome do Mês": date.toLocaleString("pt-BR", {
              month: "long",
            }),
            "Valor Esperado": formatValue(month.expected),
            "Valor Realizado": formatValue(month.realized),
            "Valor Provisionado": formatValue(month.provisioned),
          };
        });

        return [...acc, ...categoryItems, ...subCategoryData];
      }, []);

      return [...acc, ...categoryData];
    }, []);

    const csv = this.jsonToCSV(csvData);

    return { csvData: csv };
  }

  private jsonToCSV(json: any[]) {
    const replacer = (key: string, value: any) => (value === null ? "" : value);
    const header = Object.keys(json[0]);
    const csv = json.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(";"),
    );
    csv.unshift(header.join(";"));
    return csv.join("\r\n");
  }
}
