import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { PartnerMunicipality } from "../../entities/partner-municipality.entity";
import { CreatePartnerMunicipalityDto } from "../../dto/create-partner-municipality.dto";
import { PaginateParams } from "src/common/utils/paginate-params.dto";
import { paginateData } from "src/common/utils/paginate-data";
import { GenericOptions } from "src/common/DTOs/options.dto";
import { optionsPartnerMunicipality } from "../../dto/options-partner-municipality.dto";

@Injectable()
export class PartnerMunicipalitiesRepository extends Repository<PartnerMunicipality> {
  constructor(private dataSource: DataSource) {
    super(PartnerMunicipality, dataSource.createEntityManager());
  }

  async _create(
    createPartnerMunicipalityDto: CreatePartnerMunicipalityDto,
  ): Promise<PartnerMunicipality> {
    const { name, uf, cod } = createPartnerMunicipalityDto;

    const partnerMunicipality = this.create({
      name,
      uf,
      cod,
    });

    return await this.save(partnerMunicipality);
  }

  async _findAll({ page, limit, search, uf, order }: PaginateParams) {
    const queryBuilder = this.createQueryBuilder("PartnerMunicipalities")
      .select([
        "PartnerMunicipalities.id",
        "PartnerMunicipalities.name",
        "PartnerMunicipalities.uf",
        "PartnerMunicipalities.cod",
      ])
      .orderBy("PartnerMunicipalities.name", order);

    if (search) {
      queryBuilder.andWhere("PartnerMunicipalities.name LIKE :q", {
        q: `%${search}%`,
      });
    }

    if (uf) {
      queryBuilder.andWhere("PartnerMunicipalities.uf = :uf", {
        uf,
      });
    }

    const data = await paginateData(page, limit, queryBuilder);

    return data;
  }

  async _findOneById(
    id: number,
  ): Promise<{ partnerMunicipality: PartnerMunicipality | null }> {
    const partnerMunicipality = await this.findOne({
      where: {
        id,
      },
    });

    return {
      partnerMunicipality,
    };
  }

  async _findOneByCod(
    cod: string,
  ): Promise<{ partnerMunicipality: PartnerMunicipality | null }> {
    const partnerMunicipality = await this.findOne({
      where: {
        cod,
      },
    });

    return {
      partnerMunicipality,
    };
  }

  async _delete(id: number): Promise<void> {
    await this.delete(id);
  }

  async _getOptions(): Promise<optionsPartnerMunicipality[]> {
    return await this.createQueryBuilder("PartnerMunicipalities")
      .select([
        "PartnerMunicipalities.id AS id",
        "PartnerMunicipalities.name AS name",
        "PartnerMunicipalities.uf AS parentId",
      ])
      .getRawMany();
  }
}
