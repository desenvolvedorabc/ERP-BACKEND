import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  Body,
  Post,
  UseInterceptors,
  Delete,
} from "@nestjs/common";
import { BankReconciliationService } from "./bank-reconciliation.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { InstallmentsParamsDTO } from "../installments/dto/installmentsParams.dto";
import { InstallmentsService } from "../installments/installments.service";
import { CreateBankReconciliationDTO } from "./dtos/bank-reconciliation.dto";
import { CreateBankRecordApiDTO } from "./dtos/bank-record-api.dto";
import { TransactionInterceptor } from "src/common/interceptors/transaction.interceptor";
import { CreateReconciliationResponseDTO } from "./dtos/create-reconciliation-response.dto";
import { DueBetweenDTO } from "src/common/DTOs/dueBetween.dto";
import { ParseNumericIdPipe } from "src/common/pipes/ParseNumericIdPipe ";

@Controller("bank-reconciliation")
@ApiTags("Bank Reconciliation")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BankReconciliationController {
  constructor(
    private readonly bankReconciliationService: BankReconciliationService,
    private readonly installmentsService: InstallmentsService,
  ) {}

  @Get("/search")
  async findAll(@Query() params: InstallmentsParamsDTO) {
    return await this.installmentsService.findAll(params);
  }

  @Get(":id")
  @ApiQuery({ name: "start", type: String, example: "2024-10-23" })
  @ApiQuery({ name: "end", type: String, example: "2024-11-23" })
  findOne(
    @Param("id", ParseNumericIdPipe) id: number,
    @Query() period: DueBetweenDTO,
  ) {
    return this.bankReconciliationService.findOne(id, period);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async create(
    @Body("dataRecordAPI") dataRecordAPI: CreateBankRecordApiDTO,
    @Body("dataReconciliation") dataReconciliation: CreateBankReconciliationDTO,
  ): Promise<CreateReconciliationResponseDTO> {
    return await this.bankReconciliationService.createConciliation(
      dataRecordAPI,
      dataReconciliation,
    );
  }

  @Delete(":id")
  async delete(@Param("id", ParseNumericIdPipe) id: number) {
    return await this.bankReconciliationService.deleteConciliation(id);
  }
}
