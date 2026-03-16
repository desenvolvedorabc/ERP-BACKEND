/*
https://docs.nestjs.com/modules
*/

import { Module } from "@nestjs/common";
import { ReportsController } from "./controllers/reports.controller";
import { PositionReportsRepository } from "./repositories/position-reports-repository";
import { CashFlowReportRepository } from "./repositories/cashflow-reports-repository";
import { NoContractSuppliersReportRepository } from "./repositories/no-contract-suppliers-report-repository";
import { AnalysisReportRepository } from "./repositories/analysis-report-repository";
import { AnalysisReportService } from "./services/analysis-report.service";
import { PositionsReportService } from "./services/positions-report.service";
import { CashflowReportService } from "./services/cashflow-report.service";
import { NoContractReportService } from "./services/nocontract-report.service";
import { RealizedReportService } from "./services/realized-report.service";
import { RealizedReportRepository } from "./repositories/realized-report-repository";
import { GeneralReportRepository } from "./repositories/general-report-repository";
import { GeneralReportService } from "./services/general-report.service";
import { CollaboratorsRepository } from "../collaborators/repositories/typeorm/collaborators-repository";
import { ReportsPdfController } from "./controllers/reports-pdf.controller";
import { AnalysisPDFService } from "./PDF-service/analysis-pdf.service";
import { CashflowPDFService } from "./PDF-service/cashflow-pdf.service";
import { NoContractPDFService } from "./PDF-service/nocontract-pdf.service";
import { PositionsPDFService } from "./PDF-service/positions-pdf.service";
import { RealizedPDFService } from "./PDF-service/realized-pdf.service";
import { GeneralPDFService } from "./PDF-service/general-pdf.service";

@Module({
  controllers: [ReportsController, ReportsPdfController],
  providers: [
    AnalysisReportService,
    PositionsReportService,
    CashflowReportService,
    NoContractReportService,
    RealizedReportService,
    PositionReportsRepository,
    CashFlowReportRepository,
    NoContractSuppliersReportRepository,
    AnalysisReportRepository,
    RealizedReportRepository,
    GeneralReportRepository,
    GeneralReportService,
    CollaboratorsRepository,
    AnalysisPDFService,
    CashflowPDFService,
    NoContractPDFService,
    PositionsPDFService,
    RealizedPDFService,
    GeneralPDFService,
  ],
  exports: [
    AnalysisReportService,
    PositionsReportService,
    CashflowReportService,
    NoContractReportService,
  ],
})
export class ReportsModule {}
