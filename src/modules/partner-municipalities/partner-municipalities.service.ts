import { Injectable } from "@nestjs/common";
import { InternalServerError } from "src/common/errors";
import { PaginateParams } from "src/common/utils/paginate-params.dto";
import { CreatePartnerMunicipalityDto } from "./dto/create-partner-municipality.dto";
import {
  ConflictExceptionPartnerMunicipality,
  NotFoundPartnerMunicipality,
} from "./errors";
import { PartnerMunicipalitiesRepository } from "./repositories/typeorm/partner-municipalities.repository";

@Injectable()
export class PartnerMunicipalitiesService {
  constructor(
    private readonly partnerMunicipalitiesRepository: PartnerMunicipalitiesRepository,
  ) {}

  async create({ name, uf, cod }: CreatePartnerMunicipalityDto): Promise<void> {
    const { partnerMunicipality } =
      await this.partnerMunicipalitiesRepository._findOneByCod(cod);

    if (partnerMunicipality) {
      throw new ConflictExceptionPartnerMunicipality();
    }

    try {
      await this.partnerMunicipalitiesRepository._create({
        name,
        uf,
        cod,
      });
    } catch (e) {
      throw new InternalServerError();
    }
  }

  findAll(params: PaginateParams) {
    return this.partnerMunicipalitiesRepository._findAll(params);
  }

  getOptions() {
    return this.partnerMunicipalitiesRepository._getOptions();
  }

  async findOne(id: number) {
    const { partnerMunicipality } =
      await this.partnerMunicipalitiesRepository._findOneById(id);

    if (!partnerMunicipality) {
      throw new NotFoundPartnerMunicipality();
    }

    return {
      partnerMunicipality,
    };
  }

  async remove(id: number): Promise<void> {
    const { partnerMunicipality } = await this.findOne(id);

    try {
      await this.partnerMunicipalitiesRepository._delete(
        partnerMunicipality.id,
      );
    } catch (e) {
      throw new InternalServerError();
    }
  }
}
