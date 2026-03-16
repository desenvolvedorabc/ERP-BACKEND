import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { paginateData } from "src/common/utils/paginate-data";
import { BudgetsService } from "src/modules/budgets/services/budgets.service";
import { DataSource } from "typeorm";
import { CreateBudgetPlanDto } from "../../dto/create-budget-plan.dto";
import { optionsBudgetPlan } from "../../dto/optionsBudgetPlan.dto";
import { PaginateParamsBudgetPlans } from "../../dto/paginate-params-budget-plans";
import { BudgetPlan } from "../../entities/budget-plan.entity";
import { BudgetPlanStatus } from "../../enum";
import { BaseRepository } from "src/database/typeorm/base-repository";

@Injectable()
export class BudgetPlansRepository extends BaseRepository<BudgetPlan> {
  constructor(
    @Inject(forwardRef(() => BudgetsService))
    private budgetsService: BudgetsService,

    dataSource: DataSource,
  ) {
    super(BudgetPlan, dataSource);
  }

  async _create(
    createBudgetPlanDto: CreateBudgetPlanDto,
    userId: number,
  ): Promise<BudgetPlan> {
    const { year, programId, version } = createBudgetPlanDto;

    const budgetPlan = this.getRepository(BudgetPlan).create({
      year,
      programId,
      version,
      scenarioName: createBudgetPlanDto.scenarioName,
      updatedById: userId,
    });

    return await this.getRepository(BudgetPlan).save(budgetPlan);
  }

  async _duplicate(data: Partial<BudgetPlan>): Promise<BudgetPlan> {
    const budgetPlan = this.getRepository(BudgetPlan).create({ ...data });

    return await this.getRepository(BudgetPlan).save(budgetPlan);
  }

  async _findOneById(id: number, relations = []) {
    const budgetPlan = await this.getRepository(BudgetPlan).findOne({
      where: {
        id,
      },
      relations,
    });

    return {
      budgetPlan,
    };
  }

  async _findManyByIds(ids: number[]) {
    const budgetPlans = await this.getRepository(BudgetPlan)
      .createQueryBuilder("BudgetPlans")
      .select([
        "BudgetPlans.id",
        "BudgetPlans.year",
        "BudgetPlans.totalInCents",
        "BudgetPlans.version",
        "Program.name",
        "Program.abbreviation",
      ])
      .innerJoin("BudgetPlans.program", "Program")
      .andWhere("BudgetPlans.id IN(:...ids) ", { ids })
      .orderBy("BudgetPlans.id", "ASC")
      .getMany();

    return {
      budgetPlans,
    };
  }

  async _findOneByLastYear(year: number, programId: number) {
    const budgetPlan = await this.getRepository(BudgetPlan).findOne({
      where: {
        year,
        programId,
        status: BudgetPlanStatus.APROVADO,
      },
      order: {
        createdAt: "DESC",
      },
    });

    return {
      budgetPlan,
    };
  }

  async _findOneByYearAndProgramAndVersion(
    year: number,
    programId: number,
    version: number,
    relations: string[] = [],
  ) {
    const budgetPlan = await this.getRepository(BudgetPlan).findOne({
      where: {
        year,
        version,
        programId,
      },
      relations,
    });

    return {
      budgetPlan,
    };
  }

  async _findManyByYearAndProgram(year: number, programId?: number) {
    const queryBuilder = this.getRepository(BudgetPlan)
      .createQueryBuilder("BudgetPlans")
      .select([
        "BudgetPlans.id",
        "BudgetPlans.year",
        "BudgetPlans.totalInCents",
        "BudgetPlans.version",
        "Program.name",
        "Program.abbreviation",
      ])
      .innerJoin("BudgetPlans.program", "Program")
      .andWhere("BudgetPlans.year = :year", { year })
      .andWhere("BudgetPlans.version = :version", { version: 1 })
      .andWhere("BudgetPlans.status = :status", {
        status: BudgetPlanStatus.APROVADO,
      })
      .orderBy("BudgetPlans.id", "ASC");

    if (programId) {
      queryBuilder.andWhere("BudgetPlans.programId = :programId", {
        programId,
      });
    }
    const budgetPlans = await queryBuilder.getMany();

    return {
      budgetPlans,
    };
  }

  async _findAll({
    page,
    limit,
    year,
    search,
    programId,
    status,
  }: PaginateParamsBudgetPlans) {
    const queryBuilder = this.getRepository(BudgetPlan)
      .manager.getTreeRepository(BudgetPlan)
      .createQueryBuilder("BudgetPlans")
      .select([
        "BudgetPlans.id",
        "BudgetPlans.year",
        "BudgetPlans.totalInCents",
        "BudgetPlans.version",
        "BudgetPlans.status",
        "BudgetPlans.updatedAt",
        "Program.name",
        "UpdatedBy.name",
      ])
      .innerJoin("BudgetPlans.program", "Program")
      .innerJoin("BudgetPlans.updatedBy", "UpdatedBy")
      .orderBy("BudgetPlans.updatedAt", "DESC")
      .where("BudgetPlans.parentId IS NULL");

    if (year) {
      queryBuilder.andWhere("BudgetPlans.year = :year", { year });
    }

    if (programId) {
      queryBuilder.andWhere("BudgetPlans.programId = :programId", {
        programId,
      });
    }

    if (status) {
      queryBuilder.andWhere("BudgetPlans.status = :status", { status });
    }

    if (search) {
      queryBuilder.andWhere(
        "(BudgetPlans.year LIKE :q or BudgetPlans.version LIKE :q or Program.name LIKE :q )",
        { q: `%${search}%` },
      );
    }

    const data = await paginateData(page, limit, queryBuilder);

    const { formattedData } = await this.formattedDataForPaginate(data.items);

    return { ...data, items: formattedData };
  }

  private async findChildrenRecursively(
    id: number,
  ): Promise<{ children: BudgetPlan[] }> {
    const query = this.getRepository(BudgetPlan)
      .createQueryBuilder("BudgetPlans")
      .select([
        "BudgetPlans.id",
        "BudgetPlans.year",
        "BudgetPlans.totalInCents",
        "BudgetPlans.version",
        "BudgetPlans.status",
        "BudgetPlans.updatedAt",
        "BudgetPlans.scenarioName",
        "Program.name",
        "UpdatedBy.name",
      ])
      .innerJoin("BudgetPlans.program", "Program")
      .innerJoin("BudgetPlans.updatedBy", "UpdatedBy")
      .orderBy("BudgetPlans.version", "ASC")
      .where("BudgetPlans.parentId = :id", { id });

    const children = await query.getMany();

    const { formattedData } = await this.formattedDataForPaginate(children);

    return { children: formattedData };
  }

  async _update(id: number, data: Partial<BudgetPlan>): Promise<void> {
    await this.getRepository(BudgetPlan).update(id, data);
  }

  async _delete(id: number): Promise<void> {
    await this.getRepository(BudgetPlan).delete(id);
  }

  private async formattedDataForPaginate(data: BudgetPlan[]) {
    const formattedData = await Promise.all(
      data.map(async (item) => {
        const { children } = await this.findChildrenRecursively(item.id);

        const { countPartnerStates, countPartnerMunicipalities } =
          await this.budgetsService.countPartnersByBudgetPlanId(item.id);

        return {
          ...item,
          children,
          countPartnerStates,
          countPartnerMunicipalities,
        };
      }),
    );

    return {
      formattedData,
    };
  }

  async _findOneWithTotalById(id: number): Promise<{ valueInCents: number }> {
    const { valueInCents } = await this.getRepository(BudgetPlan)
      .createQueryBuilder("BudgetPlans")
      .innerJoin("BudgetPlans.budgets", "budgets")
      .select("SUM(budgets.valueInCents)", "valueInCents")
      .where("BudgetPlans.id = :id", { id })
      .getRawOne();

    return {
      valueInCents,
    };
  }

  async _getOptions(): Promise<optionsBudgetPlan[]> {
    return await this.getRepository(BudgetPlan)
      .createQueryBuilder("budgetPlan")
      .leftJoin("budgetPlan.program", "Program")
      .select(["budgetPlan.id AS id", "budgetPlan.programId AS parentId"])
      .addSelect(
        `
        CASE 
          WHEN budgetPlan.scenarioName IS NULL 
          THEN CONCAT(budgetPlan.year, ' ',Program.name, ' ',FORMAT(budgetPlan.version, 1))
          ELSE budgetPlan.scenarioName
        END`,
        "name",
      )
      .where("budgetPlan.status = :q", { q: BudgetPlanStatus.APROVADO })
      .getRawMany();
  }

  async _getLastYears(year: number, programId: number, limit: number) {
    const budgetPlans = [];

    let mapLimit = limit;
    let mapYear = year - 1;

    while (mapLimit) {
      const { budgetPlan } = await this._findOneByLastYear(mapYear, programId);

      if (budgetPlan) {
        mapLimit -= 1;
        budgetPlans.push(budgetPlan);
      }

      mapYear -= 1;

      if (mapYear <= 2019) {
        mapLimit = 0;
      }
    }

    return {
      budgetPlans,
    };
  }
}
