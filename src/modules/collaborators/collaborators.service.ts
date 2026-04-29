import { Injectable, NotFoundException } from "@nestjs/common";
import {
  ForbiddenError,
  ForbiddenInvalidCredentials,
  InternalServerError,
  CollaboratorWithPendingApprovalsError,
} from "src/common/errors";
import { formatCollaboratorForCsv } from "src/common/mappers/csv/format-collaborators-for-csv";
import { formatCollaboratorsTimeline } from "src/common/mappers/csv/format-collaborators-timeline";
import { filterContracts } from "src/common/utils/filterContracts";
import { generateCsv } from "src/common/utils/lib/generate-csv";
import { sendEmailCompleteEmployeeRegistration } from "src/mails";
import { CompleteRegistrationCollaborator } from "./dto/complete-registration-collaborator";
import { CreateCollaboratorDto } from "./dto/create-collaborator.dto";
import { DisableCollaboratorDto } from "./dto/disable-collaborator.dto";
import { optionsCollaborators } from "./dto/optionsCollaborators.dto";
import { FoodCategoryOptionDto } from "./dto/food-category-options.dto";
import { FOOD_CATEGORY_OPTIONS } from "./enum";
import { PaginateCollaboratorsParams } from "./dto/paginate-collaborators-params.dto";
import { UpdateCollaboratorDto } from "./dto/update-collaborator.dto";
import { Collaborator } from "./entities/collaborator.entity";
import { RegistrationStatus } from "./enum";
import { ConflictExceptionCollaborator, NotFoundCollaborator } from "./errors";
import {
  CollaboratorsRepository,
  ResponseCollaborator,
} from "./repositories/typeorm/collaborators-repository";
import { UsersRepository } from "../users/repositories/typeorm/users-repository";
import { ApprovalValidationService } from "src/common/services/approval-validation.service";
import { CollaboratorHistoryService } from "./services/collaborator-history.service";

@Injectable()
export class CollaboratorsService {
  constructor(
    private readonly collaboratorsRepository: CollaboratorsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly approvalValidationService: ApprovalValidationService,
    private readonly historyService: CollaboratorHistoryService,
  ) {}

  async create(createCollaboratorDto: CreateCollaboratorDto): Promise<void> {
    await this.validateUserExistsByEmailAndCpf(
      createCollaboratorDto.email,
      createCollaboratorDto.cpf,
    );

    try {
      const collaborator = await this.collaboratorsRepository._create(
        createCollaboratorDto,
      );

      await this.historyService.recordInitialSnapshot(collaborator.id, collaborator);

      await sendEmailCompleteEmployeeRegistration(
        collaborator.id,
        collaborator.email,
      );
    } catch (e) {
      throw new InternalServerError();
    }
  }

  findAll(params: PaginateCollaboratorsParams) {
    return this.collaboratorsRepository._findAll(params);
  }

  async findOne(id: number): Promise<ResponseCollaborator & { history?: any[] }> {
    const { collaborator } =
      await this.collaboratorsRepository._findOneById(id);

    if (!collaborator) {
      throw new NotFoundCollaborator();
    }

    const history = await this.historyService.getHistoryByCollaboratorId(id);

    return {
      collaborator,
      history,
    };
  }

  async findManyById(
    ids: number[],
  ): Promise<Pick<Collaborator, "id" | "email">[]> {
    return this.collaboratorsRepository._findManyById(ids);
  }

  async checkFirstThreeNumbersOfTheCPF(
    collaboratorId: number,
    firstThreeNumbersOfTheCPF: string,
  ): Promise<ResponseCollaborator> {
    const { collaborator } = await this.findOne(collaboratorId);

    const getFirstThreeNumbersOfTheCPF = collaborator.cpf.slice(0, 3);

    if (firstThreeNumbersOfTheCPF !== getFirstThreeNumbersOfTheCPF) {
      throw new ForbiddenInvalidCredentials();
    }

    if (
      !collaborator.active ||
      collaborator.status !== RegistrationStatus.PRE_CADASTRO
    ) {
      throw new ForbiddenError();
    }

    return {
      collaborator,
    };
  }

  async completeRegistration(
    id: number,
    dto: CompleteRegistrationCollaborator,
  ): Promise<void> {
    const { collaborator } = await this.findOne(id);

    if (
      !collaborator.active ||
      collaborator.status !== RegistrationStatus.PRE_CADASTRO
    ) {
      throw new ForbiddenError();
    }

    try {
      await this.collaboratorsRepository._update(collaborator.id, {
        ...dto,
        status: RegistrationStatus.CADASTRO_COMPLETO,
      });
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async toggleActive(
    id: number,
    { disableBy }: DisableCollaboratorDto,
  ): Promise<void> {
    const { collaborator } = await this.findOne(id);

    // Verificar se o colaborador tem despesas em aprovação
    const hasPendingApprovals = await this.approvalValidationService.hasCollaboratorPendingApprovals(collaborator.id);
    if (hasPendingApprovals) {
      throw new CollaboratorWithPendingApprovalsError();
    }

    let motive = disableBy;

    if (
      collaborator.active &&
      collaborator.status === RegistrationStatus.CADASTRO_COMPLETO &&
      !motive
    ) {
      throw new ForbiddenError(
        "Atenção! Informe o motivo de está desativando o colaborador.",
      );
    }

    if (
      !collaborator.active ||
      collaborator.status === RegistrationStatus.PRE_CADASTRO
    ) {
      motive = null;
    }

    const active = !collaborator.active;
    
    // Preparar dados anteriores para histórico
    const previousData: Partial<Collaborator> = {
      active: collaborator.active,
      disableBy: collaborator.disableBy,
    };

    try {
      await this.collaboratorsRepository._update(collaborator.id, {
        active,
        disableBy: motive,
      });

      // Registrar histórico da mudança de status
      const newData: Partial<Collaborator> = {
        active,
        disableBy: motive,
      };

      await this.historyService.recordHistory(
        collaborator.id,
        previousData,
        newData,
      );

      const user = await this.usersRepository.findOne({
        where: { cpf: collaborator.cpf },
      });

      if (user) {
        await this.usersRepository._update(user.id, {
          active: active,
        });
      }

      if (active && collaborator.status === RegistrationStatus.PRE_CADASTRO) {
        await sendEmailCompleteEmployeeRegistration(
          collaborator.id,
          collaborator.email,
        );
      }
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async findOneByNameOrCNPJ(
    nameOrCPF: string,
    payableOrReceivableId?: number,
  ): Promise<Collaborator> {
    const collaborator =
      await this.collaboratorsRepository._findOneByNameOrCPF(nameOrCPF);
    if (!collaborator)
      throw new NotFoundException("Colaborador não encontrado ou inativo.");
    const filteredContracts = filterContracts(
      collaborator.contracts,
      payableOrReceivableId,
    );

    return {
      ...collaborator,
      contracts: filteredContracts,
    };
  }

  async update(id: number, dto: UpdateCollaboratorDto): Promise<void> {
    const { collaborator } = await this.findOne(id);
    
    const hasPendingApprovals = await this.approvalValidationService.hasCollaboratorPendingApprovals(collaborator.id);
    if (hasPendingApprovals) {
      throw new CollaboratorWithPendingApprovalsError();
    }

    const newEmail: string =
      collaborator.email !== dto?.email ? dto.email : null;

    const newCpf: string = collaborator.cpf !== dto?.cpf ? dto.cpf : null;

    await this.validateUserExistsByEmailAndCpf(newEmail, newCpf);

    try {
      const previousData: Partial<Collaborator> = {
        role: collaborator.role,
        startOfContract: collaborator.startOfContract,
        active: collaborator.active,
        disableBy: collaborator.disableBy,
        occupationArea: collaborator.occupationArea,
      };

      await this.collaboratorsRepository._update(collaborator.id, dto);

      const { collaborator: updatedCollaborator } = await this.findOne(id);
      const newData: Partial<Collaborator> = {
        role: updatedCollaborator.role,
        startOfContract: updatedCollaborator.startOfContract,
        active: updatedCollaborator.active,
        disableBy: updatedCollaborator.disableBy,
        occupationArea: updatedCollaborator.occupationArea,
      };

      await this.historyService.recordHistory(
        collaborator.id,
        previousData,
        newData,
      );

      if (newEmail && collaborator.status === RegistrationStatus.PRE_CADASTRO) {
        await sendEmailCompleteEmployeeRegistration(collaborator.id, newEmail);
      }
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async findAllInCsv(params: PaginateCollaboratorsParams) {
    const { items } = await this.collaboratorsRepository._findAll(params, true);

    // Buscar histórico e contratos para cada colaborador
    const itemsWithHistory = await Promise.all(
      items.map(async (collaborator) => {
        const history = await this.historyService.getHistoryByCollaboratorId(
          collaborator.id,
        );
        return {
          ...collaborator,
          history,
        };
      }),
    );

    const { data } = formatCollaboratorForCsv(itemsWithHistory);

    if (!data?.length) {
      throw new NotFoundException("Nenhum colaborador encontrado.");
    }

    const { csvData } = generateCsv(data);

    return {
      csvData,
    };
  }

  async findAllData(params: PaginateCollaboratorsParams) {
    const paginatedResult = await this.collaboratorsRepository._findAllWithFullData(params);

    if (!paginatedResult.items?.length) {
      throw new NotFoundException("Nenhum colaborador encontrado.");
    }

    const { data } = formatCollaboratorForCsv(paginatedResult.items);

    // Buscar histórico para cada colaborador
    const dataWithHistory = await Promise.all(
      data.map(async (item, index) => {
        const collaborator = paginatedResult.items[index];
        const history = await this.historyService.getHistoryByCollaboratorId(
          collaborator.id,
        );
        return {
          ...item,
          history,
        };
      }),
    );

    return {
      data: dataWithHistory,
      meta: paginatedResult.meta,
    };
  }

  async findAllTimelineCsv(params: PaginateCollaboratorsParams) {
    const { items } = await this.collaboratorsRepository._findAll(params, true);

    const itemsWithHistory = await Promise.all(
      items.map(async (collaborator) => {
        const history = await this.historyService.getHistoryByCollaboratorId(
          collaborator.id,
        );
        return {
          ...collaborator,
          history,
        };
      }),
    );

    const timelineRows = formatCollaboratorsTimeline(itemsWithHistory);

    if (!timelineRows.length) {
      throw new NotFoundException("Nenhum colaborador encontrado.");
    }

    const { csvData } = generateCsv(timelineRows);

    return {
      csvData,
    };
  }

  private async validateUserExistsByEmailAndCpf(
    email: string,
    cpf: string,
  ): Promise<void> {
    if (cpf) {
      const { collaborator: findByCpf } =
        await this.collaboratorsRepository._findCollaboratorByCpf(cpf);

      if (findByCpf) {
        throw new ConflictExceptionCollaborator();
      }
    }

    if (email) {
      const { collaborator: findByEmail } =
        await this.collaboratorsRepository._findCollaboratorByEmail(email);

      if (findByEmail) {
        throw new ConflictExceptionCollaborator();
      }
    }
  }

  async getOptions(): Promise<optionsCollaborators[]> {
    return await this.collaboratorsRepository._getOptions();
  }

  async getFoodCategoryOptions(): Promise<FoodCategoryOptionDto[]> {
    return FOOD_CATEGORY_OPTIONS;
  }
}
