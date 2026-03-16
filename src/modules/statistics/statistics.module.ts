import { Module } from "@nestjs/common";
import { StatisticsService } from "./statistics.service";
import { StatisticsController } from "./statistics.controller";
import { NoContractReportService } from "../reports/services/nocontract-report.service";
import { NoContractSuppliersReportRepository } from "../reports/repositories/no-contract-suppliers-report-repository";
import { StatisticsRepository } from "./repositories/statistics-repository";
import { RealizedReportService } from "../reports/services/realized-report.service";
import { RealizedReportRepository } from "../reports/repositories/realized-report-repository";

@Module({
  controllers: [StatisticsController],
  providers: [
    RealizedReportService,
    RealizedReportRepository,
    StatisticsService,
    StatisticsRepository,
    NoContractReportService,
    NoContractSuppliersReportRepository,
  ],
})
export class StatisticsModule {}
