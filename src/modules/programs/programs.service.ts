import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InternalServerError } from "src/common/errors";
import { deleteFile } from "src/common/utils/delete-file";
import { PaginateParams } from "src/common/utils/paginate-params.dto";
import { CreateProgramDto } from "./dto/create-program.dto";
import { optionsPrograms } from "./dto/optionsPrograms";
import { UpdateProgramDto } from "./dto/update-program.dto";
import { ProgramsRepository } from "./repositories/typeorm/programs-repository";

@Injectable()
export class ProgramsService {
  constructor(private readonly programsRepository: ProgramsRepository) {}

  async create(
    createProgramDto: CreateProgramDto,
    file?: Express.Multer.File,
  ): Promise<void> {
    await this.verifyExistsProgram(createProgramDto.abbreviation);

    try {
      await this.programsRepository._create({
        ...createProgramDto,
        logo: file?.filename,
      });
    } catch (e) {
      throw new InternalServerError();
    }
  }

  findAll(params: PaginateParams) {
    return this.programsRepository._findAll(params);
  }

  async findOne(id: number) {
    const { program } = await this.programsRepository._findOneById(id);

    if (!program) {
      throw new NotFoundException("Programa não encontrado.");
    }

    return {
      program,
    };
  }

  async getOptions(): Promise<optionsPrograms[]> {
    return await this.programsRepository._findOptions();
  }

  async toggleActive(id: number): Promise<void> {
    const { program } = await this.findOne(id);

    try {
      await this.programsRepository._update(id, {
        active: !program.active,
      });
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async update(
    id: number,
    updateProgramDto: UpdateProgramDto,
    file?: Express.Multer.File,
  ): Promise<void> {
    const { program } = await this.findOne(id);

    if (
      updateProgramDto?.abbreviation &&
      updateProgramDto.abbreviation !== program.abbreviation
    ) {
      await this.verifyExistsProgram(updateProgramDto.abbreviation);
    }

    const logo = file?.filename ?? program.logo;

    try {
      await this.programsRepository._update(id, {
        ...updateProgramDto,
        logo,
      });

      if (file?.filename && program.logo) {
        deleteFile(`programs/${program.logo}`);
      }
    } catch (e) {
      throw new InternalServerError();
    }
  }

  private async verifyExistsProgram(abbreviation: string): Promise<void> {
    const { program: findProgram } =
      await this.programsRepository._findByAbbreviation(abbreviation);

    if (findProgram) {
      throw new ConflictException(
        "Atenção! Já existe um programa cadastrado com essa Sigla.",
      );
    }
  }
}
