import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { addDays, isBefore } from "date-fns";
import { Contracts } from "../entities/contracts.entity";
import { ContractStatus } from "../enums";
import {
  Aditive7DaysError,
  ContractConflictError,
  ContractEditError,
  ContractNotFoundError,
  ContractSettleError,
  CreateAditiveInAditiveError,
} from "../errors";
import { ContractsRepository } from "../repositories/contracts-repository";

@Injectable()
export class ContractsValidations {
  constructor(private contractsRepository: ContractsRepository) {}

  private async Exists(data: Contracts): Promise<void> {
    if (!data) {
      throw new ContractNotFoundError();
    }
  }

  async Duplicate(contractCode: string, id?: number): Promise<void> {
    if (isNaN(id)) {
      throw new InternalServerErrorException("Id enviado não é um número");
    }
    const duplicated = await this.contractsRepository._existsByContractCode(
      contractCode,
      id,
    );
    if (duplicated) {
      throw new ContractConflictError();
    }
  }

  private async Pending(
    data: Contracts,
    error = new ContractEditError(),
  ): Promise<void> {
    if (data.contractStatus !== ContractStatus.PENDING) {
      throw error;
    }
  }

  private async SignedOrOngoing(data: Contracts): Promise<void> {
    if (
      data.contractStatus !== ContractStatus.SIGNED &&
      data.contractStatus !== ContractStatus.ONGOING
    ) {
      throw new ContractSettleError();
    }
  }

  private async NotPending(
    data: Contracts,
    error = new ContractEditError(),
  ): Promise<void> {
    if (data.contractStatus === ContractStatus.PENDING) {
      throw error;
    }
  }

  private async NotSignedOrOngoing(data: Contracts): Promise<void> {
    if (
      data.contractStatus === ContractStatus.SIGNED ||
      data.contractStatus === ContractStatus.ONGOING
    ) {
      throw new ContractSettleError();
    }
  }

  private async NotOnGoing(data: Contracts): Promise<void> {
    if (data.contractStatus === ContractStatus.ONGOING) {
      throw new ContractSettleError();
    }
  }

  private async FinishedMoreThan7Days(data: Contracts): Promise<void> {
    if (isBefore(data.contractPeriod.end, addDays(new Date(), -7))) {
      throw new Aditive7DaysError();
    }
  }

  private async IsAditive(data: Contracts): Promise<void> {
    const isAditive = !!data.parentId;
    if (isAditive) {
      throw new CreateAditiveInAditiveError();
    }
  }

  async UpdateRequest(id: number): Promise<void> {
    const data = await this.contractsRepository.findOneBy({ id });

    await this.Exists(data);
    await this.Pending(data);
  }

  async UpdateBancaryInfoRequest(id: number): Promise<void> {
    const data = await this.contractsRepository.findOneBy({ id });

    await this.Exists(data);
  }

  async CreateAditive(id: number): Promise<void> {
    const data = await this.contractsRepository.findOneBy({ id });

    await this.Exists(data);
    await this.IsAditive(data);
    await this.NotPending(data);
    await this.FinishedMoreThan7Days(data);
  }

  async ExistsAndNotSigned(id: number): Promise<void> {
    const data = await this.contractsRepository.findOneBy({ id });

    await this.Exists(data);
    await this.NotSignedOrOngoing(data);
  }

  async ExistsAndSigned(id: number): Promise<void> {
    const data = await this.contractsRepository.findOneBy({ id });

    await this.Exists(data);
    await this.SignedOrOngoing(data);
  }

  async ExistsAndPending(id: number): Promise<void> {
    const data = await this.contractsRepository.findOneBy({ id });

    await this.Exists(data);
    await this.Pending(data);
  }
}
