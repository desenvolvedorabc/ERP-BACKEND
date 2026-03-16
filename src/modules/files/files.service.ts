/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, StreamableFile } from "@nestjs/common";
import { createReadStream, existsSync, unlink } from "fs";
import * as path from "path";
import { CreateFilesDTO } from "./dtos/createFile.dto";
import { updateFilesDTO } from "./dtos/updateFiles.dto";
import { Files } from "./entities/files.entity";
import { Tables } from "./enums";
import {
  CreatingFileError,
  DeletingFileError,
  InvalidFilePath,
  NotFoundFile,
} from "./errors";
import { FilesRepository } from "./repositories/files-repository";

@Injectable()
export class FilesService {
  constructor(private filesRepository: FilesRepository) {}

  async createMany(
    data: CreateFilesDTO,
    files: Array<Express.Multer.File>,
  ): Promise<void> {
    try {
      const mapedFiles = await Promise.all(
        files.map(async (file) => ({
          payableId: data.payableId,
          receivableId: data.receivableId,
          contractId: data.contractId,
          fileUrl: file.filename,
        })),
      );
      await this.filesRepository._create(mapedFiles);
    } catch (error) {
      throw new CreatingFileError();
    }
  }

  resolveFilePath(fileUrl: string): string {
    if (!fileUrl) {
      throw new NotFoundFile();
    }

    const uploadsDir = path.join(process.cwd(), "uploads");
    const resolvedPath = path.resolve(uploadsDir, fileUrl);

    if (!resolvedPath.startsWith(uploadsDir)) {
      throw new InvalidFilePath();
    }

    return resolvedPath;
  }

  downloadFile(resolvedPath: string): StreamableFile {
    this.verifyExists(resolvedPath);

    const file = createReadStream(resolvedPath);
    return new StreamableFile(file);
  }

  async updateFilesPayable(
    data: updateFilesDTO,
    files: Array<Express.Multer.File>,
  ): Promise<void> {
    try {
      if (data.currentFiles && data.currentFiles.length > 0) {
        await this.deleteIfRemoved(
          data.currentFiles,
          data.payableId,
          Tables.PAYABLES,
        );
      }

      if (files.length > 0)
        await this.createMany(new CreateFilesDTO(data.payableId), files);
    } catch (error) {
      console.error(error);
      throw new CreatingFileError();
    }
  }

  async updateFilesReceivable(
    data: updateFilesDTO,
    files: Array<Express.Multer.File>,
  ): Promise<void> {
    try {
      if (data.currentFiles && data.currentFiles.length > 0) {
        await this.deleteIfRemoved(
          data.currentFiles,
          data.receivableId,
          Tables.RECEIVABLES,
        );
      }
      if (files.length > 0)
        await this.createMany(
          new CreateFilesDTO(null, data.receivableId),
          files,
        );
    } catch (error) {
      throw new CreatingFileError();
    }
  }

  async updateFilesContracts(
    data: updateFilesDTO,
    files: Array<Express.Multer.File>,
  ): Promise<void> {
    try {
      if (data.currentFiles && data.currentFiles.length > 0) {
        await this.deleteIfRemoved(
          data.currentFiles,
          data.contractId,
          Tables.CONTRACTS,
        );
      }
      if (files.length > 0)
        await this.createMany(
          new CreateFilesDTO(null, null, data.contractId),
          files,
        );
    } catch (error) {
      console.error(error);
      throw new CreatingFileError();
    }
  }

  async deleteIfRemoved(
    data: Pick<Files, "id" | "fileUrl">[],
    id: number,
    table: Tables,
  ): Promise<void> {
    try {
      if (data && data.length > 0) {
        let affectedRows: Files[];
        switch (table) {
          case Tables.PAYABLES:
            affectedRows = await this.filesRepository._deleteByPayableId(
              id,
              data,
            );
            break;
          case Tables.RECEIVABLES:
            affectedRows = await this.filesRepository._deleteByReceivableId(
              id,
              data,
            );
            break;
          case Tables.CONTRACTS:
            affectedRows = await this.filesRepository._deleteByContractId(
              id,
              data,
            );
            break;
        }

        if (affectedRows.length > 0)
          affectedRows.map((row) => this.deleteFile(row.fileUrl));
      }
    } catch (error) {
      console.error(error);
      throw new DeletingFileError();
    }
  }

  private verifyExists(resolvedPath: string) {
    if (!existsSync(resolvedPath)) {
      throw new NotFoundFile();
    }
  }

  private deleteFile(path: string) {
    unlink(`./src/uploads/${path}`, (err) => {
      console.error(err);
    });
  }
}
