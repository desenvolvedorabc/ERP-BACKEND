import { Controller, Get, UseGuards } from "@nestjs/common";
import { StatisticsService } from "./statistics.service";
import { DashboardStatisticsDto } from "./dtos/dashboard-statistics.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { NoContractReportService } from "../reports/services/nocontract-report.service";
import { StatisticsRepository } from "./repositories/statistics-repository";
import { RealizedReportService } from "../reports/services/realized-report.service";

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller("statistics")
export class StatisticsController {
  constructor(
    private readonly statisticsService: StatisticsService,
    private readonly suppliersNoContractService: NoContractReportService,
    private readonly statisticsRepo: StatisticsRepository,
    private readonly realizedReportService: RealizedReportService,
  ) {}

  @Get("dashboard")
  async getDashboardStatistics(): Promise<DashboardStatisticsDto> {
    const [
      expenses,
      revenues,
      noContractSuppliers,
      lastPayments,
      chartRealized,
    ] = await Promise.all([
      this.statisticsService.getCostCentersStats(),
      this.statisticsService.getFinanciersStats(),
      this.suppliersNoContractService.getNoContractSuppliersReport({} as any),
      this.statisticsRepo.getLastPayments(),
      this.realizedReportService.getChartData({
        year: new Date().getFullYear(),
      }),
    ]);

    return {
      ...expenses,
      ...revenues,
      noContractSuppliers: noContractSuppliers
        .sort((a, b) => a.total - b.total)
        .slice(0, 5)
        .reverse(),
      lastPayments,
      chartRealized,
    };
  }
}
