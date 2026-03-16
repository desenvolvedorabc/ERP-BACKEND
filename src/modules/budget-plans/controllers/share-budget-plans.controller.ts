import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import {
  ShareBudgetPlanConsolidatedResultDto,
  ShareBudgetPlanDto,
} from "../dto/share-budget-plan.dto";
import { ValidateShareBudgetPlanDto } from "../dto/validate-share-budget-plan.dto";
import { ShareBudgetPlansService } from "../services/share-budget-plans.service";
import { TransactionInterceptor } from "src/common/interceptors/transaction.interceptor";

@Controller("share-budget-plans")
@ApiTags("Compartilhar Planos Orçamentários")
export class ShareBudgetPlansController {
  constructor(
    private readonly shareBudgetPlansService: ShareBudgetPlansService,
  ) {}

  @Post()
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() dto: ShareBudgetPlanDto): Promise<void> {
    return this.shareBudgetPlansService.create(dto);
  }

  @Post("/consolidated-result")
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createConsolidatedResult(
    @Body() dto: ShareBudgetPlanConsolidatedResultDto,
  ): Promise<void> {
    return this.shareBudgetPlansService.createConsolidatedResult(dto);
  }

  @Post("check-credentials")
  checkCredentials(
    @Body() dto: ValidateShareBudgetPlanDto,
  ): Promise<ValidateShareBudgetPlanDto> {
    return this.shareBudgetPlansService.checkCredentials(dto);
  }
}
