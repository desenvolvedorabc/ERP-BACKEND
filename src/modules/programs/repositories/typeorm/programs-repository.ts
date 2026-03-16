import { Injectable } from "@nestjs/common";
import { paginateData } from "src/common/utils/paginate-data";
import { PaginateParams } from "src/common/utils/paginate-params.dto";
import { DataSource } from "typeorm";
import { CreateProgramDto } from "../../dto/create-program.dto";
import { optionsPrograms } from "../../dto/optionsPrograms";
import { Program } from "../../entities/program.entity";
import { BaseRepository } from "src/database/typeorm/base-repository";

@Injectable()
export class ProgramsRepository extends BaseRepository<Program> {
  constructor(dataSource: DataSource) {
    super(Program, dataSource);
  }

  async _create(createProgramDto: CreateProgramDto): Promise<Program> {
    const { name, abbreviation, director, logo, description } =
      createProgramDto;
    const program = this.getRepository(Program).create({
      name,
      abbreviation,
      director,
      logo,
      description,
    });

    return await this.getRepository(Program).save(program);
  }

  async _findOneById(id: number): Promise<{ program: Program | null }> {
    const program = await this.getRepository(Program).findOne({
      where: {
        id,
      },
    });

    return {
      program,
    };
  }

  async _findOptions(): Promise<optionsPrograms[]> {
    return await this.getRepository(Program).find({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async _findByAbbreviation(
    abbreviation: string,
  ): Promise<{ program: Program | null }> {
    const program = await this.getRepository(Program).findOne({
      where: {
        abbreviation,
      },
    });

    return {
      program,
    };
  }

  async _update(id: number, data: Partial<Program>): Promise<void> {
    await this.getRepository(Program).update(id, data);
  }

  async _findAll({ page, limit, search, active, order }: PaginateParams) {
    const queryBuilder = this.getRepository(Program)
      .createQueryBuilder("Programs")
      .select([
        "Programs.id",
        "Programs.name",
        "Programs.description",
        "Programs.logo",
        "Programs.active",
      ])
      .orderBy("Programs.name", order);

    if (search) {
      queryBuilder.andWhere("Programs.name LIKE :q", { q: `%${search}%` });
    }

    if (active !== null) {
      queryBuilder.andWhere("Programs.active = :active", { active });
    }

    const data = await paginateData(page, limit, queryBuilder);

    return data;
  }
}
