import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
  UseInterceptors,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { BudgetResultsService } from "../services/budget-results.service";
import { CreateBudgetResultIPCADto } from "../dto/create-budget-result-ipca.dto";
import { CreateBudgetResultCAEDDto } from "../dto/create-budget-result-caed.dto";
import { SubCategoryReleaseType } from "src/modules/cost-centers/enum";
import { CreateBudgetResultPersonalExpensesDto } from "../dto/create-budget-result-personal-expenses.dto";
import { CreateBudgetResultLogisticsExpensesDto } from "../dto/create-budget-result-logistics-expenses.dto";
import { TransactionInterceptor } from "src/common/interceptors/transaction.interceptor";
import { ParseNumericIdPipe } from "src/common/pipes/ParseNumericIdPipe ";

@Controller("budget-results")
@ApiTags("Resultados dos Orçamentos")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BudgetResultsController {
  constructor(private readonly budgetResultsService: BudgetResultsService) {}

  @Post("/ipca")
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: "Rota para lançamentos de resultados com IPCA.",
  })
  createResultIPCA(@Body() dto: CreateBudgetResultIPCADto): Promise<void> {
    return this.budgetResultsService.createMany({
      ...dto,
      releaseType: SubCategoryReleaseType.IPCA,
    });
  }

  @ApiOperation({
    summary: "Rota para lançamentos de resultados do tipo CAED.",
  })
  @Post("/caed")
  @UseInterceptors(TransactionInterceptor)
  createResultCAED(@Body() dto: CreateBudgetResultCAEDDto): Promise<void> {
    return this.budgetResultsService.createMany({
      ...dto,
      releaseType: SubCategoryReleaseType.CAED,
    });
  }

  @ApiOperation({
    summary: "Rota para lançamentos de resultados de despesas pessoais.",
  })
  @Post("/personal-expenses")
  @UseInterceptors(TransactionInterceptor)
  createResultPersonalExpenses(
    @Body() dto: CreateBudgetResultPersonalExpensesDto,
  ): Promise<void> {
    return this.budgetResultsService.createMany({
      ...dto,
      releaseType: SubCategoryReleaseType.DESPESAS_PESSOAIS,
    });
  }

  @ApiOperation({
    summary: "Rota para lançamentos de resultados de despesas logísticas.",
  })
  @Post("/logistics-expenses")
  @UseInterceptors(TransactionInterceptor)
  createResultLogisticsExpenses(
    @Body() dto: CreateBudgetResultLogisticsExpensesDto,
  ): Promise<void> {
    return this.budgetResultsService.createMany({
      ...dto,
      releaseType: SubCategoryReleaseType.DESPESAS_LOGISTICAS,
    });
  }

  @Get("/logistics-expenses/:budgetId/:categoryId")
  getResultLogisticsExpenses(
    @Param("categoryId") categoryId: string,
    @Param("budgetId") budgetId: string,
  ) {
    return this.budgetResultsService.getResultLogisticsExpensesByCategory(
      +budgetId,
      +categoryId,
    );
  }

  @Get("/all-by-budget-and-sub-category/:budgetId/:subCategoryId")
  getResultsByBudgetIdAndSubCategoryId(
    @Param("budgetId") budgetId: string,
    @Param("subCategoryId") subCategoryId: string,
  ) {
    return this.budgetResultsService.getManyByBudgetIdAndSubCategoryId(
      +budgetId,
      +subCategoryId,
    );
  }

  @Get("/all-last-year/:budgetId/:subCategoryId")
  getResultsLastYear(
    @Param("budgetId") budgetId: string,
    @Param("subCategoryId") subCategoryId: string,
  ) {
    return this.budgetResultsService.getManyLastYear(+budgetId, +subCategoryId);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param("id", ParseNumericIdPipe) id: string): Promise<void> {
    return this.budgetResultsService.remove(+id);
  }
}
