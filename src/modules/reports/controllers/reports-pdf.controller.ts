/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Query, Res, UseGuards } from "@nestjs/common";
import { AnalysisPDFService } from "../PDF-service/analysis-pdf.service";
import { CashflowPDFService } from "../PDF-service/cashflow-pdf.service";
import { NoContractPDFService } from "../PDF-service/nocontract-pdf.service";
import { PositionsPDFService } from "../PDF-service/positions-pdf.service";
import { RealizedPDFService } from "../PDF-service/realized-pdf.service";
import { GeneralPDFService } from "../PDF-service/general-pdf.service";
import { ReportPositionParamsDTO } from "../dtos/reportFilterParams.dto";
import { RealizedReportParamsDTO } from "../dtos/realizedReportFilterParams.dto";
import { GeneralReportParamsDTO } from "../dtos/generalReportParams.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";

@Controller("reports")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsPdfController {
  constructor(
    private readonly analysisPDFService: AnalysisPDFService,
    private readonly cashflowPDFService: CashflowPDFService,
    private readonly noContractsPDFService: NoContractPDFService,
    private readonly positionPDFService: PositionsPDFService,
    private readonly realizedPDFService: RealizedPDFService,
    private readonly generalPDFService: GeneralPDFService,
  ) {}

  @Get("pdf/analysis")
  async generatePDFAnalysis(
    @Query() params: ReportPositionParamsDTO,
    @Query("type") type: "p" | "r",
    @Res() res,
  ) {
    const pdfBuffer = await this.analysisPDFService.getPDF(params, type);

    const nameFile = `${Date.now()}-analysis.pdf`;
    this.sendResponse(res, pdfBuffer, nameFile);
  }

  @Get("pdf/cashflow")
  async generatePDFCashFlow(
    @Query() params: ReportPositionParamsDTO,
    @Res() res,
  ) {
    const pdfBuffer = await this.cashflowPDFService.getPDF(params);

    const nameFile = `${Date.now()}-cashFlow.pdf`;
    this.sendResponse(res, pdfBuffer, nameFile);
  }

  @Get("pdf/nocontracts")
  async generatePDFNoContraacts(
    @Query() params: ReportPositionParamsDTO,
    @Res() res,
  ) {
    const pdfBuffer = await this.noContractsPDFService.getPDF(params);

    const nameFile = `${Date.now()}-noContracts.pdf`;
    this.sendResponse(res, pdfBuffer, nameFile);
  }

  @Get("pdf/position")
  async generatePDFPosition(
    @Query() params: ReportPositionParamsDTO,
    @Query("type") type: "p" | "r",
    @Res() res,
  ) {
    const pdfBuffer = await this.positionPDFService.getPDF(params, type);

    const nameFile = `${Date.now()}-posicao-${type === "p" ? "pagamentos" : "recebimentos"}.pdf`;
    this.sendResponse(res, pdfBuffer, nameFile);
  }

  @Get("pdf/realized")
  async generatePDFRealized(
    @Query() params: RealizedReportParamsDTO,
    @Res() res,
  ) {
    const pdfBuffer = await this.realizedPDFService.getPDF(params);

    const nameFile = `${Date.now()}-realized.pdf`;
    this.sendResponse(res, pdfBuffer, nameFile);
  }

  @Get("pdf/general")
  async generatePDFGeneral(
    @Query() params: GeneralReportParamsDTO,
    @Res() res,
  ) {
    const pdfBuffer = await this.generalPDFService.getPDF(params);

    const nameFile = `${Date.now()}-general.pdf`;
    this.sendResponse(res, pdfBuffer, nameFile);
  }

  private sendResponse(res, pdfBuffer, nameFile) {
    res.setHeader("Content-Disposition", `attachment; filename=${nameFile}`);
    res.setHeader("Content-Type", "application/pdf");

    res.send(pdfBuffer);
  }
}
