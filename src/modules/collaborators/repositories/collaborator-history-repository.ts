import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { BaseRepository } from "src/database/typeorm/base-repository";
import { CollaboratorHistory } from "../entities/collaborator-history.entity";

@Injectable()
export class CollaboratorHistoryRepository extends BaseRepository<CollaboratorHistory> {
  constructor(dataSource: DataSource) {
    super(CollaboratorHistory, dataSource);
  }

  async findByCollaboratorId(collaboratorId: number): Promise<CollaboratorHistory[]> {
    return await this.getRepository(CollaboratorHistory).find({
      where: { collaboratorId },
      order: { createdAt: "DESC" },
    });
  }

  async createHistory(historyData: Partial<CollaboratorHistory>): Promise<CollaboratorHistory> {
    const history = this.getRepository(CollaboratorHistory).create(historyData);
    return await this.getRepository(CollaboratorHistory).save(history);
  }
}

