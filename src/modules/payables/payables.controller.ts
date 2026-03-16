/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { IPaginationMeta, Pagination } from "nestjs-typeorm-paginate";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { ValidateTotalValuePipe } from "../contracts/pipes/validateTotalValue.pipe";
import { ApprovalCredentialsDTO } from "./dto/approvals/approvalCredentials.dto";
import { ApproveDataDTO } from "./dto/approvals/approveData.dto";
import { ResponseApprovalDTO } from "./dto/approvals/responseApproval.dto";
import { CreatePayableDTO } from "./dto/payable/createPayable.dto";
import { PayablePaginateParams } from "./dto/payable/payablePaginateParams.dto";
import { UpdatePayableDTO } from "./dto/payable/updatePayable.dto";
import { Payables } from "./entities/payable.entity";
import { ApprovalsService } from "./services/approval.service";
import { PayableService } from "./services/payable.service";
import { TransactionInterceptor } from "src/common/interceptors/transaction.interceptor";
import { SelectedIdsPayablesDTO } from "./dto/payable/selectedIdsPayable.dto";
import { ExportCnabPayableService } from "./services/export-cnab.service";
import { ParseNumericIdPipe } from "src/common/pipes/ParseNumericIdPipe ";
import { UpdateInstallmentDTO } from "../installments/dto/updateInstallment.dto";
import { MassApprovalDataDTO } from "./dto/massApprovals/massApprovalData.dto";
import { ApprovalsParamsDTO } from "./dto/approvals/ApprovalsParams.dto";
import { UpdateCategorizationDTO } from "../categorization/dto/updateCategorization.dto";
import { PayablePdfService } from "./services/payable-pdf.service";

@Controller("payables")
export class PayablesController {
  constructor(
    private readonly payablesService: PayableService,
    private readonly payablesPDFService: PayablePdfService,
    private readonly approvalsService: ApprovalsService,
    private readonly exportCnabService: ExportCnabPayableService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiBearerAuth()
  async create(
    @Body(ValidateTotalValuePipe) data: CreatePayableDTO,
  ): Promise<number> {
    const payable = await this.payablesService.create(data);
    return payable.id;
  }

  @Get("csv")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async generateCsv(@Query() params: PayablePaginateParams, @Res() res) {
    const { csvData } = await this.payablesService.findAllInCsv(params);

    const nameFile = `${Date.now()}-payables.csv`;
    res.setHeader("Content-Disposition", `attachment; filename=${nameFile}`);
    res.send(csvData);
  }

  @Get("pdf")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async generatePDF(@Query() params: PayablePaginateParams, @Res() res) {
    const pdfBuffer = await this.payablesPDFService.getPDF(params);

    const nameFile = `${Date.now()}-payables.pdf`;
    res.setHeader("Content-Disposition", `attachment; filename=${nameFile}`);
    res.setHeader("Content-Type", "application/pdf");

    res.send(pdfBuffer);
  }

  @Get("/installments/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getPayableInstallmentsById(
    @Param("id", ParseNumericIdPipe) id: number,
  ) {
    return await this.payablesService.findInstallmentsByPayableId(id);
  }

  @Get("/massApproval")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAllForApprovals(
    @Query() params: ApprovalsParamsDTO,
  ): Promise<Pagination<Payables, IPaginationMeta>> {
    return await this.payablesService.findAllForApprovlas(params);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getById(
    @Param("id", ParseNumericIdPipe) id: number,
  ): Promise<Payables> {
    return await this.payablesService.findOneById(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll(
    @Query() params: PayablePaginateParams,
  ): Promise<Pagination<Payables, IPaginationMeta>> {
    return await this.payablesService.findAll(params);
  }

  @Put("installments/:id")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiBearerAuth()
  async updateInstallmentsDate(
    @Param("id", ParseNumericIdPipe) id: number,
    @Body() data: UpdateInstallmentDTO[],
  ): Promise<void> {
    return await this.payablesService.updateManyInstallmentsDate(id, data);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiBearerAuth()
  async update(
    @Param("id", ParseNumericIdPipe) id: number,
    @Body(ValidateTotalValuePipe) data: UpdatePayableDTO,
  ): Promise<void> {
    return await this.payablesService.update(id, data);
  }

  @Put("category/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateCategory(
    @Param("id", ParseNumericIdPipe) id: number,
    @Body() data: UpdateCategorizationDTO,
  ): Promise<void> {
    return await this.payablesService.updateCategory(id, data);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(TransactionInterceptor)
  async delete(@Param("id", ParseNumericIdPipe) id: number): Promise<void> {
    return await this.payablesService.delete(id);
  }

  @Post("/approveAccess")
  async verifyApprovalCredentials(
    @Body() data: ApprovalCredentialsDTO,
  ): Promise<ResponseApprovalDTO> {
    return await this.approvalsService.checkCredentials(data);
  }

  @Patch("/approve/:id")
  @UseInterceptors(TransactionInterceptor)
  async approvePayable(
    @Param("id", ParseNumericIdPipe) id: number,
    @Body() data: ApproveDataDTO,
  ): Promise<void> {
    return await this.approvalsService.approve(id, data);
  }

  @Patch("/massApproval")
  @UseInterceptors(TransactionInterceptor)
  async massApprovePayable(
    @Body("ids") ids: string[] | string,
    @Body("data") data: MassApprovalDataDTO,
  ): Promise<void> {
    const idsArray = Array.isArray(ids) ? ids.map(Number) : [Number(ids)];
    return await this.approvalsService.massApproval(idsArray, data);
  }

  @Get("/approve/:id")
  async getPayableForApprovation(
    @Param("id", ParseNumericIdPipe) id: number,
    @Query() data: ApprovalCredentialsDTO,
  ): Promise<Payables> {
    return await this.payablesService.findOneByIdForApproval(id, data);
  }

  @Post("export")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async exportCnab(@Body() data: SelectedIdsPayablesDTO) {
    return await this.exportCnabService.create(data);
  }
}
