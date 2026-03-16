// card-movimentation.controller.ts

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
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { CardMovService } from "../services/cardMov.service";
import { CardMovParams } from "../dtos/cardMov/paginateParamsCardMov.dto";
import { CardMovimentation } from "../entities/cardMovimentation.entity";
import { UpdateCardMovDTO } from "../dtos/cardMov/updateCreditCard";
import { CreateCardMovimentationDTO } from "../dtos/cardMov/createCardMov.dto";
import { ParseNumericIdPipe } from "src/common/pipes/ParseNumericIdPipe ";
import { TransactionInterceptor } from "src/common/interceptors/transaction.interceptor";
import { CardMovPDFService } from "../services/cardmov-pdf.service";

@Controller("card-movimentations")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CardMovimentationController {
  constructor(
    private readonly cardMovimentationService: CardMovService,
    private readonly cardMovimentationPDFService: CardMovPDFService,
  ) {}

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async create(@Body() data: CreateCardMovimentationDTO): Promise<void> {
    return await this.cardMovimentationService.create(data);
  }

  @Get()
  async findAll(@Query() params: CardMovParams): Promise<CardMovimentation[]> {
    return await this.cardMovimentationService.findAll(params);
  }

  @Get("csv")
  async generateCsv(@Query() params: CardMovParams, @Res() res) {
    const { csvData } =
      await this.cardMovimentationService.findAllInCsv(params);

    const nameFile = `${Date.now()}-movimentações.csv`;
    res.setHeader("Content-Disposition", `attachment; filename=${nameFile}`);
    res.send(csvData);
  }

  @Get("pdf")
  async generatePDF(@Query() params: CardMovParams, @Res() res) {
    const pdfBuffer = await this.cardMovimentationPDFService.getPDF(params);

    const nameFile = `${Date.now()}-movimentações.pdf`;
    res.setHeader("Content-Disposition", `attachment; filename=${nameFile}`);
    res.setHeader("Content-Type", "application/pdf");

    res.send(pdfBuffer);
  }

  @Get(":id")
  async findById(
    @Param("id", ParseNumericIdPipe) id: number,
  ): Promise<CardMovimentation> {
    return await this.cardMovimentationService.findById(id);
  }

  @Put(":id")
  async update(
    @Param("id", ParseNumericIdPipe) id: number,
    @Body() data: UpdateCardMovDTO,
  ): Promise<void> {
    return await this.cardMovimentationService.update(id, data);
  }

  @Delete(":uuid")
  async delete(@Param("uuid") uuid: string): Promise<void> {
    return await this.cardMovimentationService.delete(uuid);
  }

  @Post("process")
  @UseInterceptors(TransactionInterceptor)
  async processMovimentations(
    @Body() params: CardMovParams,
  ): Promise<{ payableId: number }> {
    return await this.cardMovimentationService.processMovimentations(params);
  }
}
