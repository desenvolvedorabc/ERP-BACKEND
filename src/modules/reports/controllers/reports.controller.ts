import { Controller, Get, Query, Res, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { ReportPositionParamsDTO } from "../dtos/reportFilterParams.dto";
import { TransformedDataForPosition } from "../types/positions";
import { AnalysisReportService } from "../services/analysis-report.service";
import { PositionsReportService } from "../services/positions-report.service";
import { CashflowReportService } from "../services/cashflow-report.service";
import { NoContractReportService } from "../services/nocontract-report.service";
import { RealizedReportService } from "../services/realized-report.service";
import { RealizedReportParamsDTO } from "../dtos/realizedReportFilterParams.dto";
import { GeneralReportParamsDTO } from "../dtos/generalReportParams.dto";
import { GeneralReportService } from "../services/general-report.service";
import { CollaboratorsRepository } from "../../collaborators/repositories/typeorm/collaborators-repository";
import { PaginateCollaboratorsParams } from "../../collaborators/dto/paginate-collaborators-params.dto";
/*
https://docs.nestjs.com/controllers#controllers
*/

@Controller("reports")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(
    private readonly analysisReportService: AnalysisReportService,
    private readonly cashflowReportService: CashflowReportService,
    private readonly noContractsReportService: NoContractReportService,
    private readonly positionReportService: PositionsReportService,
    private readonly realizedReportService: RealizedReportService,
    private readonly generalReportService: GeneralReportService,
    private readonly collaboratorsRepository: CollaboratorsRepository,
  ) {}

  @Get("position/receivables")
  async getReceivablesPositionReport(
    @Query() params: ReportPositionParamsDTO,
  ): Promise<TransformedDataForPosition> {
    return await this.positionReportService.getReceivablesPositionReport(
      params,
    );
  }

  @Get("position/payables")
  async getPayablesPositionReport(
    @Query() params: any,
  ): Promise<TransformedDataForPosition> {
    return await this.positionReportService.getPayablesPositionReport(params);
  }

  @Get("noContract")
  async getNoContractSuppliersReport(@Query() params: ReportPositionParamsDTO) {
    return await this.noContractsReportService.getNoContractSuppliersReport(
      params,
    );
  }

  @Get("cashflow")
  async getCashFlowReport(@Query() params: ReportPositionParamsDTO) {
    return await this.cashflowReportService.getCashFlowReport(params);
  }

  @Get("team")
  async getTeam(@Query() params: PaginateCollaboratorsParams) {
    return await this.collaboratorsRepository._findAll(params, true);
  }

  @Get("analysis/payables")
  async getPayablesAnalysisReport(@Query() params: ReportPositionParamsDTO) {
    return await this.analysisReportService.getAnalysisPayables(params);
  }

  @Get("analysis/receivables")
  async getReceivablesAnalysisReport(@Query() params: ReportPositionParamsDTO) {
    return await this.analysisReportService.getAnalysisReceivables(params);
  }

  @Get("realized")
  async getRealizedReport(@Query() params: RealizedReportParamsDTO) {
    return await this.realizedReportService.findAllForMonth(params);
  }

  @Get("cashflow/chart")
  async getCashFlowReportChart(@Query() params: ReportPositionParamsDTO) {
    return await this.cashflowReportService.getCashFlowReportForChart(params);
  }

  @Get("/analysis/chart")
  async chartAnalysis() {
    return await this.analysisReportService.chartReceivables();
  }

  @Get("/position/csv")
  async generatePositionCsv(
    @Query() params: ReportPositionParamsDTO,
    @Query("type") type: "p" | "r",
    @Res() res,
  ) {
    const { csvData } = await this.positionReportService.getPositionReportCSV(
      params,
      type,
    );

    const nameFile = `${Date.now()}-position_${type === "p" ? "payable" : "receivable"}.csv`;
    res.setHeader("Content-Disposition", `attachment; filename=${nameFile}`);
    res.send(csvData);
  }

  @Get("/analysis/csv")
  async generateAnalysisCsv(
    @Query() params: ReportPositionParamsDTO,
    @Query("type") type: "p" | "r",
    @Res() res,
  ) {
    const { csvData } = await this.analysisReportService.exportCSV(
      params,
      type,
    );

    const nameFile = `${Date.now()}-analysis_${type === "p" ? "payable" : "receivable"}.csv`;
    res.setHeader("Content-Disposition", `attachment; filename=${nameFile}`);
    res.send(csvData);
  }

  @Get("/cashflow/csv")
  async generateCashFlowCsv(
    @Query() params: ReportPositionParamsDTO,
    @Res() res,
  ) {
    const { csvData } = await this.cashflowReportService.getCashFlowCSV(params);

    const filename = "cashflow-report.csv";
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.send(csvData);
  }

  @Get("/general/csv")
  async generateGeneralCsv(
    @Query() params: GeneralReportParamsDTO,
    @Res() res,
  ) {
    const { csvData } = await this.generalReportService.exportCSV(params);

    const filename = "General.csv";
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.send(csvData);
  }

  @Get("/noContract/csv")
  async generateNoContractsReportCSV(
    @Query() params: ReportPositionParamsDTO,
    @Res() res,
  ) {
    const { csvData } =
      await this.noContractsReportService.getNoContractsCSV(params);

    const filename = "no-contracts-report.csv";
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.send(csvData);
  }

  @Get("/realized/csv")
  async generateRealizedCsv(
    @Query() params: RealizedReportParamsDTO,
    @Res() res,
  ) {
    const { csvData } = await this.realizedReportService.getCSV(params);

    const filename = "realized-report.csv";
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.send(csvData);
  }

  @Get("generalReport")
  async getGeneralReport(@Query() params: GeneralReportParamsDTO) {
    return await this.generalReportService.getGeneralReport(params);
  }
}
