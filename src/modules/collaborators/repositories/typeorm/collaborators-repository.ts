import { Injectable } from "@nestjs/common";
import { paginateData } from "src/common/utils/paginate-data";
import { ContractStatus } from "src/modules/contracts/enums";
import { DataSource, In } from "typeorm";
import { CreateCollaboratorDto } from "../../dto/create-collaborator.dto";
import { optionsCollaborators } from "../../dto/optionsCollaborators.dto";
import { PaginateCollaboratorsParams } from "../../dto/paginate-collaborators-params.dto";
import { Collaborator } from "../../entities/collaborator.entity";
import { RegistrationStatus } from "../../enum";
import { defaultSelectColumnsCollaborator } from "../consts";
import { BaseRepository } from "src/database/typeorm/base-repository";
import { maskCPF } from "src/common/utils/masks";
import { User } from "src/modules/users/entities/user.entity";

export interface ResponseCollaborator {
  collaborator: Collaborator | null;
}

@Injectable()
export class CollaboratorsRepository extends BaseRepository<Collaborator> {
  constructor(dataSource: DataSource) {
    super(Collaborator, dataSource);
  }

  async _create(
    createCollaboratorDto: CreateCollaboratorDto,
  ): Promise<Collaborator> {
    const {
      name,
      email,
      cpf,
      employmentRelationship,
      role,
      occupationArea,
      startOfContract,
    } = createCollaboratorDto;

    const collaborator = this.getRepository(Collaborator).create({
      name,
      email,
      cpf,
      employmentRelationship,
      role,
      occupationArea,
      startOfContract,
    });

    return await this.getRepository(Collaborator).save(collaborator);
  }

  async _findAll(
    {
      page,
      limit,
      search,
      active,
      order,
      yearOfContract,
      educations,
      status,
      genderIdentities,
      breeds,
      occupationAreas,
      employmentRelationships,
      disableBy,
      roles,
      age,
    }: PaginateCollaboratorsParams,
    isCsv = false,
  ) {
    const queryBuilder = this.getRepository(Collaborator)
      .createQueryBuilder("Collaborators")
      .orderBy("Collaborators.name", order);

    if (!isCsv) {
      queryBuilder.select([
        "Collaborators.id",
        "Collaborators.name",
        "Collaborators.email",
        "Collaborators.occupationArea",
        "Collaborators.role",
        "Collaborators.status",
        "Collaborators.disableBy",
        "Collaborators.active",
      ]);
    }

    if (search) {
      queryBuilder.andWhere("Collaborators.name LIKE :q", { q: `%${search}%` });
    }

    if (active !== null) {
      queryBuilder.andWhere("Collaborators.active = :active", { active });
    }

    if (breeds?.length) {
      queryBuilder.andWhere("Collaborators.race IN(:...breeds)", { breeds });
    }

    if (status?.length) {
      queryBuilder.andWhere("Collaborators.status IN(:...status)", {
        status,
      });
    }

    if (genderIdentities?.length) {
      queryBuilder.andWhere(
        "Collaborators.genderIdentity IN(:...genderIdentities)",
        {
          genderIdentities,
        },
      );
    }

    if (educations?.length) {
      queryBuilder.andWhere("Collaborators.education IN(:...educations)", {
        educations,
      });
    }

    if (occupationAreas?.length) {
      queryBuilder.andWhere(
        "Collaborators.occupationArea IN(:...occupationAreas)",
        {
          occupationAreas,
        },
      );
    }

    if (employmentRelationships?.length) {
      queryBuilder.andWhere(
        "Collaborators.employmentRelationship IN(:...employmentRelationships)",
        {
          employmentRelationships,
        },
      );
    }

    if (disableBy?.length) {
      queryBuilder.andWhere("Collaborators.disableBy IN(:...disableBy)", {
        disableBy,
      });
    }

    if (roles?.length) {
      queryBuilder.andWhere("Collaborators.role IN(:...roles)", {
        roles,
      });
    }

    if (yearOfContract) {
      queryBuilder.andWhere(
        "YEAR(Collaborators.startOfContract) = :yearOfContract",
        {
          yearOfContract,
        },
      );
    }

    if (age) {
      queryBuilder.andWhere(
        'YEAR(CURDATE()) - YEAR(Collaborators.dateOfBirth) - IF(DATE_FORMAT(CURDATE(), "%m-%d") < DATE_FORMAT(Collaborators.dateOfBirth, "%m-%d"), 1, 0) = :age',
        {
          age,
        },
      );
    }

    if (isCsv) {
      // Para CSV, precisamos buscar contratos também para obter remuneração
      queryBuilder.leftJoinAndSelect("Collaborators.contracts", "Contracts");
      const items = await queryBuilder.getMany();

      return {
        items,
      };
    }

    const data = await paginateData(page, limit, queryBuilder);

    return data;
  }

  async _findAllWithFullData(
    params: PaginateCollaboratorsParams,
  ) {
    const queryBuilder = this.getRepository(Collaborator)
      .createQueryBuilder("Collaborators")
      .orderBy("Collaborators.name", params.order);

    if (params.search) {
      queryBuilder.andWhere("Collaborators.name LIKE :q", { q: `%${params.search}%` });
    }

    if (params.active !== null) {
      queryBuilder.andWhere("Collaborators.active = :active", { active: params.active });
    }

    if (params.breeds?.length) {
      queryBuilder.andWhere("Collaborators.race IN(:...breeds)", { breeds: params.breeds });
    }

    if (params.status?.length) {
      queryBuilder.andWhere("Collaborators.status IN(:...status)", {
        status: params.status,
      });
    }

    if (params.genderIdentities?.length) {
      queryBuilder.andWhere(
        "Collaborators.genderIdentity IN(:...genderIdentities)",
        {
          genderIdentities: params.genderIdentities,
        },
      );
    }

    if (params.educations?.length) {
      queryBuilder.andWhere("Collaborators.education IN(:...educations)", {
        educations: params.educations,
      });
    }

    if (params.occupationAreas?.length) {
      queryBuilder.andWhere(
        "Collaborators.occupationArea IN(:...occupationAreas)",
        {
          occupationAreas: params.occupationAreas,
        },
      );
    }

    if (params.employmentRelationships?.length) {
      queryBuilder.andWhere(
        "Collaborators.employmentRelationship IN(:...employmentRelationships)",
        {
          employmentRelationships: params.employmentRelationships,
        },
      );
    }

    if (params.disableBy?.length) {
      queryBuilder.andWhere("Collaborators.disableBy IN(:...disableBy)", {
        disableBy: params.disableBy,
      });
    }

    if (params.roles?.length) {
      queryBuilder.andWhere("Collaborators.role IN(:...roles)", {
        roles: params.roles,
      });
    }

    if (params.yearOfContract) {
      queryBuilder.andWhere(
        "YEAR(Collaborators.startOfContract) = :yearOfContract",
        {
          yearOfContract: params.yearOfContract,
        },
      );
    }

    if (params.age) {
      queryBuilder.andWhere(
        'YEAR(CURDATE()) - YEAR(Collaborators.dateOfBirth) - IF(DATE_FORMAT(CURDATE(), "%m-%d") < DATE_FORMAT(Collaborators.dateOfBirth, "%m-%d"), 1, 0) = :age',
        {
          age: params.age,
        },
      );
    }

    const data = await paginateData(params.page, params.limit, queryBuilder);

    return data;
  }

  async _findOneByNameOrCPF(nameOrCPF: string): Promise<Collaborator> {
    return await this.getRepository(Collaborator)
      .createQueryBuilder("Collaborator")
      .leftJoin(
        "Collaborator.contracts",
        "Contracts",
        "Contracts.contractStatus = :sStatus OR Contracts.contractStatus = :ogStatus",
        {
          sStatus: ContractStatus.SIGNED,
          ogStatus: ContractStatus.ONGOING,
        },
      )
      .leftJoin("Contracts.budgetPlan", "BudgetPlan")
      .leftJoin("Contracts.supplier", "Contracts_Supplier")
      .leftJoin("Contracts.collaborator", "Contracts_Collaborator")
      .leftJoin("Contracts.payable", "Payable")
      .leftJoin("Contracts.program", "Program")
      .select(defaultSelectColumnsCollaborator)
      .where("Collaborator.name LIKE :q OR Collaborator.cpf LIKE :q", {
        q: `%${nameOrCPF}%`,
      })
      .andWhere("Collaborator.active = true")
      .andWhere("Collaborator.status = :status", {
        status: RegistrationStatus.CADASTRO_COMPLETO,
      })
      .getOne();
  }

  async _findOneById(id: number): Promise<ResponseCollaborator> {
    const collaborator = await this.getRepository(Collaborator).findOne({
      where: {
        id,
      },
    });

    return {
      collaborator,
    };
  }

  async _findCollaboratorByCpf(cpf: string): Promise<ResponseCollaborator> {
    const collaborator = await this.getRepository(Collaborator).findOne({
      where: {
        cpf,
      },
    });

    return {
      collaborator,
    };
  }

  async _findCollaboratorByEmail(email: string): Promise<ResponseCollaborator> {
    const collaborator = await this.getRepository(Collaborator).findOne({
      where: {
        email,
      },
    });

    return {
      collaborator,
    };
  }

  async _update(id: number, data: Partial<Collaborator>): Promise<void> {
    await this.getRepository(Collaborator).update(id, data);
  }

  async _findManyById(
    ids: number[],
  ): Promise<Pick<Collaborator, "id" | "email">[]> {
    const collaborators = await this.getRepository(Collaborator).find({
      where: {
        id: In(ids),
      },
      select: {
        id: true,
        email: true,
      },
    });

    return collaborators;
  }

  async _getOptions(): Promise<optionsCollaborators[]> {
    const collaborators = await this.getRepository(Collaborator)
      .createQueryBuilder("collaborator")
      .leftJoinAndSelect("collaborator.users", "user")
      .select([
        "collaborator.id",
        "collaborator.name", 
        "collaborator.cpf",
        "user.id",
        "user.name",
        "user.email",
        "user.massApprovalPermission"
      ])
      .where("collaborator.active = :active", { active: true })
      .andWhere("collaborator.status = :status", { 
        status: RegistrationStatus.CADASTRO_COMPLETO 
      })
      .getMany();

    return collaborators.map((collaborator) => ({
      id: collaborator.id,
      name: `${collaborator.name} - ${maskCPF(collaborator.cpf)}`,
      cpf: collaborator.cpf,
      user: collaborator.users && collaborator.users.length > 0 ? {
        id: collaborator.users[0].id,
        name: collaborator.users[0].name,
        email: collaborator.users[0].email,
        massApprovalPermission: collaborator.users[0].massApprovalPermission
      } : undefined
    }));
  }
}
