import { Injectable } from "@nestjs/common";
import { DataSource, In, Not } from "typeorm";
import { Files } from "../entities/files.entity";

import { BaseRepository } from "src/database/typeorm/base-repository";

@Injectable()
export class FilesRepository extends BaseRepository<Files> {
  constructor(dataSource: DataSource) {
    super(Files, dataSource);
  }

  async _create(
    data: {
      payableId: number;
      receivableId: number;
      contractId: number;
      fileUrl: string;
    }[],
  ): Promise<void> {
    const newFile = await this.getRepository(Files).create(data);
    await this.getRepository(Files).save(newFile);
  }

  async _findById(id: number): Promise<Files> {
    return await this.getRepository(Files).findOne({ where: { id } });
  }

  async _delete(id: number): Promise<void> {
    await this.getRepository(Files).delete({ id });
  }

  async _deleteByReceivableId(
    receivableId: number,
    data: Pick<Files, "fileUrl" | "id">[],
  ) {
    const rows = await this.getRepository(Files).find({
      where: { receivableId, id: Not(In(data.map((data) => data.id))) },
    });
    if (rows.length > 0) {
      await this.getRepository(Files).delete(rows.map((row) => row.id));
    }
    return rows;
  }

  async _deleteByContractId(
    contractId: number,
    data: Pick<Files, "fileUrl" | "id">[],
  ) {
    const rows = await this.getRepository(Files).find({
      where: { contractId, id: Not(In(data.map((data) => data.id))) },
    });
    if (rows.length > 0) {
      await this.getRepository(Files).delete(rows.map((row) => row.id));
    }
    return rows;
  }

  async _deleteByPayableId(
    payableId: number,
    data: Pick<Files, "fileUrl" | "id">[],
  ) {
    const rows = await this.getRepository(Files).find({
      where: { payableId, id: Not(In(data.map((data) => data.id))) },
    });
    if (rows.length > 0) {
      await this.getRepository(Files).delete(rows.map((row) => row.id));
    }
    return rows;
  }
}
