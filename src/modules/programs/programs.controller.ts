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
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { diskStorage } from "multer";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { fileFilter } from "src/common/utils/file-filter";
import { PaginateParams } from "src/common/utils/paginate-params.dto";
import { CreateProgramDto } from "./dto/create-program.dto";
import { optionsPrograms } from "./dto/optionsPrograms";
import { UpdateProgramDto } from "./dto/update-program.dto";
import { ProgramsService } from "./programs.service";
import { JwtOrBasicAuthGuard } from "src/common/guards/jwtOrBasicAuth.guard";
import { ParseNumericIdPipe } from "src/common/pipes/ParseNumericIdPipe ";

@Controller("programs")
@ApiTags("Programas")
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./public/programs",
        filename: (req, file, cb) => {
          return cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        return fileFilter([".png", ".jpeg", ".jpg"], req, file, cb);
      },
    }),
  )
  create(
    @Body() createProgramDto: CreateProgramDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<void> {
    return this.programsService.create(createProgramDto, file);
  }

  @Get("options")
  @UseGuards(JwtOrBasicAuthGuard)
  getOptionsSubCategories(): Promise<optionsPrograms[]> {
    return this.programsService.getOptions();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@Query() params: PaginateParams) {
    return this.programsService.findAll(params);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param("id", ParseNumericIdPipe) id: string) {
    return this.programsService.findOne(+id);
  }

  @Patch(":id/toggle-active")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  toggleActive(@Param("id", ParseNumericIdPipe) id: string): Promise<void> {
    return this.programsService.toggleActive(+id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./public/programs",
        filename: (req, file, cb) => {
          return cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        return fileFilter([".png", ".jpeg", ".jpg"], req, file, cb);
      },
    }),
  )
  update(
    @Param("id", ParseNumericIdPipe) id: string,
    @Body() updateProgramDto: UpdateProgramDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<void> {
    return this.programsService.update(+id, updateProgramDto, file);
  }

  @Get("/files/:file")
  seeUploadedAvatar(@Param("file") image: string, @Res() res) {
    return res.sendFile(image, { root: "./public/programs" });
  }
}
