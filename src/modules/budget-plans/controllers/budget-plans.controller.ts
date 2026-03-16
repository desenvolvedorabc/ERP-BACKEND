import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { createReadStream } from "node:fs";
import { join } from "node:path";
import { GetBudgetPlanId } from "src/common/decorators/get-budget-plan-id.decorator";
import { GetBudgetPlanIds } from "src/common/decorators/get-budget-plan-ids.decorator";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { ShareBasicAuthGuard } from "src/common/guards/share-basic-auth.guard";
import { User } from "../../users/entities/user.entity";
import { CreateBudgetPlanDto } from "../dto/create-budget-plan.dto";
import { CreateSceneryDto } from "../dto/create-scenery.dto";
import { ExportCsvSharedDto } from "../dto/export-csv-shared.dto";
import { optionsBudgetPlan } from "../dto/optionsBudgetPlan.dto";
import { PaginateParamsBudgetPlans } from "../dto/paginate-params-budget-plans";
import { BudgetPlansService } from "../services/budget-plans.service";
import { TransactionInterceptor } from "src/common/interceptors/transaction.interceptor";
import { JwtOrBasicAuthGuard } from "src/common/guards/jwtOrBasicAuth.guard";
import { ParseNumericIdPipe } from "src/common/pipes/ParseNumericIdPipe ";

@Controller("budget-plans")
@ApiTags("Planos Orçamentários")
export class BudgetPlansController {
  constructor(private readonly budgetPlansService: BudgetPlansService) {}

  @Post()
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @Body() createBudgetPlanDto: CreateBudgetPlanDto,
    @GetUser() user: User,
  ) {
    return this.budgetPlansService.create(createBudgetPlanDto, user.id);
  }

  @Post("/scenery")
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createScenery(@Body() dto: CreateSceneryDto, @GetUser() user: User) {
    return this.budgetPlansService.createScenery(dto, user.id);
  }

  @Post("/:id/start-calibration")
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  startCalibration(
    @Param("id", ParseNumericIdPipe) id: string,
    @GetUser() user: User,
  ) {
    return this.budgetPlansService.startCalibration(+id, user.id);
  }

  @Get("/")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@Query() params: PaginateParamsBudgetPlans) {
    return this.budgetPlansService.findAll(params);
  }

  @Get("options")
  @UseGuards(JwtOrBasicAuthGuard)
  async getOptions(): Promise<optionsBudgetPlan[]> {
    return this.budgetPlansService.getOptions();
  }

  @Get("/consolidated-result")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  consolidatedResult(@Query() params: PaginateParamsBudgetPlans) {
    return this.budgetPlansService.consolidatedResult(
      params?.year,
      params?.programId,
    );
  }

  @Get("/consolidated-result/shared")
  @UseGuards(ShareBasicAuthGuard)
  @ApiBearerAuth()
  consolidatedResultShared(@GetBudgetPlanIds() ids: number[]) {
    return this.budgetPlansService.consolidatedResultShared(ids);
  }

  @Get("/consolidated-result/csv")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  consolidatedResultForCsv(
    @Query() params: PaginateParamsBudgetPlans,
    @GetUser() user: User,
  ) {
    this.budgetPlansService.consolidatedResultForCsv(params, user.email);
  }

  @Get("/consolidated-result/csv/shared")
  @UseGuards(ShareBasicAuthGuard)
  @ApiBearerAuth()
  consolidatedResultSharedCsv(
    @GetBudgetPlanIds() ids: number[],
    @Query() params: ExportCsvSharedDto,
  ) {
    this.budgetPlansService.formatAndSendEmailResultForCsv(params.email, ids);
  }

  @Get("/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param("id", ParseNumericIdPipe) id: string) {
    return this.budgetPlansService.findOne(+id);
  }

  @Get("/:id/shared")
  @UseGuards(ShareBasicAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Rota compartilhada para visualizar um plano orçamentário.",
  })
  findOneShared(@GetBudgetPlanId() id: string) {
    return this.budgetPlansService.findOne(+id, ["program"]);
  }

  @Get("/:id/insights")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  insightsForLastFiveYears(@Param("id", ParseNumericIdPipe) id: string) {
    return this.budgetPlansService.insightsForLastFiveYears(+id);
  }

  @Get("/:id/insights/shared")
  @UseGuards(ShareBasicAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Rota compartilhada para ver insights de um plano orçamentário.",
  })
  insightsForLastFiveYearsShared(@GetBudgetPlanId() id: string) {
    return this.budgetPlansService.insightsForLastFiveYears(+id);
  }

  @Get("/:id/generate-csv")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async generateCsv(
    @Param("id", ParseNumericIdPipe) id: string,
    @GetUser() user: User,
  ): Promise<void> {
    this.budgetPlansService.generateCsv(+id, user.email);
  }

  @Get("/:id/generate-csv/shared")
  @UseGuards(ShareBasicAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Rota compartilhada para exportar um plano orçamentário.",
  })
  async generateCsvShared(
    @GetBudgetPlanId() id: string,
    @Query() params: ExportCsvSharedDto,
  ): Promise<void> {
    this.budgetPlansService.generateCsv(+id, params.email);
  }

  @Patch("/:id/approve")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiBearerAuth()
  toApprove(
    @Param("id", ParseNumericIdPipe) id: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.budgetPlansService.toApprove(+id, user.id);
  }

  @Delete("/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param("id", ParseNumericIdPipe) id: string): Promise<void> {
    return this.budgetPlansService.remove(+id);
  }

  @Get("/download-file/:filepath")
  seeUploadedFile(@Param("filepath") file: string, @Res() res) {
    const fileRead = createReadStream(
      join(process.cwd(), "public", "budget-plans", file),
    );

    res.setHeader("Content-Disposition", `attachment; filename=${file}`);
    res.setHeader("Content-Type", "application/csv");
    fileRead.pipe(res);
  }
}
