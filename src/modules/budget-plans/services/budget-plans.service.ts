import { Injectable } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import * as _ from "lodash";
import { ForbiddenError, InternalServerError } from "src/common/errors";
import { DuplicateBudgetPlanPayload } from "src/common/events/payloads";
import {
  namesForMonths,
  numbersOfMonths,
} from "src/common/utils/constants/months";
import { differenceInPercentage } from "src/common/utils/difference-in-percentage";
import { formatValueInCentsForBRL } from "src/common/utils/formats";
import { generateCsvAndSave } from "src/common/utils/generate-csv-and-save";
import { sendEmailCsvBudgetPlan } from "src/mails";
import { CostCentersService } from "src/modules/cost-centers/services/cost-centers.service";
import { BudgetResultsService } from "../../budgets/services/budget-results.service";
import { BudgetsService } from "../../budgets/services/budgets.service";
import { CostCenterSubCategoriesService } from "../../cost-centers/services/cost-center-sub-categories.service";
import { ProgramsService } from "../../programs/programs.service";
import { CreateBudgetPlanDto } from "../dto/create-budget-plan.dto";
import { CreateSceneryDto } from "../dto/create-scenery.dto";
import { optionsBudgetPlan } from "../dto/optionsBudgetPlan.dto";
import { PaginateParamsBudgetPlans } from "../dto/paginate-params-budget-plans";
import { BudgetPlan } from "../entities/budget-plan.entity";
import { BudgetPlanStatus } from "../enum";
import { ConflictExceptionBudgetPlan, NotFoundBudgetPlan } from "../errors";
import { BudgetPlansRepository } from "../repositories/typeorm/budget-plans-repository";

@Injectable()
export class BudgetPlansService {
  constructor(
    private programsService: ProgramsService,
    private readonly eventEmitter: EventEmitter2,

    private budgetResultsService: BudgetResultsService,
    private budgetsService: BudgetsService,
    private costCenterSubCategoriesService: CostCenterSubCategoriesService,
    private costCentersService: CostCentersService,

    private budgetPlansRepository: BudgetPlansRepository,
  ) {}

  async create(createBudgetPlanDto: CreateBudgetPlanDto, userId: number) {
    const { program } = await this.programsService.findOne(
      createBudgetPlanDto.programId,
    );

    if (!program.active) {
      throw new ForbiddenError();
    }

    await this.verifyExistsBudgetPlan(
      createBudgetPlanDto.year,
      createBudgetPlanDto.programId,
      1,
    );

    if (createBudgetPlanDto.yearForImport) {
      return await this.duplicate(createBudgetPlanDto, userId);
    }

    try {
      const budgetPlan = await this.budgetPlansRepository._create(
        { ...createBudgetPlanDto, version: 1.0 },
        userId,
      );

      await this.costCentersService.createMany({
        budgetPlanId: budgetPlan.id,
        program: program.abbreviation,
      });

      return {
        id: budgetPlan.id,
      };
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async duplicate(
    { programId, yearForImport, year }: CreateBudgetPlanDto,
    userId: number,
  ): Promise<void> {
    if (yearForImport === year) {
      throw new ForbiddenError();
    }

    const { budgetPlan } =
      await this.budgetPlansRepository._findOneByYearAndProgramAndVersion(
        yearForImport,
        programId,
        1,
      );

    if (!budgetPlan) {
      throw new NotFoundBudgetPlan();
    }

    try {
      const duplicateBudgetPlan = await this.budgetPlansRepository._duplicate({
        status: BudgetPlanStatus.RASCUNHO,
        version: 1.0,
        scenarioName: null,
        totalInCents: budgetPlan.totalInCents,
        programId: budgetPlan.programId,
        year,
        updatedById: userId,
      });

      await this.eventEmitter.emit("budgetPlan.duplicated", {
        budgetPlanId: duplicateBudgetPlan.id,
        oldBudgetPlanId: budgetPlan.id,
      } as DuplicateBudgetPlanPayload);
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async verifyExistsBudgetPlan(
    year: number,
    programId: number,
    version: number,
  ): Promise<void> {
    const { budgetPlan } =
      await this.budgetPlansRepository._findOneByYearAndProgramAndVersion(
        year,
        programId,
        version,
      );

    if (budgetPlan) {
      throw new ConflictExceptionBudgetPlan();
    }
  }

  async findAll(params: PaginateParamsBudgetPlans) {
    return this.budgetPlansRepository._findAll(params);
  }

  async findOne(id: number, relations = []) {
    const { budgetPlan } = await this.budgetPlansRepository._findOneById(
      id,
      relations,
    );

    if (!budgetPlan) {
      throw new NotFoundBudgetPlan();
    }

    return {
      budgetPlan,
    };
  }

  async toApprove(id: number, userId: number): Promise<void> {
    const { budgetPlan } = await this.findOne(id, ["parent"]);

    console.log(budgetPlan);
    const optionsNotApprove = [BudgetPlanStatus.APROVADO];

    if (optionsNotApprove.includes(budgetPlan.status)) {
      throw new ForbiddenError();
    }

    if (
      budgetPlan?.scenarioName?.trim() &&
      optionsNotApprove.includes(budgetPlan.parent.status)
    ) {
      throw new ForbiddenError();
    }

    try {
      await this.budgetPlansRepository._update(id, {
        status: BudgetPlanStatus.APROVADO,
        updatedById: userId,
      });

      if (budgetPlan?.scenarioName?.trim()) {
        this.copy(budgetPlan, userId);
      }
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async copy(budgetPlan: BudgetPlan, userId: number) {
    await this.budgetsService.removeByBudgetPlanId(budgetPlan.parentId);
    await this.costCentersService.removeByBudgetPlanId(budgetPlan.parentId);

    try {
      await this.budgetPlansRepository._update(budgetPlan.parentId, {
        status: BudgetPlanStatus.APROVADO,
        totalInCents: budgetPlan.totalInCents,
        updatedById: userId,
      });

      await this.eventEmitter.emit("budgetPlan.duplicated", {
        budgetPlanId: budgetPlan.parentId,
        oldBudgetPlanId: budgetPlan.id,
      } as DuplicateBudgetPlanPayload);
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async createScenery(
    { name, budgetPlanId }: CreateSceneryDto,
    userId: number,
  ) {
    const { budgetPlan } = await this.findOne(budgetPlanId, ["children"]);

    const optionsNotCreateScenery = [BudgetPlanStatus.APROVADO];

    if (
      budgetPlan.status === BudgetPlanStatus.EM_CALIBRACAO &&
      budgetPlan?.children?.length >= 2
    ) {
      throw new ForbiddenError();
    }

    if (
      optionsNotCreateScenery.includes(budgetPlan.status) ||
      budgetPlan?.scenarioName?.trim()
    ) {
      throw new ForbiddenError();
    }

    const lastChildBudgetPlan = budgetPlan?.children.at(-1);

    const version = !lastChildBudgetPlan
      ? parseFloat((budgetPlan.version + 0.1).toFixed(1))
      : parseFloat((lastChildBudgetPlan.version + 0.1).toFixed(1));

    try {
      const budgetPlanWithScenery = await this.budgetPlansRepository._duplicate(
        {
          year: budgetPlan.year,
          status: BudgetPlanStatus.RASCUNHO,
          scenarioName: name,
          totalInCents: budgetPlan.totalInCents,
          programId: budgetPlan.programId,
          parentId: budgetPlan.id,
          updatedById: userId,
          version,
        },
      );

      await this.eventEmitter.emit("budgetPlan.duplicated", {
        budgetPlanId: budgetPlanWithScenery.id,
        oldBudgetPlanId: budgetPlan.id,
      } as DuplicateBudgetPlanPayload);

      return {
        id: budgetPlanWithScenery.id,
      };
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async startCalibration(budgetPlanId: number, userId: number) {
    const { budgetPlan } = await this.verifyBudgetPlanByStatus(
      budgetPlanId,
      [BudgetPlanStatus.APROVADO],
      ["children"],
    );

    if (budgetPlan?.scenarioName?.trim()) {
      throw new ForbiddenError();
    }

    const lastChildBudgetPlan = budgetPlan?.children.at(-1);

    if (lastChildBudgetPlan?.status === BudgetPlanStatus.EM_CALIBRACAO) {
      throw new ForbiddenError();
    }

    const version = !lastChildBudgetPlan
      ? budgetPlan.version + 1
      : Math.ceil(lastChildBudgetPlan.version + 0.1);

    try {
      const budgetPlanDuplicate = await this.budgetPlansRepository._duplicate({
        year: budgetPlan.year,
        status: BudgetPlanStatus.EM_CALIBRACAO,
        scenarioName: null,
        totalInCents: budgetPlan.totalInCents,
        programId: budgetPlan.programId,
        parentId: budgetPlan.id,
        updatedById: userId,
        version,
      });

      await this.eventEmitter.emit("budgetPlan.duplicated", {
        budgetPlanId: budgetPlanDuplicate.id,
        oldBudgetPlanId: budgetPlan.id,
      } as DuplicateBudgetPlanPayload);

      return {
        id: budgetPlanDuplicate.id,
      };
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async remove(id: number): Promise<void> {
    const { budgetPlan } = await this.verifyBudgetPlanByStatus(id, [
      BudgetPlanStatus.EM_CALIBRACAO,
      BudgetPlanStatus.RASCUNHO,
    ]);

    try {
      await this.budgetPlansRepository._delete(budgetPlan.id);
    } catch (e) {
      throw new InternalServerError();
    }
  }

  async verifyBudgetPlanByStatus(
    id: number,
    status: BudgetPlanStatus[] = [],
    relations: string[] = [],
  ) {
    const { budgetPlan } = await this.findOne(id, relations);

    if (!status.includes(budgetPlan.status)) {
      throw new ForbiddenError();
    }

    return {
      budgetPlan,
    };
  }

  async generateCsv(id: number, email: string): Promise<void> {
    const csvData = await this.getOneForCsv(id);

    try {
      if (csvData.length) {
        const { fileName } = await generateCsvAndSave(csvData, "budget-plans");
        await sendEmailCsvBudgetPlan(email, fileName);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async insightsForLastFiveYears(id: number) {
    const { budgetPlan } = await this.findOne(id);

    const { formattedDataForInsights, totalInCentsForLastYears } =
      await this.getAndFormatLastYearsForInsights(budgetPlan);

    const { countPartnerMunicipalities, countPartnerStates } =
      await this.budgetsService.countPartnersByBudgetPlanId(budgetPlan.id);

    const totalPartnersCurrentPlan =
      countPartnerMunicipalities + countPartnerStates;

    const insightCurrentPlan = {
      id: budgetPlan.id,
      year: budgetPlan.year,
      totalInCents: budgetPlan.totalInCents,
      differenceValueInPercentage: null,
      countPartnerMunicipalities,
      countPartnerStates,
      medInCentsForPartners: budgetPlan.totalInCents / totalPartnersCurrentPlan,
      type: null,
    } as any;

    formattedDataForInsights.unshift(insightCurrentPlan);

    const medInCentsTheLastFiveYears =
      totalInCentsForLastYears / formattedDataForInsights.length;

    return {
      budgetPlan,
      data: formattedDataForInsights,
      medInCentsTheLastFiveYears,
    };
  }

  async findOneByLastYear(year: number, programId: number) {
    const { budgetPlan } = await this.budgetPlansRepository._findOneByLastYear(
      year,
      programId,
    );

    console.log(budgetPlan);

    if (!budgetPlan) {
      throw new NotFoundBudgetPlan();
    }

    return {
      budgetPlan,
    };
  }

  async findOneByYearAndProgram(year: number, programId: number) {
    const { budgetPlan } =
      await this.budgetPlansRepository._findOneByYearAndProgramAndVersion(
        year,
        programId,
        1,
      );

    if (!budgetPlan) {
      throw new NotFoundBudgetPlan();
    }

    return {
      budgetPlan,
    };
  }

  async consolidatedResult(year: number, programId?: number) {
    const { budgetPlans } =
      await this.budgetPlansRepository._findManyByYearAndProgram(
        year,
        programId,
      );

    return await this.formatConsolidatedResult(budgetPlans);
  }

  async consolidatedResultShared(budgetPlanIds: number[]) {
    const { budgetPlans } =
      await this.budgetPlansRepository._findManyByIds(budgetPlanIds);

    return await this.formatConsolidatedResult(budgetPlans);
  }

  async consolidatedResultForCsv(
    params: PaginateParamsBudgetPlans,
    email: string,
  ) {
    const { budgetPlans } =
      await this.budgetPlansRepository._findManyByYearAndProgram(
        params?.year,
        params?.programId,
      );

    const ids = budgetPlans.map((budgetPlan) => budgetPlan.id);

    return await this.formatAndSendEmailResultForCsv(email, ids);
  }

  async formatAndSendEmailResultForCsv(email: string, ids: number[]) {
    const csvData = [];

    await Promise.all(
      ids.map(async (id) => {
        const data = await this.getOneForCsv(id);

        csvData.push(...data);
      }),
    );

    try {
      if (csvData.length) {
        const { fileName } = await generateCsvAndSave(csvData, "budget-plans");
        await sendEmailCsvBudgetPlan(email, fileName);
      }
    } catch (e) {
      console.log(e);
    }
  }

  private async getOneForCsv(id: number) {
    const { budgetPlan } = await this.findOne(id, ["program"]);

    const csvData = [];

    const { budgets } = await this.budgetsService.findManyByBudgetPlanId(
      budgetPlan.id,
    );

    const { costCenterSubCategories } =
      await this.costCenterSubCategoriesService.findManyByBudgetPlanId(
        budgetPlan.id,
      );

    const nameBudgetPlan = `${budgetPlan.year} ${budgetPlan.program.name} ${budgetPlan.version}`;

    for (const budget of budgets) {
      for (const subCategory of costCenterSubCategories) {
        const months = await Promise.all(
          numbersOfMonths.map(async (month) => {
            const { valueInCents } =
              await this.budgetResultsService.getTotalValueByBudgetAndSubCategory(
                budget.id,
                subCategory.id,
                month,
              );

            return {
              month,
              total: formatValueInCentsForBRL(valueInCents),
            };
          }),
        );

        const formattedMonths = months.reduce((acc, item) => {
          acc[namesForMonths[item.month]] = item.total;

          return acc;
        }, {});

        const formattedForCsv = {
          plano_orcamentario_id: budgetPlan.id,
          plano_orcamentario: nameBudgetPlan,
          orcamento_id: budget.id,
          orcamento:
            budget.partnerMunicipality?.name ?? budget.partnerState?.name,
          nome_centro_custo: subCategory.costCenterCategory.costCenter.name,
          nome_categoria: subCategory.costCenterCategory.name,
          nome_sub_categoria: subCategory.name,
          tipo_sub_categoria: subCategory.type,
          ...formattedMonths,
        };

        csvData.push(formattedForCsv);
      }
    }

    return csvData;
  }

  async getOptions(): Promise<optionsBudgetPlan[]> {
    return await this.budgetPlansRepository._getOptions();
  }

  private async getAndFormatLastYearsForInsights(currentPlan: BudgetPlan) {
    const { budgetPlans } = await this.budgetPlansRepository._getLastYears(
      currentPlan.year,
      currentPlan.programId,
      4,
    );

    let totalInCentsForLastYears = currentPlan.totalInCents;

    const formattedDataForInsights = await Promise.all(
      budgetPlans.map(async (item) => {
        totalInCentsForLastYears += item.totalInCents;

        const { countPartnerMunicipalities, countPartnerStates } =
          await this.budgetsService.countPartnersByBudgetPlanId(item.id);

        const differenceValueInPercentage = differenceInPercentage(
          currentPlan.totalInCents,
          item.totalInCents,
        );

        const totalPartners = countPartnerMunicipalities + countPartnerStates;

        return {
          id: item.id,
          year: item.year,
          totalInCents: item.totalInCents,
          differenceValueInPercentage,
          countPartnerMunicipalities,
          countPartnerStates,
          medInCentsForPartners: item.totalInCents / totalPartners,
          type: differenceValueInPercentage > 0 ? "up" : "down",
        };
      }),
    );

    return {
      formattedDataForInsights,
      totalInCentsForLastYears,
    };
  }

  private async formatConsolidatedResult(budgetPlans: BudgetPlan[]) {
    const costCenters = [];
    let totalInCents: number = 0;

    await Promise.all(
      budgetPlans.map(async (budgetPlan) => {
        totalInCents += budgetPlan.totalInCents;

        const data = await this.budgetsService.findAllForMonth({
          isForMonth: 1,
          budgetPlanId: budgetPlan?.id,
          isCsv: false,
          limit: 0,
          page: 0,
          partnerMunicipalityId: null,
          partnerStateId: null,
        });

        const formattedCostCenters = data?.costCenters.map((costCenter) => {
          const categories = costCenter.categories.map((category) => {
            return {
              ...category,
              name: `${category.name} (${budgetPlan.program.abbreviation})`,
            };
          });

          return {
            ...costCenter,
            categories,
          };
        });

        costCenters.push(...formattedCostCenters);
      }),
    );

    const costCentersGroupedByName = _.groupBy(
      costCenters,
      (costCenter) => costCenter.name,
    );

    const formatCostCenters = _.map(
      costCentersGroupedByName,
      (costCenters, name) => ({
        name,
        valueInCents: _.sumBy(costCenters, "valueInCents"),
        categories: _.flatMap(costCenters, "categories"),
      }),
    );

    return {
      budgetPlans,
      data: { totalInCents, costCenters: formatCostCenters, numbersOfMonths },
    };
  }

  @OnEvent("budgetPlans.process-value", { async: true })
  private async processValue({ budgetPlanId }: { budgetPlanId: number }) {
    const { budgetPlan } = await this.findOne(budgetPlanId);
    const { valueInCents } =
      await this.budgetPlansRepository._findOneWithTotalById(budgetPlanId);

    try {
      await this.budgetPlansRepository._update(budgetPlan.id, {
        totalInCents: valueInCents,
      });
    } catch (e) {
      throw new InternalServerError();
    }
  }

  @OnEvent("budgetPlans.update", { async: true })
  protected async updateForEvent({
    budgetPlanId,
    userId,
  }: {
    budgetPlanId: number;
    userId: number;
  }) {
    const { budgetPlan } = await this.findOne(budgetPlanId);

    try {
      await this.budgetPlansRepository._update(budgetPlan.id, {
        updatedById: userId,
      });
    } catch (e) {
      throw new InternalServerError();
    }
  }
}
