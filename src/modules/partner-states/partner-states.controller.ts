import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { PartnerStatesService } from "./partner-states.service";
import { CreatePartnerStateDto } from "./dto/create-partner-state.dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { ShareBasicAuthGuard } from "src/common/guards/share-basic-auth.guard";
import { ParseNumericIdPipe } from "src/common/pipes/ParseNumericIdPipe ";
import { JwtOrBasicAuthGuard } from "src/common/guards/jwtOrBasicAuth.guard";

@Controller("partner-states")
@ApiTags("Estados Parceiros")
export class PartnerStatesController {
  constructor(private readonly partnerStatesService: PartnerStatesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createPartnerStateDto: CreatePartnerStateDto): Promise<void> {
    return this.partnerStatesService.create(createPartnerStateDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll() {
    return this.partnerStatesService.findAll();
  }

  @Get("options")
  @UseGuards(JwtOrBasicAuthGuard)
  findAllOptions() {
    return this.partnerStatesService.getOptions();
  }

  @Get("/all/shared")
  @UseGuards(ShareBasicAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Rota compartilhada para visualizar os estados parceiros.",
  })
  findAllShared() {
    return this.partnerStatesService.findAll();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param("id", ParseNumericIdPipe) id: string) {
    return this.partnerStatesService.findOne(+id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param("id", ParseNumericIdPipe) id: string): Promise<void> {
    return this.partnerStatesService.remove(+id);
  }
}
