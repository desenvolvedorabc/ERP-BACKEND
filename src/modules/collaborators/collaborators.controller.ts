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
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UseFilters,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { CollaboratorsService } from "./collaborators.service";
import { CompleteRegistrationCollaborator } from "./dto/complete-registration-collaborator";
import { CreateCollaboratorDto } from "./dto/create-collaborator.dto";
import { DisableCollaboratorDto } from "./dto/disable-collaborator.dto";
import { optionsCollaborators } from "./dto/optionsCollaborators.dto";
import { FoodCategoryOptionDto } from "./dto/food-category-options.dto";
import { PaginateCollaboratorsParams } from "./dto/paginate-collaborators-params.dto";
import { UpdateCollaboratorDto } from "./dto/update-collaborator.dto";
import { ResponseCollaborator } from "./repositories/typeorm/collaborators-repository";
import { JwtOrBasicAuthGuard } from "src/common/guards/jwtOrBasicAuth.guard";
import { ParseNumericIdPipe } from "src/common/pipes/ParseNumericIdPipe ";
import { CollaboratorDataResponseDto } from "./dto/collaborator-data-response.dto";
import { CollaboratorTimelineRowDto } from "./dto/collaborator-timeline-row.dto";
import { ApiOperation, ApiResponse, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { IPaginationMeta, Pagination } from "nestjs-typeorm-paginate";
import { ImportHistoryDTO } from "./dto/import-history.dto";
import { ImportCollaboratorHistoryService } from "./services/import-collaborator-history.service";
import { ImportCollaboratorsService } from "./services/import-collaborators.service";
import { MigrateOccupationAreaService } from "./services/migrate-occupation-area.service";
import { CollaboratorsExceptionFilter } from "./filters/collaborators-exception.filter";

@Controller("collaborators")
@ApiTags("Colaboradores")
export class CollaboratorsController {
  constructor(
    private readonly collaboratorsService: CollaboratorsService,
    private readonly importHistoryService: ImportCollaboratorHistoryService,
    private readonly importCollaboratorsService: ImportCollaboratorsService,
    private readonly migrateOccupationAreaService: MigrateOccupationAreaService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createCollaboratorDto: CreateCollaboratorDto): Promise<void> {
    return this.collaboratorsService.create(createCollaboratorDto);
  }

  @Post(":id/complete-registration")
  completeRegistration(
    @Param("id", ParseNumericIdPipe) id: string,
    @Body() completeRegistrationCollaborator: CompleteRegistrationCollaborator,
  ): Promise<void> {
    return this.collaboratorsService.completeRegistration(
      +id,
      completeRegistrationCollaborator,
    );
  }

  @Get("nameOrCPF")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOneByNameOrCPF(
    @Query("nameOrCPF") nameOrCPF: string,
    @Query("payableOrReceivableId") payableOrReceivableId?: number,
  ) {
    return this.collaboratorsService.findOneByNameOrCNPJ(
      nameOrCPF,
      payableOrReceivableId,
    );
  }

  @Get("/")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@Query() params: PaginateCollaboratorsParams) {
    return this.collaboratorsService.findAll(params);
  }

  @Get("/options")
  @UseGuards(JwtOrBasicAuthGuard)
  getOptions(): Promise<optionsCollaborators[]> {
    return this.collaboratorsService.getOptions();
  }

  @Get("/food-categories/options")
  @UseGuards(JwtOrBasicAuthGuard)
  getFoodCategoryOptions(): Promise<FoodCategoryOptionDto[]> {
    return this.collaboratorsService.getFoodCategoryOptions();
  }

  @Get("csv")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async generateCsv(@Query() params: PaginateCollaboratorsParams, @Res() res) {
    const { csvData } = await this.collaboratorsService.findAllInCsv(params);

    const nameFile = `${Date.now()}-collaborators.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=${nameFile}`);
    res.send(Buffer.from(csvData, "utf-8"));
  }

  @Post("import")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor("file"))
  @UseFilters(CollaboratorsExceptionFilter)
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary: "Importar colaboradores via CSV",
    description:
      "Permite importar colaboradores via arquivo CSV no mesmo formato da exportação. Apenas arquivos CSV são aceitos. Todas as colunas são obrigatórias; Remuneração e Histórico são importadas para a API sem alterar a tela. A importação apenas insere novos colaboradores - não atualiza existentes. Valida unicidade por CPF, Email e RG.",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description:
            "Arquivo CSV com dados de colaboradores. Deve ter as mesmas colunas da exportação. Apenas arquivos .csv são aceitos.",
        },
      },
      required: ["file"],
    },
  })
  @ApiResponse({
    status: 200,
    description: "Importação realizada",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        imported: { type: "number" },
        message: { 
          type: "string", 
          description: "Mensagem de status da importação. 'IMPORTAÇÃO PARCIALMENTE REALIZADA. VERIFIQUE OS DADOS INCONSISTENTES' quando há sucesso e erros, 'Importação realizada com sucesso' quando tudo foi importado, ou undefined quando não houve importações.",
          example: "IMPORTAÇÃO PARCIALMENTE REALIZADA. VERIFIQUE OS DADOS INCONSISTENTES"
        },
        isPartialImport: {
          type: "boolean",
          description: "Indica se a importação foi parcial (houve sucesso mas também erros). Quando true, a mensagem deve substituir a mensagem de erro genérica.",
          example: true
        },
        errors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              line: { type: "number", description: "Número da linha no arquivo (começando em 2, pois linha 1 é o cabeçalho)" },
              message: { type: "string", description: "Mensagem de erro descritiva" },
              rowData: {
                type: "object",
                description: "Dados originais da linha com erro (todos os campos do CSV/Excel)",
                additionalProperties: true,
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      "Erro ao processar arquivo (formato inválido, arquivo vazio ou dados inválidos)",
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado - Token JWT inválido ou ausente",
  })
  async importCollaborators(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{
    success: boolean;
    imported: number;
    message?: string;
    isPartialImport?: boolean;
    errors: Array<{
      line: number;
      message: string;
      rowData: Record<string, any>;
    }>;
  }> {
    if (!file) {
      throw new BadRequestException("Arquivo é obrigatório.");
    }
    return this.importCollaboratorsService.importCollaborators(file);
  }

  @Get("data")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Consultar dados cadastrais de colaboradores",
    description:
      "Retorna os dados cadastrais de todos os colaboradores no mesmo formato disponível na exportação Excel, com paginação. Requer autenticação JWT.",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de colaboradores retornada com sucesso (paginada)",
    type: [CollaboratorDataResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado - Token JWT inválido ou ausente",
  })
  @ApiResponse({
    status: 404,
    description: "Nenhum colaborador encontrado",
  })
  async findAllData(
    @Query() params: PaginateCollaboratorsParams,
  ): Promise<{ data: CollaboratorDataResponseDto[]; meta: IPaginationMeta }> {
    return this.collaboratorsService.findAllData(params);
  }

  @Get("/timeline/csv")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Exportar histórico de colaboradores em CSV tabular por período",
    description:
      "Exporta o histórico de colaboradores em formato CSV tabular (linha do tempo), com uma linha por período por colaborador. Ideal para importação em ferramentas de BI como BigQuery.",
  })
  @ApiResponse({
    status: 200,
    description: "CSV com timeline de colaboradores exportado com sucesso",
    type: [CollaboratorTimelineRowDto],
  })
  @ApiResponse({
    status: 404,
    description: "Nenhum colaborador encontrado",
  })
  async generateTimelineCsv(
    @Query() params: PaginateCollaboratorsParams,
    @Res() res,
  ) {
    const { csvData } =
      await this.collaboratorsService.findAllTimelineCsv(params);

    const nameFile = `${Date.now()}-collaborators-timeline.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=${nameFile}`);
    res.send(Buffer.from(csvData, "utf-8"));
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(
    @Param("id", ParseNumericIdPipe) id: string,
  ): Promise<ResponseCollaborator> {
    return this.collaboratorsService.findOne(+id);
  }

  @Get(":id/check-first-three-numbers-cpf/:cpf")
  checkFirstThreeNumbersOfTheCPF(
    @Param("id", ParseNumericIdPipe) id: string,
    @Param("cpf") cpf: string,
  ): Promise<ResponseCollaborator> {
    return this.collaboratorsService.checkFirstThreeNumbersOfTheCPF(+id, cpf);
  }

  @Patch(":id/toggle-active")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  toggleActive(
    @Param("id", ParseNumericIdPipe) id: string,
    @Body() dto: DisableCollaboratorDto,
  ): Promise<void> {
    return this.collaboratorsService.toggleActive(+id, dto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param("id", ParseNumericIdPipe) id: string,
    @Body() updateCollaboratorDto: UpdateCollaboratorDto,
  ): Promise<void> {
    return this.collaboratorsService.update(+id, updateCollaboratorDto);
  }

  @Post("history/import")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary: "Importar histórico de colaboradores via CSV/Excel",
    description:
      "Permite importar dados históricos anteriores à implementação via arquivo CSV/Excel no padrão estabelecido, alimentando a base retroativamente.",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description:
            "Arquivo CSV ou Excel (XLSX) com dados históricos. Colunas esperadas: collaboratorId (ou cpf/email), changedField, previousRole, newRole, previousStartOfContract, newStartOfContract, previousRemuneration, newRemuneration, previousActive, newActive, previousDisableBy, newDisableBy, createdAt (opcional)",
        },
      },
      required: ["file"],
    },
  })
  @ApiResponse({
    status: 200,
    description: "Importação realizada com sucesso",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        imported: { type: "number" },
        errors: { type: "array", items: { type: "string" } },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Erro ao processar arquivo ou dados inválidos",
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado - Token JWT inválido ou ausente",
  })
  async importHistory(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ success: boolean; imported: number; errors: string[] }> {
    if (!file) {
      throw new Error("Arquivo é obrigatório.");
    }
    return this.importHistoryService.importHistory(file);
  }

  @Post("history/migrate-occupation-area")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Migrar Área de Atuação no histórico legado",
    description:
      "Popula retroativamente o campo 'newOccupationArea' (Programa/Área de Atuação) em todos os registros de histórico que não possuem essa informação. Usa o valor atual do colaborador como referência. Execute este endpoint uma única vez após a atualização do sistema para garantir que o BI possa calcular custos por programa desde o início do contrato.",
  })
  @ApiResponse({
    status: 200,
    description: "Migração concluída",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        updated: { type: "number", description: "Quantidade de registros atualizados" },
        skipped: { type: "number", description: "Quantidade de registros ignorados (colaborador sem área de atuação)" },
        message: { type: "string" },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Não autorizado - Token JWT inválido ou ausente",
  })
  async migrateOccupationArea(): Promise<{
    success: boolean;
    updated: number;
    skipped: number;
    message: string;
  }> {
    return this.migrateOccupationAreaService.migrateOccupationArea();
  }
}
