import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { PartnerMunicipalitiesService } from "./partner-municipalities.service";
import { CreatePartnerMunicipalityDto } from "./dto/create-partner-municipality.dto";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { PaginateParams } from "src/common/utils/paginate-params.dto";
import { ShareBasicAuthGuard } from "src/common/guards/share-basic-auth.guard";
import { ParseNumericIdPipe } from "src/common/pipes/ParseNumericIdPipe ";
import { JwtOrBasicAuthGuard } from "src/common/guards/jwtOrBasicAuth.guard";

@Controller("partner-municipalities")
@ApiTags("Municípios Parceiros")
export class PartnerMunicipalitiesController {
  constructor(
    private readonly partnerMunicipalitiesService: PartnerMunicipalitiesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @Body() createPartnerMunicipalityDto: CreatePartnerMunicipalityDto,
  ): Promise<void> {
    return this.partnerMunicipalitiesService.create(
      createPartnerMunicipalityDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@Query() params: PaginateParams) {
    return this.partnerMunicipalitiesService.findAll(params);
  }

  @Get("options")
  @UseGuards(JwtOrBasicAuthGuard)
  findAllOptions() {
    return this.partnerMunicipalitiesService.getOptions();
  }

  @Get("/all/shared")
  @UseGuards(ShareBasicAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Rota compartilhada para visualizar os municípios parceiros.",
  })
  findAllShared(@Query() params: PaginateParams) {
    return this.partnerMunicipalitiesService.findAll(params);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param("id", ParseNumericIdPipe) id: string) {
    return this.partnerMunicipalitiesService.findOne(+id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param("id", ParseNumericIdPipe) id: string): Promise<void> {
    return this.partnerMunicipalitiesService.remove(+id);
  }
}
