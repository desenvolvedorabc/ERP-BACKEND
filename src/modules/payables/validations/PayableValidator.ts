import { HttpException, Injectable } from "@nestjs/common";
import { isBefore, parseISO } from "date-fns";
import { Payables } from "../entities/payable.entity";
import { PayableStatus, PaymentType } from "../enums";
import {
  PayableConflictError,
  PayableDeletingError,
  PayableDeletingTypeError,
  PayableEditError,
  PayableNotFoundError,
} from "../errors/PayableErrors";
import { PayablesRepository } from "./../repositories/payable-repository";

@Injectable()
export class PayableValidator {
  constructor(private payablesRepository: PayablesRepository) {}
  private async Exists(payable: Payables | undefined): Promise<void> {
    if (!payable) {
      throw new PayableNotFoundError();
    }
  }

  private async PendingOrApprovingOrRejected(
    payable: Payables,
    exception: HttpException,
  ): Promise<void> {
    const status = [
      PayableStatus.PENDING,
      PayableStatus.APPROVING,
      PayableStatus.REJECTED,
    ].includes(payable.payableStatus);
    if (!status) {
      throw exception;
    }
  }

  private async DistratoOrTermo(payable: Payables): Promise<void> {
    const isType = [PaymentType.DISTRATO, PaymentType.TERMO].includes(
      payable.paymentType,
    );
    if (isType) {
      throw new PayableDeletingTypeError();
    }
  }

  async IsCreditCard(id: number): Promise<boolean> {
    return this.payablesRepository.existsBy({
      id,
      paymentType: PaymentType.CARDBILL,
    });
  }

  async Duplicate(
    identifierCode: string,
    relatedReceptorId: number,
    id?: number,
  ): Promise<void> {
    const duplicated = await this.payablesRepository._existsByIdentifierCode(
      identifierCode,
      relatedReceptorId,
      id,
    );
    if (duplicated) {
      throw new PayableConflictError();
    }
  }

  async UpdateRequest(identifierCode: string, id: number): Promise<void> {
    const data = await this.payablesRepository.findOne({ where: { id } });

    await this.Exists(data);
    await this.PendingOrApprovingOrRejected(data, new PayableEditError());
    await this.Duplicate(
      identifierCode,
      data.supplierId ?? data.collaboratorId,
      id,
    );
  }

  async DeleteRequest(id: number): Promise<void> {
    const data = await this.payablesRepository.findOne({ where: { id } });

    await this.Exists(data);
    await this.PendingOrApprovingOrRejected(data, new PayableDeletingError());
    await this.DistratoOrTermo(data);
  }

  async IsDateGreaterThanEndDate(
    id: number,
    greaterDate: Date,
    endDate: Date,
  ): Promise<boolean> {
    const parsedEndDate =
      typeof endDate === "string" ? parseISO(endDate) : endDate;
    const parsedGreaterDate =
      typeof greaterDate === "string" ? parseISO(greaterDate) : greaterDate;
    return isBefore(parsedEndDate, parsedGreaterDate);
  }
}
