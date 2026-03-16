import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { PartnerState } from "../../entities/partner-state.entity";
import { CreatePartnerStateDto } from "../../dto/create-partner-state.dto";
import { GenericOptions } from "src/common/DTOs/options.dto";

@Injectable()
export class PartnerStatesRepository extends Repository<PartnerState> {
  constructor(private dataSource: DataSource) {
    super(PartnerState, dataSource.createEntityManager());
  }

  async _create(
    createPartnerStateDto: CreatePartnerStateDto,
  ): Promise<PartnerState> {
    const { name, abbreviation } = createPartnerStateDto;
    const partnerState = this.create({
      name,
      abbreviation,
    });

    return await this.save(partnerState);
  }

  async _findAll(): Promise<{ data: PartnerState[] }> {
    const data = await this.find({
      order: {
        name: "ASC",
      },
    });

    return {
      data,
    };
  }

  async _findOneById(
    id: number,
  ): Promise<{ partnerState: PartnerState | null }> {
    const partnerState = await this.findOne({
      where: {
        id,
      },
    });

    return {
      partnerState,
    };
  }

  async _findOneByAbbreviation(
    abbreviation: string,
  ): Promise<{ partnerState: PartnerState | null }> {
    const partnerState = await this.findOne({
      where: {
        abbreviation,
      },
    });

    return {
      partnerState,
    };
  }

  async _delete(id: number): Promise<void> {
    await this.delete(id);
  }

  async _getOptions(): Promise<GenericOptions[]> {
    return await this.createQueryBuilder("PartnerStates")
      .select(["PartnerStates.id AS id", "PartnerStates.abbreviation AS name"])
      .getRawMany();
  }
}
