import { TransactionInterceptor } from "./../../common/interceptors/transaction.interceptor";
/*
https://docs.nestjs.com/controllers#controllers
*/

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
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { ContractsService } from "./services/contracts.service";
import { CreateAditiveDTO } from "./dto/createAditive.dto";
import { CreateContractDTO } from "./dto/createContract.dto";
import { ContractPaginateParams } from "./dto/paginateParamsContract.dto";
import { UpdateContractDTO } from "./dto/UpdateContract.dto";
import { UpdateContractBancaryInfo } from "./dto/UpdateContractBancaryInfo";
import { Contracts } from "./entities/contracts.entity";
import { ParseNumericIdPipe } from "src/common/pipes/ParseNumericIdPipe ";
import { ContractsPdfService } from "./services/contracts-pdf.service";

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller("contracts")
export class ContractsController {
  constructor(
    private readonly contractsService: ContractsService,
    private readonly contractsPDFService: ContractsPdfService,
  ) {}

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async create(@Body() data: CreateContractDTO): Promise<number> {
    return await this.contractsService.create(data);
  }

  @Post("aditive")
  @UseInterceptors(TransactionInterceptor)
  async createAditive(@Body() data: CreateAditiveDTO): Promise<void> {
    await this.contractsService.createAditive(data);
  }

  @Get("csv")
  async findCSV(@Query() params: ContractPaginateParams, @Res() res) {
    const { csvData } = await this.contractsService.findCSV(params);

    const nameFile = `${Date.now()}-contratos.csv`;
    res.setHeader("Content-Disposition", `attachment; filename=${nameFile}`);
    res.send(csvData);
  }

  @Get("pdf")
  async generatePDF(@Query() params: ContractPaginateParams, @Res() res) {
    const pdfBuffer = await this.contractsPDFService.getPDF(params);

    const nameFile = `${Date.now()}-contracts.pdf`;
    res.setHeader("Content-Disposition", `attachment; filename=${nameFile}`);
    res.setHeader("Content-Type", "application/pdf");

    res.send(pdfBuffer);
  }

  @Get(":id")
  async getById(
    @Param("id", ParseNumericIdPipe) id: number,
  ): Promise<Contracts> {
    return await this.contractsService.findOneById(id);
  }

  @Get("history/:id")
  async getByPaymentHistoryId(
    @Param("id", ParseNumericIdPipe) id: number,
  ): Promise<Contracts> {
    return await this.contractsService.findPaymentHistory(id);
  }

  @Get()
  async findAll(@Query() params: ContractPaginateParams) {
    return await this.contractsService.findAll(params);
  }

  @Put(":id")
  @UseInterceptors(TransactionInterceptor)
  async update(
    @Param("id", ParseNumericIdPipe) id: number,
    @Body() data: UpdateContractDTO,
  ): Promise<void> {
    await this.contractsService.update(id, data);
  }

  @Put("bancaryInfo/:id")
  @UseInterceptors(TransactionInterceptor)
  async updateBancaryInfo(
    @Param("id", ParseNumericIdPipe) id: number,
    @Body() data: UpdateContractBancaryInfo,
  ): Promise<void> {
    await this.contractsService.updateBancaryInfo(id, data);
  }

  @Delete(":id")
  @UseInterceptors(TransactionInterceptor)
  async delete(@Param("id", ParseNumericIdPipe) id: number): Promise<void> {
    await this.contractsService.delete(id);
  }
}
