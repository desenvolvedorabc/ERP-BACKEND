import { Injectable } from "@nestjs/common";
import { isBefore } from "date-fns";
import { Receivables } from "../entities/receivables.entity";
import { ReceivableStatus } from "../enums";
import {
  ReceivableConflictError,
  ReceivableDeletingError,
  ReceivableEditError,
  ReceivableNotFoundError,
} from "../errors";
import { ReceivablesRepository } from "../repositories/receivables-repository";

@Injectable()
export class ReceivableValidator {
  constructor(private receivablesRepository: ReceivablesRepository) {}
  private async Exists(data: Receivables): Promise<void> {
    if (!data) {
      throw new ReceivableNotFoundError();
    }
  }

  async Duplicate(
    identifierCode: string,
    finnancierId: number,
    id?: number,
  ): Promise<void> {
    const duplicated = await this.receivablesRepository._existsByIdentifierCode(
      identifierCode,
      finnancierId,
      id,
    );
    if (duplicated) {
      throw new ReceivableConflictError();
    }
  }

  private async PendingOrApproved(data: Receivables): Promise<void> {
    if (
      ![ReceivableStatus.PENDING, ReceivableStatus.PENDING].includes(
        data.receivableStatus,
      )
    ) {
      throw new ReceivableDeletingError();
    }
  }

  private async Received(data: Receivables): Promise<void> {
    if (data.receivableStatus === ReceivableStatus.RECEIVED) {
      throw new ReceivableEditError();
    }
  }

  async UpdateRequest(id: number, identifierCode?: string): Promise<void> {
    const data = await this.receivablesRepository.findOne({ where: { id } });

    await this.Exists(data);
    await this.Received(data);
    if (identifierCode) await this.Duplicate(identifierCode, data.id);
  }

  async DeleteRequest(id: number): Promise<void> {
    const data = await this.receivablesRepository.findOne({ where: { id } });

    await this.Exists(data);
    await this.PendingOrApproved(data);
  }

  async IsDateGreaterThanEndDate(
    id: number,
    greaterDate: Date,
    endDate: Date,
  ): Promise<boolean> {
    return isBefore(endDate, greaterDate);
  }
}
