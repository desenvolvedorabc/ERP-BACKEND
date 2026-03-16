import { Injectable } from "@nestjs/common";
import { InternalServerError } from "src/common/errors";
import { CreatePartnerStateDto } from "./dto/create-partner-state.dto";
import { PartnerState } from "./entities/partner-state.entity";
import { ConflictExceptionPartnerSate, NotFoundPartnerState } from "./errors";
import { PartnerStatesRepository } from "./repositories/typeorm/partner-states.repository";

@Injectable()
export class PartnerStatesService {
  constructor(
    private readonly partnerStatesRepository: PartnerStatesRepository,
  ) {}

  async create(createPartnerStateDto: CreatePartnerStateDto): Promise<void> {
    const { partnerState } =
      await this.partnerStatesRepository._findOneByAbbreviation(
        createPartnerStateDto.abbreviation,
      );

    if (partnerState) {
      throw new ConflictExceptionPartnerSate();
    }

    try {
      await this.partnerStatesRepository._create(createPartnerStateDto);
    } catch (e) {
      throw new InternalServerError();
    }
  }

  findAll() {
    return this.partnerStatesRepository._findAll();
  }

  getOptions() {
    return this.partnerStatesRepository._getOptions();
  }

  async findOne(id: number): Promise<{ partnerState: PartnerState }> {
    const { partnerState } =
      await this.partnerStatesRepository._findOneById(id);

    if (!partnerState) {
      throw new NotFoundPartnerState();
    }

    return {
      partnerState,
    };
  }

  async remove(id: number): Promise<void> {
    const { partnerState } = await this.findOne(id);

    try {
      await this.partnerStatesRepository._delete(partnerState.id);
    } catch (e) {
      throw new InternalServerError();
    }
  }
}
