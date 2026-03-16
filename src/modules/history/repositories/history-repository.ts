import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { CreateHistoryDTO } from "../dto/createHistory.dto";
import { History } from "../entities/history.entity";

import { BaseRepository } from "src/database/typeorm/base-repository";

@Injectable()
export class HistoryRepository extends BaseRepository<History> {
  constructor(dataSource: DataSource) {
    super(History, dataSource);
  }

  async _create(data: CreateHistoryDTO): Promise<void> {
    const newContract = await this.getRepository(History).create(data);
    await this.getRepository(History).save(newContract);
  }

  async _findById(id: number): Promise<History> {
    return await this.getRepository(History).findOne({
      where: { id },
    });
  }

  async _delete(id: number): Promise<void> {
    await this.getRepository(History).delete({ id });
  }

  async _existsById(id: number): Promise<boolean> {
    return await this.getRepository(History).exist({ where: { id } });
  }
}
