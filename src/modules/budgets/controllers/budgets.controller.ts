import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import { CreateBudgetDto } from "../dto/create-budget.dto";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { PaginateParamsBudgets } from "../dto/paginate-params-budgets";
import { BudgetsService } from "../services/budgets.service";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { User } from "../../users/entities/user.entity";
import { ShareBasicAuthGuard } from "src/common/guards/share-basic-auth.guard";
import { GetBudgetPlanId } from "src/common/decorators/get-budget-plan-id.decorator";
import { TransactionInterceptor } from "src/common/interceptors/transaction.interceptor";
import { ParseNumericIdPipe } from "src/common/pipes/ParseNumericIdPipe ";

@Controller("budgets")
@ApiTags("Orçamentos")
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createBudgetDto: CreateBudgetDto, @GetUser() user: User) {
    return this.budgetsService.create(createBudgetDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@Query() dto: PaginateParamsBudgets) {
    return this.budgetsService.findAll(dto);
  }

  @Get("/all/shared")
  @UseGuards(ShareBasicAuthGuard)
  @ApiBearerAuth("basic")
  @ApiOperation({
    summary:
      "Rota compartilhada para pegar orçamentos de um plano orçamentário.",
  })
  findAllShared(
    @Query() dto: PaginateParamsBudgets,
    @GetBudgetPlanId() budgetPlanId: number,
  ) {
    return this.budgetsService.findAll({ ...dto, budgetPlanId });
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param("id", ParseNumericIdPipe) id: string) {
    return this.budgetsService.findOneWithResults(+id);
  }

  @Delete(":id")
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param("id", ParseNumericIdPipe) id: string): Promise<void> {
    return this.budgetsService.remove(+id);
  }
}
