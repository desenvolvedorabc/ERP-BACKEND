import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { PaginateParams } from "src/common/utils/paginate-params.dto";
import { CreateFinancierDto } from "./dto/create-financier.dto";
import { UpdateFinancierDto } from "./dto/update-financier.dto";
import { FinanciersService } from "./financiers.service";
import { GenericOptions } from "src/common/DTOs/options.dto";
import { ParseNumericIdPipe } from "src/common/pipes/ParseNumericIdPipe ";
import { JwtOrBasicAuthGuard } from "src/common/guards/jwtOrBasicAuth.guard";

@Controller("financiers")
@ApiTags("Financiadores")
export class FinanciersController {
  constructor(private readonly financiersService: FinanciersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createFinancierDto: CreateFinancierDto): Promise<void> {
    return this.financiersService.create(createFinancierDto);
  }

  @Get("/options")
  @UseGuards(JwtOrBasicAuthGuard)
  getOptions(): Promise<GenericOptions[]> {
    return this.financiersService.getOptions();
  }

  @Get("nameOrCNPJ")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOneByNameOrCNPJ(@Query("nameOrCNPJ") nameOrCNPJ: string) {
    return this.financiersService.findOneByNameOrCNPJ(nameOrCNPJ);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@Query() params: PaginateParams) {
    return this.financiersService.findAll(params);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param("id", ParseNumericIdPipe) id: string) {
    return this.financiersService.findOne(+id);
  }

  @Patch(":id/toggle-active")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  toggleActive(@Param("id", ParseNumericIdPipe) id: string): Promise<void> {
    return this.financiersService.toggleActive(+id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param("id", ParseNumericIdPipe) id: string,
    @Body() updateFinancierDto: UpdateFinancierDto,
  ): Promise<void> {
    return this.financiersService.update(+id, updateFinancierDto);
  }
}
