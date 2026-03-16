import { ContractsService } from "../contracts/services/contracts.service";
/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Response } from "express";
import * as mime from "mime-types";
import { diskStorage } from "multer";
import * as path from "path";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { CreateFilesDTO } from "./dtos/createFile.dto";
import { updateFilesDTO } from "./dtos/updateFiles.dto";
import { FilesService } from "./files.service";
import { TransactionInterceptor } from "src/common/interceptors/transaction.interceptor";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
@Controller("files")
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly contractsService: ContractsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  downloadFile(
    @Query("fileUrl") fileUrl: string,
    @Res({ passthrough: true }) res: Response,
  ): StreamableFile {
    const resolvedPath = this.filesService.resolveFilePath(fileUrl);

    const mimeType = mime.lookup(resolvedPath) || "application/octet-stream";

    res.set({
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${fileUrl.split(/-(.*)/)[1]}"`,
      "Access-Control-Expose-Headers": "Content-Disposition",
    });

    return this.filesService.downloadFile(resolvedPath);
  }

  @UseInterceptors(
    FilesInterceptor("files", undefined, {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (req, file, cb) => {
          return cb(null, `payables/${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @Post("payable")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createPayableFiles(
    @Body() data: CreateFilesDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<void> {
    return await this.filesService.createMany(data, files);
  }

  @UseInterceptors(
    FilesInterceptor("files", undefined, {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (req, file, cb) => {
          return cb(null, `receivables/${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @Post("receivable")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createReceivableFiles(
    @Body() data: CreateFilesDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<void> {
    return await this.filesService.createMany(data, files);
  }

  @UseInterceptors(
    FilesInterceptor("files", undefined, {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (req, file, cb) => {
          return cb(
            null,
            `contracts/anexos/${Date.now()}-${file.originalname}`,
          );
        },
      }),
    }),
  )
  @Post("contracts")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createContractFiles(
    @Body() data: CreateFilesDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<void> {
    return await this.filesService.createMany(data, files);
  }

  @UseInterceptors(
    TransactionInterceptor,
    FileInterceptor("file", {
      limits: { files: 1 },
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (req, file, cb) => {
          return cb(
            null,
            `contracts/signedContracts/${Date.now()}-${file.originalname}`,
          );
        },
      }),
    }),
  )
  @Post("contracts/signed")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createSignedContractFile(
    @Body() data: CreateFilesDTO,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    this.validateFileExists(file);
    return await this.contractsService.signContract(
      data.contractId,
      file,
      data.userId,
    );
  }

  @UseInterceptors(
    TransactionInterceptor,
    FileInterceptor("file", {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (req, file, cb) => {
          return cb(
            null,
            `contracts/settle/${Date.now()}-${file.originalname}`,
          );
        },
      }),
    }),
  )
  @Post("contracts/settle")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createSettleFile(
    @Body() data: CreateFilesDTO,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    this.validateFileExists(file);
    return await this.contractsService.settleContract(
      data.contractId,
      file,
      data.userId,
    );
  }

  @UseInterceptors(
    TransactionInterceptor,
    FileInterceptor("file", {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (req, file, cb) => {
          return cb(
            null,
            `contracts/withdrawal/${Date.now()}-${file.originalname}`,
          );
        },
      }),
    }),
  )
  @Post("contracts/withdrawal")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createWithdrawalFile(
    @Body() data: CreateFilesDTO,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    this.validateFileExists(file);
    return await this.contractsService.withdrawalContract(
      data.contractId,
      file,
      data.userId,
    );
  }

  @UseInterceptors(
    FilesInterceptor("files", undefined, {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (req, file, cb) => {
          return cb(null, `payables/${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @Put("payable")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updatePayableFiles(
    @Body() data: updateFilesDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<void> {
    return await this.filesService.updateFilesPayable(data, files);
  }

  @UseInterceptors(
    FilesInterceptor("files", undefined, {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (req, file, cb) => {
          return cb(null, `receivables/${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @Put("receivable")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateReceivableFiles(
    @Body() data: updateFilesDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<void> {
    return await this.filesService.updateFilesReceivable(data, files);
  }

  @UseInterceptors(
    FilesInterceptor("files", undefined, {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (req, file, cb) => {
          return cb(
            null,
            `contracts/anexos/${Date.now()}-${file.originalname}`,
          );
        },
      }),
    }),
  )
  @Put("contracts")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateContractsFiles(
    @Body() data: updateFilesDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<void> {
    return await this.filesService.updateFilesContracts(data, files);
  }

  private validateFileExists(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Arquivo anexado é obrigatório.");
    }
  }
}
