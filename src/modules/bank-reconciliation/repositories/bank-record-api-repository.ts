import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { BaseRepository } from "src/database/typeorm/base-repository";
import { BankRecordApi } from "../entities/bank-record-api.entity";
import { CreateBankRecordApiDTO } from "../dtos/bank-record-api.dto";

@Injectable()
export class BankRecordAPIRepository extends BaseRepository<BankRecordApi> {
  constructor(dataSource: DataSource) {
    super(BankRecordApi, dataSource);
  }

  async _create(
    data: Omit<CreateBankRecordApiDTO, "categorization">,
  ): Promise<BankRecordApi> {
    const result = await this.getRepository(BankRecordApi).insert(data);
    return await this.getRepository(BankRecordApi).findOneBy({
      id: result.identifiers[0].id,
    });
  }

  async _findById(id: number): Promise<BankRecordApi> {
    return await this.getRepository(BankRecordApi).findOne({
      where: { id },
    });
  }

  async _delete(id: number): Promise<void> {
    await this.getRepository(BankRecordApi).delete(id);
  }
}
