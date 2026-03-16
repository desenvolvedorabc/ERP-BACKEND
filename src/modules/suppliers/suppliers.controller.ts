import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { PaginateSuppliersParams } from "./dto/paginate-suppliers-params.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { SuppliersService } from "./suppliers.service";
import { GenericOptions } from "src/common/DTOs/options.dto";
import { ParseNumericIdPipe } from "src/common/pipes/ParseNumericIdPipe ";
import { JwtOrBasicAuthGuard } from "src/common/guards/jwtOrBasicAuth.guard";

@Controller("suppliers")
@ApiTags("Fornecedores")
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createSupplierDto: CreateSupplierDto): Promise<void> {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@Query() params: PaginateSuppliersParams) {
    return this.suppliersService.findAll(params);
  }

  @Get("/options")
  @UseGuards(JwtOrBasicAuthGuard)
  getOptions(): Promise<GenericOptions[]> {
    return this.suppliersService.getOptions();
  }

  @Get("nameOrCNPJ")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOneByNameOrCNPJ(
    @Query("nameOrCNPJ") nameOrCNPJ: string,
    @Query("payableOrReceivableId") payableOrReceivableId?: number,
  ) {
    return this.suppliersService.findOneByNameOrCNPJ(
      nameOrCNPJ,
      payableOrReceivableId,
    );
  }

  @Get("csv")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async generateCsv(@Query() params: PaginateSuppliersParams, @Res() res) {
    const { csvData } = await this.suppliersService.findAllInCsv(params);

    const nameFile = `${Date.now()}-suppliers.csv`;
    res.setHeader("Content-Disposition", `attachment; filename=${nameFile}`);
    res.send(csvData);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param("id", ParseNumericIdPipe) id: string) {
    return this.suppliersService.findOne(+id);
  }

  @Patch(":id/toggle-active")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  toggleActive(@Param("id", ParseNumericIdPipe) id: string): Promise<void> {
    return this.suppliersService.toggleActive(+id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(
    @Param("id", ParseNumericIdPipe) id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ): Promise<void> {
    return await this.suppliersService.update(+id, updateSupplierDto);
  }
}
