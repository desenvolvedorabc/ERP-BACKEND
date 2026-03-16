import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { GetBudgetPlanId } from "src/common/decorators/get-budget-plan-id.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { ShareBasicAuthGuard } from "src/common/guards/share-basic-auth.guard";
import { CreateCostCenterCategoryDto } from "./dto/create-cost-center-category.dto";
import { CreateCostCenterSubCategoryDto } from "./dto/create-cost-center-sub-category.dto";
import { CreateCostCenterDto } from "./dto/create-cost-center.dto";
import { optionsCategories } from "./dto/optionsCategories";
import { optionsCostCenter } from "./dto/optionsCostCenter";
import { optionsSubCategories } from "./dto/optionsSubCategories";
import { UpdateCostCenterCategoryDto } from "./dto/update-cost-center-category.dto";
import { UpdateCostCenterSubCategoryDto } from "./dto/update-cost-center-sub-category.dto";
import { UpdateCostCenterDto } from "./dto/update-cost-center.dto";
import { CostCenterCategoriesService } from "./services/cost-center-categories.service";
import { CostCenterSubCategoriesService } from "./services/cost-center-sub-categories.service";
import { CostCentersService } from "./services/cost-centers.service";
import { JwtOrBasicAuthGuard } from "src/common/guards/jwtOrBasicAuth.guard";
import { ParseNumericIdPipe } from "src/common/pipes/ParseNumericIdPipe ";

@Controller("cost-centers")
@ApiTags("Centros de Custo")
export class CostCentersController {
  constructor(
    private readonly costCentersService: CostCentersService,
    private readonly costCenterCategoriesService: CostCenterCategoriesService,
    private readonly costCenterSubCategoriesService: CostCenterSubCategoriesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createCostCenter(@Body() createCostCenterDto: CreateCostCenterDto) {
    return this.costCentersService.create(createCostCenterDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAllCostCenter() {
    return this.costCentersService.findAll();
  }

  @Get("options")
  @UseGuards(JwtOrBasicAuthGuard)
  getOptionsCostCenter(): Promise<optionsCostCenter[]> {
    return this.costCentersService.getOptions();
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateCostCenter(
    @Param("id", ParseNumericIdPipe) id: number,
    @Body() updateCostCenterDto: UpdateCostCenterDto,
  ) {
    return this.costCentersService.update(id, updateCostCenterDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteCostCenter(@Param("id", ParseNumericIdPipe) id: number) {
    return this.costCentersService.delete(id);
  }

  @Get("/all-by-budget-plan/:budgetPlanId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getCostCenterByBudgetPlan(@Param("budgetPlanId") budgetPlanId: string) {
    return this.costCentersService.getManyByBudgetPlanId(+budgetPlanId);
  }

  @Get("/all-by-budget-plan/:budgetPlanId/shared")
  @UseGuards(ShareBasicAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Rota compartilhada para visualizar centros de custo de um plano orçamentário.",
  })
  async getCostCenterByBudgetPlanShared(
    @GetBudgetPlanId() budgetPlanId: string,
  ) {
    return this.costCentersService.getManyByBudgetPlanId(+budgetPlanId);
  }

  @Get("/all-active-by-budget-plan/:budgetPlanId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getCostCenterActiveByBudgetPlan(
    @Param("budgetPlanId") budgetPlanId: string,
  ) {
    return this.costCentersService.getManyActiveByBudgetPlanId(+budgetPlanId);
  }

  @Patch("/:id/toggle-active")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  toggleActiveCostCenter(
    @Param("id", ParseNumericIdPipe) id: string,
  ): Promise<void> {
    return this.costCentersService.toggleActive(+id);
  }

  @Post("/categories")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createCategory(@Body() createCategory: CreateCostCenterCategoryDto) {
    return this.costCenterCategoriesService.create(createCategory);
  }

  @Get("/categories")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAllCategory() {
    return this.costCenterCategoriesService.findAll();
  }

  @Get("/categories/options")
  @UseGuards(JwtOrBasicAuthGuard)
  getOptionsCategory(): Promise<optionsCategories[]> {
    return this.costCenterCategoriesService.getOptions();
  }

  @Put("/categories/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateCategory(
    @Param("id", ParseNumericIdPipe) id: number,
    @Body() updateCategory: UpdateCostCenterCategoryDto,
  ) {
    return this.costCenterCategoriesService.update(id, updateCategory);
  }

  @Delete("/categories/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteCategory(@Param("id", ParseNumericIdPipe) id: number) {
    return this.costCenterCategoriesService.delete(id);
  }

  @Patch("/categories/:id/toggle-active")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  toggleActiveCategory(
    @Param("id", ParseNumericIdPipe) id: string,
  ): Promise<void> {
    return this.costCenterCategoriesService.toggleActive(+id);
  }

  @Post("/categories/sub")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createSubCategory(@Body() data: CreateCostCenterSubCategoryDto) {
    console.log({ data });
    return this.costCenterSubCategoriesService.create(data);
  }

  @Get("/categories/sub")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAllSubCategory() {
    return this.costCenterSubCategoriesService.findAll();
  }

  @Get("/categories/sub/options")
  @UseGuards(JwtOrBasicAuthGuard)
  getOptionsSubCategories(): Promise<optionsSubCategories[]> {
    return this.costCenterSubCategoriesService.getOptions();
  }

  @Delete("/categories/sub/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteSubCategory(@Param("id", ParseNumericIdPipe) id: number) {
    return this.costCenterSubCategoriesService.delete(id);
  }

  @Patch("/categories/sub/:id/toggle-active")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  toggleActiveSubCategory(
    @Param("id", ParseNumericIdPipe) id: string,
  ): Promise<void> {
    return this.costCenterSubCategoriesService.toggleActive(+id);
  }

  @Put("/categories/sub/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateSubCategory(
    @Param("id", ParseNumericIdPipe) id: string,
    @Body() dto: UpdateCostCenterSubCategoryDto,
  ): Promise<void> {
    return this.costCenterSubCategoriesService.update(+id, dto);
  }
}
