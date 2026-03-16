/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { CreateHistoryDTO } from "./dto/createHistory.dto";
import { History } from "./entities/history.entity";
import { ActionTypes } from "./enums";
import {
  CreatingHistoryError,
  DeletingHistoryError,
  FetchingHistoryByIdError,
  HistoryNotFoundError,
} from "./errors";
import { HistoryRepository } from "./repositories/history-repository";

@Injectable()
export class HistoryService {
  constructor(private historyRepository: HistoryRepository) {}

  private async create(data: CreateHistoryDTO): Promise<void> {
    try {
      await this.historyRepository._create(data);
    } catch (error) {
      console.error(error);
      throw new CreatingHistoryError();
    }
  }

  async createHistory(
    contractId: number,
    userId: number,
    actionType: ActionTypes,
  ): Promise<void> {
    const data: CreateHistoryDTO = {
      actionType: ActionTypes.WITHDRAWAL,
      contractId,
      userId,
    };
    await this.create(data);
  }

  async delete(id: number): Promise<void> {
    await this.validateExists(id);
    try {
      await this.historyRepository._delete(id);
    } catch (error) {
      throw new DeletingHistoryError();
    }
  }

  async findOneById(id: number): Promise<History> {
    let payload;
    try {
      payload = await this.historyRepository._findById(id);
    } catch (error) {
      console.error(error);
      throw new FetchingHistoryByIdError();
    }
    if (!payload) {
      throw new HistoryNotFoundError();
    }
    return payload;
  }

  private async validateExists(id: number): Promise<void> {
    const exists = await this.historyRepository._existsById(id);
    if (!exists) {
      throw new HistoryNotFoundError();
    }
  }
}
