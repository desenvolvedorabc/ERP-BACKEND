/*
https://docs.nestjs.com/controllers#controllers
*/

// deploy

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { CreateReceivableDTO } from "./dto/createReceivable.dto";
import { ReceivablesPaginateParams } from "./dto/receivablePaginateParams.dto";
import { UpdateReceivableDTO } from "./dto/updateReceivable.dto";
import { Receivables } from "./entities/receivables.entity";
import { ReceivablesService } from "./services/receivables.service";
import { TransactionInterceptor } from "src/common/interceptors/transaction.interceptor";
import { ParseNumericIdPipe } from "src/common/pipes/ParseNumericIdPipe ";
import { UpdateInstallmentDTO } from "../installments/dto/updateInstallment.dto";
import { UpdateCategorizationDTO } from "../categorization/dto/updateCategorization.dto";
import { ReceivablePdfService } from "./services/receivable-pdf.service";

@Controller("receivables")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReceivablesController {
  constructor(
    private readonly receivablesService: ReceivablesService,
    private readonly receivablesPDFService: ReceivablePdfService,
  ) {}

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async create(
    @Body(ValidateTotalValuePipe) data: CreateReceivableDTO,
  ): Promise<number> {
    const receivable = await this.receivablesService.create(data);
    return receivable.id;
  }

  @Get("pdf")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async generatePDF(@Query() params: ReceivablesPaginateParams, @Res() res) {
    const pdfBuffer = await this.receivablesPDFService.getPDF(params);

    const nameFile = `${Date.now()}-receivables.pdf`;
    res.setHeader("Content-Disposition", `attachment; filename=${nameFile}`);
    res.setHeader("Content-Type", "application/pdf");

    res.send(pdfBuffer);
  }

  @Get("csv")
  async generateCsv(@Query() params: ReceivablesPaginateParams, @Res() res) {
    const { csvData } = await this.receivablesService.findAllInCsv(params);

    const nameFile = `${Date.now()}-receivables.csv`;
    res.setHeader("Content-Disposition", `attachment; filename=${nameFile}`);
    res.send(csvData);
  }

  @Get("/installments/:id")
  async getReceivableInstallmentsById(
    @Param("id", ParseNumericIdPipe) id: number,
  ) {
    return await this.receivablesService.findInstallmentsByReceivableId(id);
  }

  @Get(":id")
  async getById(
    @Param("id", ParseNumericIdPipe) id: number,
  ): Promise<Receivables> {
    return await this.receivablesService.findOneById(id);
  }

  @Get()
  async findAll(
    @Query() params: ReceivablesPaginateParams,
  ): Promise<Pagination<Receivables, IPaginationMeta>> {
    return await this.receivablesService.findAll(params);
  }

  @Put("/installments/:id")
  @UseInterceptors(TransactionInterceptor)
  async updateInstallmentsDate(
    @Param("id", ParseNumericIdPipe) id: number,
    @Body() data: UpdateInstallmentDTO[],
  ): Promise<void> {
    return await this.receivablesService.updateManyInstallmentsDate(id, data);
  }

  @Put(":id")
  @UseInterceptors(TransactionInterceptor)
  async update(
    @Param("id", ParseNumericIdPipe) id: number,
    @Body(ValidateTotalValuePipe) data: UpdateReceivableDTO,
  ): Promise<void> {
    await this.receivablesService.update(id, data);
  }

  @Put("category/:id")
  async updateCategory(
    @Param("id", ParseNumericIdPipe) id: number,
    @Body() data: UpdateCategorizationDTO,
  ): Promise<void> {
    await this.receivablesService.updateCategory(id, data);
  }

  @Delete(":id")
  async delete(@Param("id", ParseNumericIdPipe) id: number): Promise<void> {
    await this.receivablesService.delete(id);
  }
}
