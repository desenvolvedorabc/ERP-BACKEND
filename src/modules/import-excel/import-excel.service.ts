import { Injectable } from "@nestjs/common";
import { ImportExcelDTO } from "./dto/import-excel.dto";
import { UsersRepository } from "../users/repositories/typeorm/users-repository";
import { ProgramsRepository } from "../programs/repositories/typeorm/programs-repository";
import { BudgetPlansRepository } from "../budget-plans/repositories/typeorm/budget-plans-repository";
import { BudgetsRepository } from "../budgets/repositories/typeorm/budgets-repository";
import { PartnerStatesRepository } from "../partner-states/repositories/typeorm/partner-states.repository";
import { PartnerMunicipalitiesRepository } from "../partner-municipalities/repositories/typeorm/partner-municipalities.repository";
import { CostCentersRepository } from "../cost-centers/repositories/typeorm/cost-centers-repository";
import { CostCenterSubCategoriesRepository } from "../cost-centers/repositories/typeorm/cost-center-sub-categories-repository";
import { BudgetResultsRepository } from "../budgets/repositories/typeorm/budget-results-repository";
import { CostCenterCategoriesRepository } from "../cost-centers/repositories/typeorm/cost-center-categories-repository";
import * as XLSX from "xlsx";
import { ExcelTypeEnum } from "./enums/excel-type.enum";
import {
  CostCenterType,
  SubCategoryReleaseType,
  SubCategoryType,
} from "../cost-centers/enum";
import { CreateCostCenterCategoryDto } from "../cost-centers/dto/create-cost-center-category.dto";
import { CreateCostCenterSubCategoryDto } from "../cost-centers/dto/create-cost-center-sub-category.dto";
import { Budget } from "../budgets/entities/budget.entity";
import { BudgetResult } from "../budgets/entities/budget-result.entity";

import { CostCenterSubCategory } from "../cost-centers/entities/cost-center-sub-category.entity";
import * as fs from "fs";
import * as path from "path";

type TotalRow2D = { rowIndex: number; row: (string | number | null)[] };

function parseCurrencyToCents(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") {
    const result = Math.round(value * 100);
    if (result > Number.MAX_SAFE_INTEGER || result < Number.MIN_SAFE_INTEGER) {
      console.warn(`Value too large for safe conversion: ${value}, capping to safe limit`);
      return result > 0 ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
    }
    return result;
  }

  const str = String(value)
    .replace(/\u00A0/g, " ")
    .trim();
  if (str === "") return 0;
  if (str === "-" || str === "–" || str === "—") return 0;

  const isNegative = /\(.*\)/.test(str) || str.startsWith("-");
  const cleaned = str
    .replace(/\s/g, "")
    .replace(/[()]/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".");

  const num = Number(cleaned);
  if (Number.isNaN(num)) return 0;
  const cents = Math.round(num * 100);

  const result = isNegative ? -cents : cents;
  if (result > Number.MAX_SAFE_INTEGER || result < Number.MIN_SAFE_INTEGER) {
    console.warn(`Value too large for safe conversion: ${value}, capping to safe limit`);
    return result > 0 ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
  }
  
  return result;
}

@Injectable()
export class ImportExcelService {
  constructor(
    protected readonly userRepository: UsersRepository,
    protected readonly programRepository: ProgramsRepository,
    protected readonly budgetPlanRepository: BudgetPlansRepository,
    protected readonly budgetRepository: BudgetsRepository,
    protected readonly partnerStateRepository: PartnerStatesRepository,
    protected readonly partnerMunicipalityRepository: PartnerMunicipalitiesRepository,
    protected readonly costCenterRepository: CostCentersRepository,
    protected readonly costCenterCategory: CostCenterCategoriesRepository,
    protected readonly costCenterSubcategory: CostCenterSubCategoriesRepository,
    protected readonly budgetResultRepository: BudgetResultsRepository,
  ) {}

  private getBudgetForSheet(sheetName: string, budget: any): any {
    return budget;
  }

  private async findOrCreateSubcategory(
    name: string,
    costCenterCategoryId: number,
    type: SubCategoryType,
    releaseType: SubCategoryReleaseType,
  ): Promise<any> {
    const existingSubCategory = await this.costCenterSubcategory
      .getRepository(CostCenterSubCategory)
      .createQueryBuilder("subCategory")
      .where("subCategory.name = :name", { name })
      .andWhere("subCategory.costCenterCategoryId = :categoryId", {
        categoryId: costCenterCategoryId,
      })
      .andWhere("subCategory.releaseType = :releaseType", {
        releaseType: releaseType,
      })
      .getOne();

    if (existingSubCategory) {
      console.log(`DEBUG: Reutilizando subcategoria existente: '${name}' com releaseType=${existingSubCategory.releaseType}`);
      return existingSubCategory;
    }

    const subCatDto: CreateCostCenterSubCategoryDto = {
      name,
      costCenterCategoryId,
      type,
      releaseType,
    };
    const newSubCategory = await this.costCenterSubcategory._create(subCatDto);
    console.log(`DEBUG: Criando nova subcategoria: '${name}' com releaseType=${releaseType}`);
    return newSubCategory;
  }

  private mapEducationLevel(nivel: string): string {
    if (!nivel || typeof nivel !== 'string') {
      console.log("DEBUG EDUCATION: Nível vazio ou inválido, usando ENSINO_SUPERIOR como padrão");
      return "ENSINO_SUPERIOR";
    }
    
    const nivelLower = nivel
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    
    console.log(`DEBUG EDUCATION: Mapeando nível "${nivel}" -> normalizado: "${nivelLower}"`);
    
    if (nivelLower.includes("fundamental")) {
      console.log("DEBUG EDUCATION: Resultado -> FUNDAMENTAL");
      return "FUNDAMENTAL";
    } else if (nivelLower.includes("medio") || nivelLower.includes("ensino medio")) {
      console.log("DEBUG EDUCATION: Resultado -> MEDIO");
      return "MEDIO";
    } else if (nivelLower.includes("superior") || nivelLower.includes("ENSINO_SUPERIOR") || nivelLower.includes("universitario")) {
      console.log("DEBUG EDUCATION: Resultado -> ENSINO_SUPERIOR");
      return "ENSINO_SUPERIOR";
    }

    console.log("DEBUG EDUCATION: Nenhuma correspondência encontrada, usando ENSINO_SUPERIOR como padrão");
    return "ENSINO_SUPERIOR";
  }

  private extractPersonnelDataFromRow(
    sheetName: string,
    row: (string | number | null)[],
    headerRow: (string | number | null)[],
    valueInCents: number,
  ): any {
    let nivelColIndex = -1;
    let vincFuncColIndex = -1;
    let mesesColIndex = -1;
    let salarioAtualColIndex = -1;
    
    console.log(`DEBUG HEADER ROW (primeiros 15): ${JSON.stringify(headerRow.slice(0, 15))}`);
    console.log(`DEBUG HEADER ROW COMPLETO (${headerRow.length} colunas):`, headerRow.map((h, i) => `${i}:"${h}"`).join(', '));

    for (let i = 0; i < headerRow.length; i++) {
      const header = headerRow[i];
      if (typeof header === 'string') {
        const headerLower = header
          .toLowerCase()
          .trim()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        
        if (headerLower.includes('nivel') || headerLower === 'nivel') {
          nivelColIndex = i;
          console.log(`DEBUG: Encontrada coluna Nível no índice ${i}: "${header}"`);
        } else if (headerLower.includes('vinc') && (headerLower.includes('func') || headerLower.includes('funcional'))) {
          vincFuncColIndex = i;
          console.log(`DEBUG: Encontrada coluna Vinc Func no índice ${i}: "${header}"`);
        } else if (headerLower.includes('meses') || headerLower === 'meses') {
          mesesColIndex = i;
          console.log(`DEBUG: Encontrada coluna Meses no índice ${i}: "${header}"`);
        } else if ((headerLower.includes('salario') || headerLower.includes('salário')) && headerLower.includes('atual')) {
          salarioAtualColIndex = i;
          console.log(`DEBUG: Encontrada coluna Salário Atual no índice ${i}: "${header}"`);
        }
      }
    }

    const nivel = nivelColIndex >= 0 ? row[nivelColIndex] : null;
    const vincFunc = vincFuncColIndex >= 0 ? row[vincFuncColIndex] : null;
    const meses = mesesColIndex >= 0 ? row[mesesColIndex] : 12;
    const salarioAtual = salarioAtualColIndex >= 0 ? row[salarioAtualColIndex] : null;

    console.log(`DEBUG PERSONNEL RAW DATA:`);
    console.log(`  - nivel (col ${nivelColIndex}): ${JSON.stringify(nivel)} (tipo: ${typeof nivel})`);
    console.log(`  - vincFunc (col ${vincFuncColIndex}): ${JSON.stringify(vincFunc)} (tipo: ${typeof vincFunc})`);
    console.log(`  - meses (col ${mesesColIndex}): ${JSON.stringify(meses)} (tipo: ${typeof meses})`);
    console.log(`  - salarioAtual (col ${salarioAtualColIndex}): ${JSON.stringify(salarioAtual)} (tipo: ${typeof salarioAtual})`);
    console.log(`  - valueInCents: ${valueInCents}`);

    let employmentRelationship = "CLT";
    if (sheetName === "PJ") {
      employmentRelationship = "PJ";
    } else if (sheetName === "CLT") {
      employmentRelationship = "CLT";
    } else if (typeof vincFunc === 'string') {
      const vincFuncLower = vincFunc.toLowerCase();
      if (vincFuncLower.includes('pj')) {
        employmentRelationship = "PJ";
      } else if (vincFuncLower.includes('clt')) {
        employmentRelationship = "CLT";
      }
    }

    let salarioMensalInCents = valueInCents;
    
    if (salarioAtual && typeof salarioAtual === 'number') {
      salarioMensalInCents = Math.round(salarioAtual * 100);
      console.log(`DEBUG: Usando salário atual: ${salarioMensalInCents}`);
    } else {
      console.log(`DEBUG: Usando valueInCents completo como salário: ${salarioMensalInCents}`);
    }

    const data: any = {
      month: 0,
      valueInCents,
      baseValueInCents: valueInCents,
      education: this.mapEducationLevel(String(nivel || "")),
      employmentRelationship,
      numberOfFinancialDirectors: 1,
      salaryInCents: salarioMensalInCents,
      salaryAdjustment: 0,
    };

    console.log(`DEBUG FINAL DATA: education=${data.education}, employmentRelationship=${data.employmentRelationship}, salaryInCents=${data.salaryInCents}, valueInCents=${data.valueInCents}`);

    if (employmentRelationship === "CLT") {
      data.inssEmployer = 0;
      data.inss = 0;
      data.fgtsCharges = 0;
      data.pisCharges = 0;
    } else {
      data.inssEmployer = 0;
      data.inss = 0;
      data.fgtsCharges = 0;
      data.pisCharges = 0;
    }

    data.transportationVouchersInCents = 0;
    data.foodVoucherInCents = 0;
    data.healthInsuranceInCents = 0;
    data.lifeInsuranceInCents = 0;
    data.holidaysAndChargesInCents = 0;
    data.allowanceInCents = 0;
    data.thirteenthInCents = 0;
    data.fgtsInCents = 0;

    return data;
  }

  private createPersonnelData(
    sheetName: string,
    row: (string | number | null)[],
    valueInCents: number,
    headerRow?: (string | number | null)[],
  ): any {
    if (headerRow && headerRow.length > 0) {
      return this.extractPersonnelDataFromRow(sheetName, row, headerRow, valueInCents);
    }

    const data: any = {
      month: 0,
      valueInCents,
      baseValueInCents: valueInCents,
    };

    if (sheetName === "CLT" || sheetName === "Pessoal") {
      data.education = "ENSINO_SUPERIOR";
      data.employmentRelationship = "CLT";
      data.numberOfFinancialDirectors = 1;
      data.salaryInCents = valueInCents;
      data.salaryAdjustment = 0;
      data.inssEmployer = 0;
      data.inss = 0;
      data.fgtsCharges = 0;
      data.pisCharges = 0;
      data.transportationVouchersInCents = 0;
      data.foodVoucherInCents = 0;
      data.healthInsuranceInCents = 0;
      data.lifeInsuranceInCents = 0;
      data.holidaysAndChargesInCents = 0;
      data.allowanceInCents = 0;
      data.thirteenthInCents = 0;
      data.fgtsInCents = 0;
    } else if (sheetName === "PJ") {
      data.education = "ENSINO_SUPERIOR";
      data.employmentRelationship = "PJ";
      data.numberOfFinancialDirectors = 1;
      data.salaryInCents = valueInCents;
      data.salaryAdjustment = 0;
      data.inssEmployer = 0;
      data.inss = 0;
      data.fgtsCharges = 0;
      data.pisCharges = 0;
      data.transportationVouchersInCents = 0;
      data.foodVoucherInCents = 0;
      data.healthInsuranceInCents = 0;
      data.lifeInsuranceInCents = 0;
      data.holidaysAndChargesInCents = 0;
      data.allowanceInCents = 0;
      data.thirteenthInCents = 0;
      data.fgtsInCents = 0;
    }

    return data;
  }

  private createLogisticsData(
    sheetName: string,
    row: (string | number | null)[],
    valueInCents: number,
    headerRow?: (string | number | null)[],
    subCategoryName?: string,
  ): any {
    console.log(`DEBUG LOGISTICS: Criando dados de logística para aba ${sheetName}, subcategoria: ${subCategoryName}`);
    
    const data: any = {
      month: 0,
      valueInCents,
      baseValueInCents: valueInCents,
      accommodationInCents: 0,
      foodInCents: 0,
      transportInCents: 0,
      carAndFuelInCents: 0,
      airfareInCents: 0,
      numberOfPeople: 1,
      dailyAccommodation: 0,
      dailyFood: 0,
      dailyTransport: 0,
      dailyCarAndFuel: 0,
      totalTrips: 1,
    };

    if (subCategoryName) {
      const subCategoryLower = subCategoryName.toLowerCase();
      
      if (subCategoryLower.includes('passagem') || 
          subCategoryLower.includes('aérea') || 
          subCategoryLower.includes('aerea') ||
          subCategoryLower.includes('airfare') ||
          subCategoryLower.includes('voo')) {
        data.airfareInCents = valueInCents;
        console.log(`DEBUG LOGISTICS: Detectado como passagem aérea`);
      } else if (subCategoryLower.includes('hospedagem') || 
                 subCategoryLower.includes('hotel') ||
                 subCategoryLower.includes('accommodation')) {
        data.accommodationInCents = valueInCents;
        data.dailyAccommodation = 1;
        console.log(`DEBUG LOGISTICS: Detectado como hospedagem`);
      } else if (subCategoryLower.includes('alimentação') ||
                 subCategoryLower.includes('alimentacao') ||
                 subCategoryLower.includes('refeição') ||
                 subCategoryLower.includes('refeicao') ||
                 subCategoryLower.includes('food')) {
        data.foodInCents = valueInCents;
        data.dailyFood = 1;
        console.log(`DEBUG LOGISTICS: Detectado como alimentação`);
      } else if (subCategoryLower.includes('transporte') ||
                 subCategoryLower.includes('locomoção') ||
                 subCategoryLower.includes('locomocao') ||
                 subCategoryLower.includes('transport')) {
        data.transportInCents = valueInCents;
        data.dailyTransport = 1;
        console.log(`DEBUG LOGISTICS: Detectado como transporte`);
      } else if (subCategoryLower.includes('combustível') ||
                 subCategoryLower.includes('combustivel') ||
                 subCategoryLower.includes('fuel') ||
                 subCategoryLower.includes('carro')) {
        data.carAndFuelInCents = valueInCents;
        data.dailyCarAndFuel = 1;
        console.log(`DEBUG LOGISTICS: Detectado como combustível/carro`);
      } else {
        const distributedValue = Math.round(valueInCents / 3);
        data.airfareInCents = distributedValue;
        data.accommodationInCents = distributedValue;
        data.foodInCents = valueInCents - (distributedValue * 2);
        data.dailyAccommodation = 1;
        data.dailyFood = 1;
        console.log(`DEBUG LOGISTICS: Não detectado tipo específico, distribuindo igualmente`);
      }
    } else {
      data.airfareInCents = valueInCents;
      console.log(`DEBUG LOGISTICS: Sem subcategoria, usando passagem aérea como padrão`);
    }

    console.log(`DEBUG LOGISTICS DATA: airfare=${data.airfareInCents}, accommodation=${data.accommodationInCents}, food=${data.foodInCents}, transport=${data.transportInCents}, carFuel=${data.carAndFuelInCents}`);
    
    return data;
  }

  private async createOrUpdateBudgetResult(
    budgetId: number,
    costCenterCategoryId: number,
    costCenterSubCategoryId: number,
    month: number,
    valueInCents: number,
    releaseType?: SubCategoryReleaseType,
    sheetName?: string,
    row?: (string | number | null)[],
    headerRow?: (string | number | null)[],
    subCategoryName?: string,
  ): Promise<void> {
    const existingResult = await this.budgetResultRepository
      .getRepository(BudgetResult)
      .createQueryBuilder("br")
      .where("br.budgetId = :budgetId", { budgetId })
      .andWhere("br.costCenterCategoryId = :categoryId", {
        categoryId: costCenterCategoryId,
      })
      .andWhere("br.costCenterSubCategoryId = :subCategoryId", {
        subCategoryId: costCenterSubCategoryId,
      })
      .andWhere("br.month = :month", { month })
      .getOne();

    let baseData: any = {
      month,
      valueInCents,
      baseValueInCents: valueInCents,
    };

    if (sheetName && (sheetName === "CLT" || sheetName === "PJ" || sheetName === "Pessoal")) {
      baseData = this.createPersonnelData(sheetName, row || [], valueInCents, headerRow);
      baseData.month = month;
    } else if (sheetName === "Logística") {
      baseData = this.createLogisticsData(sheetName, row || [], valueInCents, headerRow, subCategoryName);
      baseData.month = month;
    } else if (releaseType === SubCategoryReleaseType.IPCA) {
      baseData.ipca = 0;
      baseData.justification = null;
    } else if (releaseType === SubCategoryReleaseType.DESPESAS_PESSOAIS) {
      baseData.education = "ENSINO_SUPERIOR";
      baseData.employmentRelationship = "CLT";
      baseData.numberOfFinancialDirectors = 1;
      baseData.salaryInCents = valueInCents;
      baseData.salaryAdjustment = 0;
      baseData.inssEmployer = 0;
      baseData.inss = 0;
      baseData.fgtsCharges = 0;
      baseData.pisCharges = 0;
      baseData.transportationVouchersInCents = 0;
      baseData.foodVoucherInCents = 0;
      baseData.healthInsuranceInCents = 0;
      baseData.lifeInsuranceInCents = 0;
      baseData.holidaysAndChargesInCents = 0;
      baseData.allowanceInCents = 0;
      baseData.thirteenthInCents = 0;
      baseData.fgtsInCents = 0;
    } else if (releaseType === SubCategoryReleaseType.DESPESAS_LOGISTICAS) {
      baseData.accommodationInCents = 0;
      baseData.foodInCents = 0;
      baseData.transportInCents = 0;
      baseData.carAndFuelInCents = 0;
      baseData.airfareInCents = 0;
      baseData.numberOfPeople = 1;
      baseData.dailyAccommodation = 0;
      baseData.dailyFood = 0;
      baseData.dailyTransport = 0;
      baseData.dailyCarAndFuel = 0;
      baseData.totalTrips = 0;
    }

    if (existingResult) {
      await this.budgetResultRepository
        .getRepository(BudgetResult)
        .update(existingResult.id, { valueInCents });
    } else {
      await this.budgetResultRepository._create({
        budgetId,
        costCenterCategoryId,
        costCenterSubCategoryId,
        month,
        valueInCents,
        data: baseData,
      });
    }
  }

  private async createOrUpdateBudgetResultLogistics(
    budgetId: number,
    costCenterCategoryId: number,
    costCenterSubCategoryId: number,
    month: number,
    valueInCents: number,
    row: (string | number | null)[],
    subCategoryName: string,
  ): Promise<void> {
    const existingResult = await this.budgetResultRepository
      .getRepository(BudgetResult)
      .createQueryBuilder("br")
      .where("br.budgetId = :budgetId", { budgetId })
      .andWhere("br.costCenterCategoryId = :categoryId", {
        categoryId: costCenterCategoryId,
      })
      .andWhere("br.costCenterSubCategoryId = :subCategoryId", {
        subCategoryId: costCenterSubCategoryId,
      })
      .andWhere("br.month = :month", { month })
      .getOne();

    const subCategoryNameLower = subCategoryName.toLowerCase();

    let airfareInCents = 0;
    let accommodationInCents = 0;
    let transportInCents = 0;
    let foodInCents = 0;
    let carAndFuelInCents = 0;
    const numberOfPeople = 1;
    let dailyAccommodation = 0;
    let dailyFood = 0;
    let dailyTransport = 0;
    let dailyCarAndFuel = 0;
    const totalTrips = 1;

    if (
      subCategoryNameLower.includes("passagem") ||
      subCategoryNameLower.includes("airfare") ||
      subCategoryNameLower.includes("aéreo") ||
      subCategoryNameLower.includes("passagens aéreas")
    ) {
      airfareInCents = valueInCents;
    } else if (
      subCategoryNameLower.includes("hospedagem") ||
      subCategoryNameLower.includes("accommodation") ||
      subCategoryNameLower.includes("hotel")
    ) {
      accommodationInCents = valueInCents;
      dailyAccommodation = 1;
    } else if (
      subCategoryNameLower.includes("transporte") ||
      subCategoryNameLower.includes("transport") ||
      subCategoryNameLower.includes("locomoção") ||
      subCategoryNameLower.includes("despesas de viagem")
    ) {
      transportInCents = valueInCents;
      dailyTransport = 1;
    } else if (
      subCategoryNameLower.includes("alimentação") ||
      subCategoryNameLower.includes("food") ||
      subCategoryNameLower.includes("refeição")
    ) {
      foodInCents = valueInCents;
      dailyFood = 1;
    } else if (
      subCategoryNameLower.includes("combustível") ||
      subCategoryNameLower.includes("fuel") ||
      subCategoryNameLower.includes("carro")
    ) {
      carAndFuelInCents = valueInCents;
      dailyCarAndFuel = 1;
    } else {
      const distributedValue = Math.round(valueInCents / 3);
      accommodationInCents = distributedValue;
      transportInCents = distributedValue;
      foodInCents = valueInCents - distributedValue * 2;
      dailyAccommodation = 1;
      dailyTransport = 1;
      dailyFood = 1;
    }

    const baseData: any = {
      month,
      valueInCents,
      baseValueInCents: valueInCents,
      accommodationInCents,
      foodInCents,
      transportInCents,
      carAndFuelInCents,
      airfareInCents,
      numberOfPeople,
      dailyAccommodation,
      dailyFood,
      dailyTransport,
      dailyCarAndFuel,
      totalTrips,
    };

    if (existingResult) {
      await this.budgetResultRepository
        .getRepository(BudgetResult)
        .update(existingResult.id, {
          valueInCents,
          data: baseData,
        });
    } else {
      await this.budgetResultRepository._create({
        budgetId,
        costCenterCategoryId,
        costCenterSubCategoryId,
        month,
        valueInCents,
        data: baseData,
      });
    }
  }

  private async debugBudgetResults(budgetPlanId: number): Promise<void> {
    const allResults = await this.budgetResultRepository.query(
      `
      SELECT 
        br.*, 
        ccs.name as subCategoryName, 
        ccc.name as categoryName,
        b.id as budgetId,
        ps.abbreviation as stateAbbr
      FROM budget_results br
      JOIN cost_centers_sub_categories ccs ON br.costCenterSubCategoryId = ccs.id
      JOIN cost_centers_categories ccc ON br.costCenterCategoryId = ccc.id
      JOIN budgets b ON br.budgetId = b.id
      JOIN partner_states ps ON b.partnerStateId = ps.id
      WHERE b.budgetPlanId = ?
      ORDER BY b.id, br.costCenterSubCategoryId, br.month
    `,
      [budgetPlanId],
    );

    console.log(`\n=== DEBUG BUDGET RESULTS ===`);

    if (!allResults || !Array.isArray(allResults)) {
      console.log("Nenhum resultado encontrado ou formato inválido");
      console.log(`=== FIM DEBUG ===\n`);
      return;
    }

    console.log(`Total de BudgetResults encontrados: ${allResults.length}`);

    const budgetGroups = (allResults as any[]).reduce(
      (acc, result) => {
        const key = `${result.stateAbbr} (Budget ID: ${result.budgetId})`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(result);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    for (const [budgetKey, results] of Object.entries(budgetGroups)) {
      console.log(`\n${budgetKey}:`);
      if (Array.isArray(results)) {
        for (const result of results) {
          console.log(
            `  - Mês ${result.month}: ${result.categoryName} > ${result.subCategoryName} = ${result.valueInCents} centavos`,
          );
        }
      }
    }
    console.log(`=== FIM DEBUG ===\n`);
  }

  readonly tabsPARC = [
    "Consultoria Estratégica",
    "Consultoria Temática",
    "Consultoria de Base",
    "Logística",
    "Avaliação",
    "Eventos",
    "Administração",
    "Orçamento 2025",
  ];

  readonly tabsEPV = [
    "Consultoria",
    "Pessoal",
    "Comunicação_Inovação",
    "Logística",
    "Avaliação externa",
    "Eventos",
    "Produção de conteúdo",
    "Administração",
    "CLT",
    "PJ",
  ];

  private extractCategories(data: Record<string, any>[]): string[] {
    const categories: string[] = [];
    for (const row of data) {
      for (const key in row) {
        const value = row[key];
        if (typeof value === "string" && value.trim().startsWith("-")) {
          categories.push(value.trim());
        }
      }
    }
    return categories;
  }

  private extractTotalRows2DFromSheet(worksheet: XLSX.WorkSheet): TotalRow2D[] {
    const rows2D = XLSX.utils.sheet_to_json<(string | number | null)[]>(
      worksheet,
      {
        header: 1,
        raw: false,
      },
    );

    const totals: TotalRow2D[] = [];
    for (let i = 0; i < rows2D.length; i++) {
      const row = rows2D[i];
      if (!Array.isArray(row)) continue;

      const firstNonEmpty = row.find(
        (cell) =>
          cell !== undefined && cell !== null && String(cell).trim() !== "",
      );

      if (
        typeof firstNonEmpty === "string" &&
        firstNonEmpty.trim().toLowerCase() === "total (r$)"
      ) {
        totals.push({ rowIndex: i, row });
      }
    }
    return totals;
  }

  async import(file: Express.Multer.File, body: ImportExcelDTO) {
    const { typeExcel } = body;

    const workbook = XLSX.read(file.buffer);
    const sheetNames = workbook.SheetNames;
    const sheetsData: Record<string, any[]> = {};
    const mappedData: Record<string, any[]> = {};
    const categoriesData: Record<string, string[]> = {};
    const totalsData: Record<string, TotalRow2D[]> = {};

    for (const sheetName of sheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      totalsData[sheetName] = this.extractTotalRows2DFromSheet(worksheet);

      const rows2D = XLSX.utils.sheet_to_json<(string | number | null)[]>(
        worksheet,
        {
          header: 1,
          raw: true,
        },
      );

      const monthNames = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ];
      let headerRowIndex = -1;
      let categoryColIndex = -1;
      let salarioColIndex = -1;
      const monthColIndexes: number[] = [];

      let maxMonthCount = -1;
      for (let r = 0; r < rows2D.length; r++) {
        const row = rows2D[r];
        let count = 0;
        for (let c = 0; c < row.length; c++) {
          const cell = row[c];
          if (typeof cell === "string") {
            const normalized = cell
              .replace(/\u00A0/g, " ")
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .trim()
              .toLowerCase();
            const idx = monthNames.findIndex(
              (m) => m.toLowerCase() === normalized,
            );
            if (idx !== -1) count++;
          }
        }
        if (count > maxMonthCount) {
          maxMonthCount = count;
          headerRowIndex = r;
        }
      }

      if (headerRowIndex !== -1) {
        const headerRow = rows2D[headerRowIndex];
        for (let c = 0; c < headerRow.length; c++) {
          const cell = headerRow[c];
          if (typeof cell === "string") {
            const normalized = cell
              .replace(/\u00A0/g, " ")
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .trim()
              .toLowerCase();
            const idx = monthNames.findIndex(
              (m) => m.toLowerCase() === normalized,
            );
            if (idx !== -1) monthColIndexes[idx] = c;
            if (normalized === "funcao" || normalized === "funcao ")
              categoryColIndex = c;
            if (normalized.startsWith("salario")) salarioColIndex = c;
          }
        }
      }

      if (categoryColIndex === -1 && headerRowIndex !== -1) {
        const headerRow = rows2D[headerRowIndex];
        const firstMonthCol = monthColIndexes
          .filter((v) => typeof v === "number")
          .sort((a, b) => a - b)[0];
        if (typeof firstMonthCol === "number") {
          for (let c = firstMonthCol - 1; c >= 0; c--) {
            const cell = headerRow[c];
            if (typeof cell === "string" && cell.trim() !== "") {
              categoryColIndex = c;
              break;
            }
          }
        }
        if (categoryColIndex === -1) categoryColIndex = 0;
      }

      const foundMonthCols = monthColIndexes.filter(
        (v) => typeof v === "number",
      ) as number[];
      let firstMonthCol = foundMonthCols.length
        ? Math.min(...foundMonthCols)
        : -1;
      if (firstMonthCol === -1 && salarioColIndex !== -1) {
        firstMonthCol = salarioColIndex + 1;
      }
      if (firstMonthCol !== -1) {
        for (let i = 0; i < 12; i++) {
          if (typeof monthColIndexes[i] !== "number")
            monthColIndexes[i] = firstMonthCol + i;
        }
      }

      const normalizedRows: any[] = [];
      const foundCategories: string[] = [];
      if (headerRowIndex !== -1 && categoryColIndex !== -1) {
        for (let r = headerRowIndex; r < rows2D.length; r++) {
          const row = rows2D[r];
          const funcName =
            typeof row[categoryColIndex] === "string"
              ? row[categoryColIndex]
              : null;
          const obj: Record<string, any> = {};
          if (funcName)
            obj["Função"] = String(funcName)
              .replace(/\u00A0/g, " ")
              .trim();
          for (let m = 0; m < monthNames.length; m++) {
            const cIdx = monthColIndexes[m];
            obj[monthNames[m]] =
              typeof cIdx === "number" ? (row[cIdx] ?? null) : null;
          }
          normalizedRows.push(obj);
          if (funcName && String(funcName).trim().startsWith("-")) {
            foundCategories.push(String(funcName).trim());
          }
        }
      }

      sheetsData[sheetName] = rows2D;
      mappedData[sheetName] = normalizedRows;
      categoriesData[sheetName] = foundCategories;
    }

    switch (typeExcel) {
      case ExcelTypeEnum.EPV:
        return {
          message: "EPV processado.",
          originalData: sheetsData,
          mappedData,
          categories: categoriesData,
          totals: totalsData,
          processedData: await this.processEPV(file),
        };
      case ExcelTypeEnum.PARC:
        return {
          message: "PARC processado.",
          originalData: sheetsData,
          mappedData,
          categories: categoriesData,
          totals: totalsData,
          processedData: await this.processPARC(file),
        };
    }
  }

  protected async processPARC(file: Express.Multer.File) {
    const startedAt = new Date();
    const timestamp = startedAt.toISOString().replace(/[:.]/g, "-");
    const logDir = path.resolve(process.cwd(), "logs");
    try {
      fs.mkdirSync(logDir, { recursive: true });
    } catch {}
    const logPath = path.join(logDir, `import-parc-${timestamp}.txt`);
    const logs: string[] = [];
    const log = (line: string) => logs.push(line);
    log("=== Import PARC - início ===");
    log(`Data/Hora: ${startedAt.toISOString()}`);

    try {
      log("Iniciando criação das entidades básicas...");

      const user = await this.userRepository._create({
        cpf: process.env.DEFAULT_IMPORT_CPF || "00000000000",
        email: process.env.DEFAULT_IMPORT_EMAIL || "admin@example.com",
        name: process.env.DEFAULT_IMPORT_NAME || "Admin",
        password: process.env.DEFAULT_IMPORT_PASSWORD || "changeme",
        telephone: process.env.DEFAULT_IMPORT_PHONE || "0000000000",
        massApprovalPermission: false,
      });
      log("User criado com sucesso");

      log(`Buscando programa PARC existente...`);
      const existingPrograms = await this.programRepository.query(`
        SELECT * FROM programs 
        WHERE abbreviation = 'PARC'
        ORDER BY id DESC
        LIMIT 1
      `);

      let program;
      if (existingPrograms && existingPrograms.length > 0) {
        program = existingPrograms[0];
        log(`Programa reutilizado: ${program.name} (ID: ${program.id})`);
      } else {
        log(`Criando novo programa PARC...`);
        program = await this.programRepository._create({
          name: "PARC",
          abbreviation: "PARC",
          director: "Vinícius Basílio",
          description: "Descrição do programa PARC",
        });
        log(`Programa criado: ${program.name} (ID: ${program.id})`);
      }

      log(`Buscando BudgetPlan existente para programa PARC...`);
      const existingBudgetPlans = await this.budgetPlanRepository.query(
        `
        SELECT * FROM budget_plans 
        WHERE programId = ? AND year = 2025
        ORDER BY id DESC
        LIMIT 1
      `,
        [program.id],
      );

      let budgetPlan;
      if (existingBudgetPlans && existingBudgetPlans.length > 0) {
        budgetPlan = existingBudgetPlans[0];
        log(
          `BudgetPlan reutilizado: ID ${budgetPlan.id} (versão ${budgetPlan.version})`,
        );
      } else {
        log(`Criando novo BudgetPlan...`);
        budgetPlan = await this.budgetPlanRepository._create(
          {
            programId: program.id,
            version: 1.0,
            year: 2025,
            yearForImport: 2025,
          },
          user.id,
        );
        log(`BudgetPlan criado: ID ${budgetPlan.id}`);
      }

      const partnerState = await this.partnerStateRepository._create({
        name: "Ceará",
        abbreviation: "CE",
      });

      const partnerMunicipality =
        await this.partnerMunicipalityRepository._create({
          name: "Fortaleza",
          uf: "CE",
          cod: "2304400",
        });

      log(
        `LIMPEZA INTELIGENTE - apenas removendo budget_results órfãos para permitir reutilização de entidades`,
      );

      const budgetsToClean = await this.budgetRepository
        .getRepository(Budget)
        .createQueryBuilder("budget")
        .select("budget.id")
        .where("budget.partnerStateId = :stateId", { stateId: partnerState.id })
        .andWhere("budget.partnerMunicipalityId IS NULL")
        .getMany();

      if (budgetsToClean.length > 0) {
        const budgetIds = budgetsToClean.map((b) => b.id);
        const orphanedCount = await this.budgetResultRepository
          .getRepository(BudgetResult)
          .createQueryBuilder("br")
          .where("br.budgetId IN (:...budgetIds)", { budgetIds })
          .getCount();

        if (orphanedCount > 0) {
          log(
            `Removendo ${orphanedCount} budget_results órfãos para permitir atualização...`,
          );
          await this.budgetResultRepository
            .getRepository(BudgetResult)
            .createQueryBuilder()
            .delete()
            .where("budgetId IN (:...budgetIds)", { budgetIds })
            .execute();
          log(`Budget_results órfãos removidos`);
        } else {
          log(`Nenhum budget_result órfão encontrado`);
        }
      } else {
        log(`Nenhum budget_result órfão encontrado`);
      }

      log(`Criando Budget principal...`);
      const budget = await this.budgetRepository._create({
        budgetPlanId: budgetPlan.id,
        partnerStateId: partnerState.id,
        partnerMunicipalityId: undefined,
      });
      log(`Budget principal criado com ID: ${budget.id}`);

      log(`BudgetPlan ID: ${budgetPlan.id} | Budget ID: ${budget.id}`);
      log("Entidades básicas criadas com sucesso");

      const workbook = XLSX.read(file.buffer);
      log(`Workbook lido com ${workbook.SheetNames.length} abas`);

      const excelDebugPath = path.join(
        logDir,
        `excel-completo-${timestamp}.txt`,
      );
      const excelDebugLines: string[] = [];
      excelDebugLines.push("=== EXCEL COMPLETO - DEBUG ===");
      excelDebugLines.push(`Data/Hora: ${startedAt.toISOString()}`);
      excelDebugLines.push(`Total de abas: ${workbook.SheetNames.length}`);

      for (const sheetName of workbook.SheetNames) {
        excelDebugLines.push(`\n=== ABA: ${sheetName} ===`);
        const worksheet = workbook.Sheets[sheetName];

        const rows2D = XLSX.utils.sheet_to_json<(string | number | null)[]>(
          worksheet,
          {
            header: 1,
            raw: true,
          },
        );

        excelDebugLines.push(`Total de linhas: ${rows2D.length}`);

        for (let r = 0; r < Math.min(50, rows2D.length); r++) {
          const row = rows2D[r];
          if (!row || row.length === 0) {
            excelDebugLines.push(`Linha ${r}: [VAZIA]`);
            continue;
          }

          const rowStr = row
            .map((cell) => {
              if (cell === null || cell === undefined) return "NULL";
              if (typeof cell === "string") return `"${cell}"`;
              return String(cell);
            })
            .join(" | ");

          excelDebugLines.push(`Linha ${r}: [${rowStr}]`);
        }

        if (rows2D.length > 50) {
          excelDebugLines.push(`... e mais ${rows2D.length - 50} linhas`);
        }
      }

      try {
        fs.writeFileSync(excelDebugPath, excelDebugLines.join("\n"), "utf8");
        log(`Arquivo de debug do Excel criado: ${excelDebugPath}`);
      } catch (e) {
        log(`ERRO ao criar arquivo de debug: ${e}`);
      }

      const createdCategories: Record<string, any[]> = {};
      const createdSubcategories: Record<string, any[]> = {};
      const totalsData: Record<string, TotalRow2D[]> = {};

      const costCenters: Record<string, any> = {};

      log("Processando abas para identificar centros de custo reais...");

      for (const sheetName of workbook.SheetNames) {
        if (!this.tabsPARC.includes(sheetName)) continue;

        const worksheet = workbook.Sheets[sheetName];
        log(`\n--- Processando aba: ${sheetName} ---`);

        totalsData[sheetName] = this.extractTotalRows2DFromSheet(worksheet);

        const rows2D = XLSX.utils.sheet_to_json<(string | number | null)[]>(
          worksheet,
          {
            header: 1,
            raw: true,
          },
        );
        log(`rows2D.length: ${rows2D.length}`);

        const monthNames = [
          "Jan",
          "Fev",
          "Mar",
          "Abr",
          "Mai",
          "Jun",
          "Jul",
          "Ago",
          "Set",
          "Out",
          "Nov",
          "Dez",
        ];
        let headerRowIndex = -1;
        let categoryColIndex = -1;
        let salarioColIndex = -1;
        const monthColIndexes: number[] = [];

        let maxMonthCount = -1;
        for (let r = 0; r < rows2D.length; r++) {
          const row = rows2D[r];
          let count = 0;
          for (let c = 0; c < row.length; c++) {
            const cell = row[c];
            if (typeof cell === "string") {
              const normalized = cell
                .replace(/\u00A0/g, " ")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim()
                .toLowerCase();
              const idx = monthNames.findIndex(
                (m) => m.toLowerCase() === normalized,
              );
              if (idx !== -1) count++;
            }
          }
          if (count > maxMonthCount) {
            maxMonthCount = count;
            headerRowIndex = r;
          }
        }
        log(
          `headerRowIndex: ${headerRowIndex} (maxMonthCount: ${maxMonthCount})`,
        );

        if (headerRowIndex !== -1) {
          const headerRow = rows2D[headerRowIndex];
          for (let c = 0; c < headerRow.length; c++) {
            const cell = headerRow[c];
            if (typeof cell === "string") {
              const normalized = cell
                .replace(/\u00A0/g, " ")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim()
                .toLowerCase();
              const idx = monthNames.findIndex(
                (m) => m.toLowerCase() === normalized,
              );
              if (idx !== -1) monthColIndexes[idx] = c;
              if (normalized === "funcao") categoryColIndex = c;
              if (normalized.startsWith("salario")) salarioColIndex = c;
            }
          }
        }
        log(
          `categoryColIndex: ${categoryColIndex} | salarioColIndex: ${salarioColIndex}`,
        );
        log(`monthColIndexes (Jan..Dez): [${monthColIndexes.join(", ")}]`);

        if (categoryColIndex === -1 && headerRowIndex !== -1) {
          const headerRow = rows2D[headerRowIndex];
          const firstMonthCol = monthColIndexes
            .filter((v) => typeof v === "number")
            .sort((a, b) => a - b)[0];
          if (typeof firstMonthCol === "number") {
            for (let c = firstMonthCol - 1; c >= 0; c--) {
              const cell = headerRow[c];
              if (typeof cell === "string" && cell.trim() !== "") {
                categoryColIndex = c;
                break;
              }
            }
          }
          if (categoryColIndex === -1) categoryColIndex = 0;
        }

        if (categoryColIndex === -1) {
          for (let c = 0; c < (rows2D[0]?.length || 0); c++) {
            let hasText = false;
            for (
              let r = Math.max(0, headerRowIndex - 2);
              r < Math.min(rows2D.length, headerRowIndex + 5);
              r++
            ) {
              const cell = rows2D[r]?.[c];
              if (typeof cell === "string" && cell.trim() !== "") {
                hasText = true;
                break;
              }
            }
            if (hasText) {
              categoryColIndex = c;
              log(`Coluna de categoria encontrada por fallback: ${c}`);
              break;
            }
          }
        }

        if (categoryColIndex === -1) {
          for (let c = 0; c < (rows2D[0]?.length || 0); c++) {
            let hasCategoryPattern = false;
            for (
              let r = 0;
              r <
              Math.min(
                rows2D.length,
                headerRowIndex === -1 ? rows2D.length : headerRowIndex + 50,
              );
              r++
            ) {
              const cell = rows2D[r]?.[c];
              if (typeof cell === "string" && cell.trim().startsWith("-")) {
                hasCategoryPattern = true;
                break;
              }
            }
            if (hasCategoryPattern) {
              categoryColIndex = c;
              log(
                `Coluna de categoria encontrada por padrão de categoria: ${c}`,
              );
              break;
            }
          }
        }

        if (categoryColIndex === -1) {
          categoryColIndex = 0;
          log(`Usando primeira coluna como coluna de categoria`);
        }

        if (headerRowIndex === -1) {
          headerRowIndex = 0;
          log(`Usando primeira linha como linha de cabeçalho`);
        }

        let nameColIndex = -1;
        if (headerRowIndex !== -1) {
          const headerRow = rows2D[headerRowIndex];
          const pickBy = (pred: (t: string) => boolean) => {
            for (let c = 0; c < headerRow.length; c++) {
              const cell = headerRow[c];
              if (typeof cell !== "string") continue;
              const normalized = cell
                .replace(/\u00A0/g, " ")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim()
                .toLowerCase();
              if (pred(normalized)) return c;
            }
            return -1;
          };

          nameColIndex = pickBy((t) => t === "funcao" || t.includes("funcao"));
          if (nameColIndex === -1)
            nameColIndex = pickBy((t) => t.includes("produto"));
          if (nameColIndex === -1)
            nameColIndex = pickBy((t) => t.includes("categoria"));
          if (nameColIndex === -1)
            nameColIndex = pickBy(
              (t) => t.includes("centro de custo") || t === "centro de custo",
            );
          if (nameColIndex === -1)
            nameColIndex = pickBy((t) => t === "tema" || t.includes("tema"));

          if (
            nameColIndex === -1 &&
            monthColIndexes.some((x) => typeof x === "number")
          ) {
            const firstMonthCol = monthColIndexes
              .filter((x) => typeof x === "number")
              .sort((a, b) => a - b)[0];
            if (typeof firstMonthCol === "number") {
              nameColIndex = Math.max(0, firstMonthCol - 1);
            }
          }
        }
        if (nameColIndex === -1) {
          for (
            let c = 0;
            c < (rows2D[0]?.length || 0) && nameColIndex === -1;
            c++
          ) {
            for (
              let r = headerRowIndex + 1;
              r < Math.min(rows2D.length, headerRowIndex + 10);
              r++
            ) {
              const cell = rows2D[r]?.[c];
              if (typeof cell === "string" && cell.trim()) {
                nameColIndex = c;
                break;
              }
            }
          }
        }
        if (nameColIndex === -1) nameColIndex = categoryColIndex;
        log(`categoryColIndex após fallback: ${categoryColIndex}`);
        log(`nameColIndex (coluna de nome): ${nameColIndex}`);

        const foundMonthColsSeq = monthColIndexes.filter(
          (v) => typeof v === "number",
        ) as number[];
        let firstMonthColSeq = foundMonthColsSeq.length
          ? Math.min(...foundMonthColsSeq)
          : -1;
        if (firstMonthColSeq === -1 && salarioColIndex !== -1) {
          firstMonthColSeq = salarioColIndex + 1;
        }

        if (firstMonthColSeq === -1 && nameColIndex !== -1) {
          firstMonthColSeq = nameColIndex + 1;
        }
        if (firstMonthColSeq !== -1) {
          for (let i = 0; i < 12; i++) {
            if (typeof monthColIndexes[i] !== "number")
              monthColIndexes[i] = firstMonthColSeq + i;
          }
        }

        createdCategories[sheetName] = [];
        createdSubcategories[sheetName] = [];

        log(`Processando aba principal: ${sheetName}`);

        log(`Iniciando processamento das linhas da aba ${sheetName}...`);

        log(`Procurando por categorias em todas as colunas/linhas da aba...`);
        const categoryMarkers: {
          rowIndex: number;
          id: number;
          name: string;
        }[] = [];

        const validCategories: string[] = [];
        for (let r = 0; r < rows2D.length; r++) {
          const row = rows2D[r];
          for (let c = 0; c < row.length; c++) {
            const cellRaw = row[c];
            const cell =
              typeof cellRaw === "string"
                ? cellRaw.replace(/\u00A0/g, " ").trim()
                : "";
            if (!cell) continue;
            if (cell.startsWith("-")) {
              const cleanCategoryName = cell.replace(/^-\s*/, "").trim();

              if (cleanCategoryName.match(/^\d+\.\s/)) {
                validCategories.push(cleanCategoryName);
                log(`Categoria válida encontrada: '${cleanCategoryName}'`);
              } else {
                log(
                  `Categoria ignorada (não começa com número): '${cleanCategoryName}'`,
                );
              }
              break;
            }
          }
        }

        for (const categoryName of validCategories) {
          const baseName = categoryName.replace(/^\d+\.\s*/, "").trim();

          if (!costCenters[baseName]) {
            const costCenter = await this.costCenterRepository._create({
              budgetPlanId: budgetPlan.id,
              name: baseName,
              type: CostCenterType.PAGAR,
            });
            costCenters[baseName] = costCenter;
            log(`CostCenter criado para '${baseName}' com ID ${costCenter.id}`);
          }
        }

        for (let r = 0; r < rows2D.length; r++) {
          const row = rows2D[r];
          for (let c = 0; c < row.length; c++) {
            const cellRaw = row[c];
            const cell =
              typeof cellRaw === "string"
                ? cellRaw.replace(/\u00A0/g, " ").trim()
                : "";
            if (!cell) continue;
            if (cell.startsWith("-")) {
              const cleanCategoryName = cell.replace(/^-\s*/, "").trim();

              if (cleanCategoryName.match(/^\d+\.\s/)) {
                const baseName = cleanCategoryName
                  .replace(/^\d+\.\s*/, "")
                  .trim();
                const costCenter = costCenters[baseName];

                if (costCenter) {
                  const exists = createdCategories[sheetName].find(
                    (cat) =>
                      cat.name.toLowerCase().trim() ===
                      cleanCategoryName.toLowerCase().trim(),
                  );
                  if (!exists) {
                    const categoryDto: CreateCostCenterCategoryDto = {
                      name: cleanCategoryName,
                      costCenterId: costCenter.id,
                      subCategories: [],
                    };
                    const category =
                      await this.costCenterCategory._create(categoryDto);
                    createdCategories[sheetName].push(category);
                    categoryMarkers.push({
                      rowIndex: r,
                      id: category.id,
                      name: cleanCategoryName,
                    });
                    log(
                      `Categoria encontrada e criada: '${cleanCategoryName}' (id=${category.id}) na linha ${r}, coluna ${c}`,
                    );
                  } else {
                    categoryMarkers.push({
                      rowIndex: r,
                      id: exists.id,
                      name: exists.name,
                    });
                    log(
                      `Categoria já existente referenciada: '${exists.name}' (id=${exists.id}) na linha ${r}, coluna ${c}`,
                    );
                  }
                } else {
                  log(
                    `ERRO: CostCenter não encontrado para categoria '${cleanCategoryName}'`,
                  );
                }
              } else {
                log(
                  `Categoria ignorada (não começa com número): '${cleanCategoryName}'`,
                );
              }
              break;
            }
          }
        }

        log(
          `Total de categorias criadas/encontradas: ${createdCategories[sheetName].length}`,
        );
        log(
          `Categorias na aba ${sheetName}: ${createdCategories[sheetName].map((c) => c.name).join(", ")}`,
        );

        let endRowIndex = rows2D.length;
        for (let r = rows2D.length - 1; r >= headerRowIndex + 1; r--) {
          const row = rows2D[r];
          const nameCellRaw = row[nameColIndex];
          const nameCell =
            typeof nameCellRaw === "string"
              ? nameCellRaw.replace(/\u00A0/g, " ").trim()
              : "";
          if (
            nameCell.toLowerCase() === "total (r$)" ||
            nameCell.toLowerCase().includes("total")
          ) {
            endRowIndex = r;
            break;
          }
        }

        for (let r = headerRowIndex + 1; r < endRowIndex; r++) {
          const row = rows2D[r];
          const nameCellRaw = row[nameColIndex];
          const nameCell =
            typeof nameCellRaw === "string"
              ? nameCellRaw.replace(/\u00A0/g, " ").trim()
              : "";
          if (!nameCell) continue;

          if (nameCell.startsWith("-")) continue;

          if (
            nameCell.toLowerCase() === "total (r$)" ||
            nameCell.toLowerCase().includes("total")
          )
            continue;

          let closestCategoryId: number | null = null;
          let closestDistance = Infinity;

          for (const marker of categoryMarkers) {
            if (marker.rowIndex <= r) {
              const distance = r - marker.rowIndex;
              if (distance < closestDistance) {
                closestDistance = distance;
                closestCategoryId = marker.id;
              }
            }
          }

          if (!closestCategoryId) {
            closestDistance = Infinity;
            for (const marker of categoryMarkers) {
              if (marker.rowIndex > r) {
                const distance = marker.rowIndex - r;
                if (distance < closestDistance) {
                  closestDistance = distance;
                  closestCategoryId = marker.id;
                }
              }
            }
          }

          if (closestCategoryId) {
            const subCategory = await this.findOrCreateSubcategory(
              nameCell,
              closestCategoryId,
              SubCategoryType.REDE,
              SubCategoryReleaseType.IPCA,
            );
            log(
              `  Nova subcategoria criada: '${nameCell}' (id=${subCategory.id})`,
            );

            createdSubcategories[sheetName].push(subCategory);
            log(
              `  Subcategoria: '${subCategory.name}' (id=${subCategory.id}) associada à categoria ID ${closestCategoryId}`,
            );

            if (monthColIndexes.some((idx) => typeof idx === "number")) {
              for (let m = 0; m < monthNames.length; m++) {
                const colIdx = monthColIndexes[m];
                if (typeof colIdx !== "number") continue;
                const cell = row[colIdx];
                const value = parseCurrencyToCents(cell);
                try {
                  const currentBudget = this.getBudgetForSheet(
                    sheetName,
                    budget,
                  );
                  await this.createOrUpdateBudgetResult(
                    currentBudget.id,
                    closestCategoryId,
                    subCategory.id,
                    m + 1,
                    value,
                    subCategory.releaseType,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                  );
                  log(
                    `    mes=${m + 1} col=${colIdx} raw='${cell}' -> salvo=${value}`,
                  );
                } catch (e: any) {
                  log(
                    `    ERRO mes=${m + 1} col=${colIdx} raw='${cell}': ${e?.message || e}`,
                  );
                }
              }
            } else {
              log(
                `    Subcategoria '${nameCell}' criada sem valores mensais (aba sem headers de meses válidos)`,
              );
            }
          } else {
            log(
              `    AVISO: Subcategoria '${nameCell}' ignorada - não foi possível associar a uma categoria`,
            );
          }
        }
        log(`Aba ${sheetName} processada com sucesso`);
        log(`  - Categorias criadas: ${createdCategories[sheetName].length}`);
        log(
          `  - Subcategorias criadas: ${createdSubcategories[sheetName].length}`,
        );
      }

      log("Todas as abas processadas com sucesso");

      log("Calculando valor total do Budget principal (PARC)...");
      const totalResult = await this.budgetResultRepository
        .getRepository(BudgetResult)
        .createQueryBuilder("br")
        .select("COALESCE(SUM(br.valueInCents), 0)", "total")
        .where("br.budgetId = :budgetId", { budgetId: budget.id })
        .getRawOne();
      const total = parseInt(totalResult?.total || "0");
      await this.budgetRepository._update(budget.id, { valueInCents: total });
      log(
        `Budget principal ID ${budget.id} valor total atualizado: ${total} centavos`,
      );

      log("Calculando valor total do Budget principal...");

      log("Calculando valor total do Budget Plan principal...");
      const budgetPlanTotalResult = await this.budgetRepository
        .getRepository(Budget)
        .createQueryBuilder("b")
        .select("COALESCE(SUM(b.valueInCents), 0)", "total")
        .where("b.budgetPlanId = :budgetPlanId", {
          budgetPlanId: budgetPlan.id,
        })
        .getRawOne();
      const budgetPlanTotal = parseInt(budgetPlanTotalResult?.total || "0");

      const MAX_INT_VALUE = 2147483647;
      let finalTotalInCents = budgetPlanTotal;
      let alertMessage = "";

      if (budgetPlanTotal > MAX_INT_VALUE) {
        finalTotalInCents = MAX_INT_VALUE;
        alertMessage = `⚠️ ALERTA: Valor total calculado (${budgetPlanTotal.toLocaleString("pt-BR")}) excede o limite máximo permitido (${MAX_INT_VALUE.toLocaleString("pt-BR")}). Valor foi limitado ao máximo permitido.`;
        log(alertMessage);
      }

      try {
        await this.budgetPlanRepository.update(budgetPlan.id, {
          totalInCents: finalTotalInCents,
        });
        log(
          `Budget Plan principal ID ${budgetPlan.id} valor total atualizado: ${finalTotalInCents.toLocaleString("pt-BR")} centavos`,
        );

        if (alertMessage) {
          log(`🚨 ${alertMessage}`);
        }
      } catch (updateError: any) {
        log(
          `ERRO ao atualizar totalInCents: ${updateError?.message || updateError}`,
        );
        try {
          await this.budgetPlanRepository.update(budgetPlan.id, {
            totalInCents: MAX_INT_VALUE,
          });
          log(
            `Budget Plan atualizado com valor máximo permitido: ${MAX_INT_VALUE.toLocaleString("pt-BR")} centavos`,
          );
        } catch (finalError: any) {
          log(
            `ERRO CRÍTICO ao definir valor máximo: ${finalError?.message || finalError}`,
          );
        }
      }

      try {
        fs.writeFileSync(logPath, logs.join("\n"), "utf8");
      } catch {}

      return {
        user,
        program,
        budgetPlan,
        partnerState,
        partnerMunicipality,
        budget,
        costCenters,
        categories: createdCategories,
        subcategories: createdSubcategories,
        totals: totalsData,
        logFile: logPath,
        excelDebugFile: excelDebugPath,
        alert: alertMessage || null,
      };
    } catch (error: any) {
      log(`ERRO CRÍTICO: ${error?.message || error}`);
      log(`Stack: ${error?.stack || "N/A"}`);
      try {
        fs.writeFileSync(logPath, logs.join("\n"), "utf8");
      } catch {}
      throw error;
    }
  }

  protected async processEPV(file: Express.Multer.File) {
    const startedAt = new Date();
    const timestamp = startedAt.toISOString().replace(/[:.]/g, "-");
    const logDir = path.resolve(process.cwd(), "logs");
    try {
      fs.mkdirSync(logDir, { recursive: true });
    } catch {}
    const logPath = path.join(logDir, `import-epv-${timestamp}.txt`);
    const logs: string[] = [];
    const log = (line: string) => logs.push(line);
    log("=== Import EPV - início ===");
    log(`Data/Hora: ${startedAt.toISOString()}`);
    try {
      const userEmail = process.env.DEFAULT_IMPORT_EMAIL || "admin@example.com";
      const userCpf = process.env.DEFAULT_IMPORT_CPF || "00000000000";
      let user = (await this.userRepository._findUserByEmail(userEmail)).user;
      if (!user) {
        user = (await this.userRepository._findUserByCpf(userCpf)).user;
      }
      if (!user) {
        user = await this.userRepository._create({
          cpf: userCpf,
          email: userEmail,
          name: process.env.DEFAULT_IMPORT_NAME || "Admin",
          password: process.env.DEFAULT_IMPORT_PASSWORD || "changeme",
          telephone: process.env.DEFAULT_IMPORT_PHONE || "0000000000",
          massApprovalPermission: false,
        });
        log("User criado com sucesso");
      } else {
        log(`User reutilizado: ${user.email} (id=${user.id})`);
      }

      const program = await this.programRepository._create({
        name: "EPV",
        abbreviation: "EPV",
        director: "Vinícius Basílio",
        description: "Descrição do programa EPV",
      });

      const budgetPlan = await this.budgetPlanRepository._create(
        {
          programId: program.id,
          version: 1.0,
          year: 2025,
          yearForImport: 2025,
        },
        user.id,
      );

      const stateAbbr = "CE";
      let partnerState = (
        await this.partnerStateRepository._findOneByAbbreviation(stateAbbr)
      ).partnerState;
      if (!partnerState) {
        partnerState = await this.partnerStateRepository._create({
          name: "Ceará",
          abbreviation: stateAbbr,
        });
        log(`PartnerState criado: ${partnerState.abbreviation}`);
      } else {
        log(
          `PartnerState reutilizado: ${partnerState.abbreviation} (id=${partnerState.id})`,
        );
      }

      const municipalityCod = "2304400";
      let partnerMunicipality = (
        await this.partnerMunicipalityRepository._findOneByCod(municipalityCod)
      ).partnerMunicipality;
      if (!partnerMunicipality) {
        partnerMunicipality = await this.partnerMunicipalityRepository._create({
          name: "Fortaleza",
          uf: "CE",
          cod: municipalityCod,
        });
        log(
          `PartnerMunicipality criado: ${partnerMunicipality.name} (${partnerMunicipality.cod})`,
        );
      } else {
        log(
          `PartnerMunicipality reutilizado: ${partnerMunicipality.name} (${partnerMunicipality.cod}) id=${partnerMunicipality.id}`,
        );
      }

      const budget = await this.budgetRepository._create({
        budgetPlanId: budgetPlan.id,
        partnerStateId: partnerState.id,
        partnerMunicipalityId: partnerMunicipality.id,
      });
      log(`BudgetPlan ID: ${budgetPlan.id} | Budget ID: ${budget.id}`);

      const workbook = XLSX.read(file.buffer);
      log(`Workbook lido com ${workbook.SheetNames.length} abas`);
      const createdCategories: Record<string, any[]> = {};
      const createdSubcategories: Record<string, any[]> = {};
      const totalsData: Record<string, TotalRow2D[]> = {};

      const costCenters: Record<string, any> = {};
      for (const tabName of this.tabsEPV) {
        let costCenterName = tabName;
        if (tabName === "CLT" || tabName === "PJ") {
          costCenterName = "Pessoal";
        }

        if (!costCenters[costCenterName]) {
          const costCenter = await this.costCenterRepository._create({
            budgetPlanId: budgetPlan.id,
            name: costCenterName,
            type: CostCenterType.RECEBER,
          });
          costCenters[costCenterName] = costCenter;
          log(`CostCenter (EPV) '${costCenterName}' criado com ID ${costCenter.id}`);
        }

        if (tabName === "CLT" || tabName === "PJ") {
          costCenters[tabName] = costCenters.Pessoal;
        }

        createdSubcategories[tabName] = [];
      }
      log("CostCenters (EPV) criados com sucesso");

      for (const sheetName of workbook.SheetNames) {
        if (!this.tabsEPV.includes(sheetName)) continue;

        const worksheet = workbook.Sheets[sheetName];
        log(`\n--- Processando aba (EPV): ${sheetName} ---`);

        totalsData[sheetName] = this.extractTotalRows2DFromSheet(worksheet);

        const rows2D = XLSX.utils.sheet_to_json<(string | number | null)[]>(
          worksheet,
          {
            header: 1,
            raw: true,
          },
        );
        log(`rows2D.length: ${rows2D.length}`);

        const monthNames = [
          "Jan",
          "Fev",
          "Mar",
          "Abr",
          "Mai",
          "Jun",
          "Jul",
          "Ago",
          "Set",
          "Out",
          "Nov",
          "Dez",
        ];
        let headerRowIndex = -1;
        let categoryColIndex = -1;
        let salarioColIndex = -1;
        const monthColIndexes: number[] = [];

        let maxMonthCount = -1;
        for (let r = 0; r < rows2D.length; r++) {
          const row = rows2D[r];
          let count = 0;
          for (let c = 0; c < row.length; c++) {
            const cell = row[c];
            if (typeof cell === "string") {
              const normalized = cell
                .replace(/\u00A0/g, " ")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim()
                .toLowerCase();
              const idx = monthNames.findIndex(
                (m) => m.toLowerCase() === normalized,
              );
              if (idx !== -1) count++;
            }
          }
          if (count > maxMonthCount) {
            maxMonthCount = count;
            headerRowIndex = r;
          }
        }
        log(
          `headerRowIndex: ${headerRowIndex} (maxMonthCount: ${maxMonthCount})`,
        );

        if (headerRowIndex !== -1) {
          const headerRow = rows2D[headerRowIndex];
          for (let c = 0; c < headerRow.length; c++) {
            const cell = headerRow[c];
            if (typeof cell === "string") {
              const normalized = cell
                .replace(/\u00A0/g, " ")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim()
                .toLowerCase();
              const idx = monthNames.findIndex(
                (m) => m.toLowerCase() === normalized,
              );
              if (idx !== -1) monthColIndexes[idx] = c;
              if (normalized === "funcao") categoryColIndex = c;
              if (normalized.startsWith("salario")) salarioColIndex = c;
            }
          }
        }
        log(
          `categoryColIndex: ${categoryColIndex} | salarioColIndex: ${salarioColIndex}`,
        );
        log(`monthColIndexes (Jan..Dez): [${monthColIndexes.join(", ")}]`);

        if (categoryColIndex === -1 && headerRowIndex !== -1) {
          const headerRow = rows2D[headerRowIndex];
          const firstMonthCol = monthColIndexes
            .filter((v) => typeof v === "number")
            .sort((a, b) => a - b)[0];
          if (typeof firstMonthCol === "number") {
            for (let c = firstMonthCol - 1; c >= 0; c--) {
              const cell = headerRow[c];
              if (typeof cell === "string" && cell.trim() !== "") {
                categoryColIndex = c;
                break;
              }
            }
          }
          if (categoryColIndex === -1) categoryColIndex = 0;
        }

        if (categoryColIndex === -1) {
          for (let c = 0; c < (rows2D[0]?.length || 0); c++) {
            let hasText = false;
            for (
              let r = Math.max(0, headerRowIndex - 2);
              r < Math.min(rows2D.length, headerRowIndex + 5);
              r++
            ) {
              const cell = rows2D[r]?.[c];
              if (typeof cell === "string" && cell.trim() !== "") {
                hasText = true;
                break;
              }
            }
            if (hasText) {
              categoryColIndex = c;
              log(`Coluna de categoria encontrada por fallback: ${c}`);
              break;
            }
          }
        }

        if (categoryColIndex === -1) {
          for (let c = 0; c < (rows2D[0]?.length || 0); c++) {
            let hasCategoryPattern = false;
            for (
              let r = 0;
              r <
              Math.min(
                rows2D.length,
                headerRowIndex === -1 ? rows2D.length : headerRowIndex + 50,
              );
              r++
            ) {
              const cell = rows2D[r]?.[c];
              if (typeof cell === "string" && cell.trim().startsWith("-")) {
                hasCategoryPattern = true;
                break;
              }
            }
            if (hasCategoryPattern) {
              categoryColIndex = c;
              log(
                `Coluna de categoria encontrada por padrão de categoria: ${c}`,
              );
              break;
            }
          }
        }

        if (categoryColIndex === -1) {
          categoryColIndex = 0;
          log(`Usando primeira coluna como coluna de categoria`);
        }
        if (headerRowIndex === -1) {
          headerRowIndex = 0;
          log(`Usando primeira linha como linha de cabeçalho`);
        }

        let nameColIndex = -1;
        if (headerRowIndex !== -1) {
          const headerRow = rows2D[headerRowIndex];
          const pickBy = (pred: (t: string) => boolean) => {
            for (let c = 0; c < headerRow.length; c++) {
              const cell = headerRow[c];
              if (typeof cell !== "string") continue;
              const normalized = cell
                .replace(/\u00A0/g, " ")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim()
                .toLowerCase();
              if (pred(normalized)) return c;
            }
            return -1;
          };
          nameColIndex = pickBy((t) => t === "funcao" || t.includes("funcao"));
          if (nameColIndex === -1)
            nameColIndex = pickBy((t) => t.includes("produto"));
          if (nameColIndex === -1)
            nameColIndex = pickBy((t) => t.includes("categoria"));
          if (nameColIndex === -1)
            nameColIndex = pickBy(
              (t) => t.includes("centro de custo") || t === "centro de custo",
            );
          if (nameColIndex === -1)
            nameColIndex = pickBy((t) => t === "tema" || t.includes("tema"));
          if (nameColIndex === -1)
            nameColIndex = pickBy(
              (t) => t === "estados" || t === "estado" || t.includes("estado"),
            );
          if (
            nameColIndex === -1 &&
            monthColIndexes.some((x) => typeof x === "number")
          ) {
            const firstMonthCol = monthColIndexes
              .filter((x) => typeof x === "number")
              .sort((a, b) => a - b)[0];
            if (typeof firstMonthCol === "number") {
              nameColIndex = Math.max(0, firstMonthCol - 1);
            }
          }
        }
        if (nameColIndex === -1) {
          for (
            let c = 0;
            c < (rows2D[0]?.length || 0) && nameColIndex === -1;
            c++
          ) {
            for (
              let r = headerRowIndex + 1;
              r < Math.min(rows2D.length, headerRowIndex + 10);
              r++
            ) {
              const cell = rows2D[r]?.[c];
              if (typeof cell === "string" && cell.trim()) {
                nameColIndex = c;
                break;
              }
            }
          }
        }
        if (nameColIndex === -1) nameColIndex = categoryColIndex;
        log(`categoryColIndex após fallback: ${categoryColIndex}`);
        log(`nameColIndex (coluna de nome): ${nameColIndex}`);

        createdCategories[sheetName] = [];
        createdSubcategories[sheetName] = [];
        const costCenter = costCenters[sheetName];
        log(`Iniciando processamento das linhas da aba (EPV) ${sheetName}...`);

        const categoryMarkers: {
          rowIndex: number;
          id: number;
          name: string;
        }[] = [];
        for (let r = 0; r < rows2D.length; r++) {
          const row = rows2D[r];
          for (let c = 0; c < row.length; c++) {
            const cellRaw = row[c];
            const cell =
              typeof cellRaw === "string"
                ? cellRaw.replace(/\u00A0/g, " ").trim()
                : "";
            if (!cell) continue;
            if (cell.startsWith("-")) {
              const cleanCategoryName = cell.replace(/^-\s*/, "").trim();
              const exists = createdCategories[sheetName].find(
                (cat) =>
                  cat.name.toLowerCase().trim() ===
                  cleanCategoryName.toLowerCase().trim(),
              );
              if (!exists) {
                const categoryDto: CreateCostCenterCategoryDto = {
                  name: cleanCategoryName,
                  costCenterId: costCenter.id,
                  subCategories: [],
                };
                const category =
                  await this.costCenterCategory._create(categoryDto);
                createdCategories[sheetName].push(category);
                categoryMarkers.push({
                  rowIndex: r,
                  id: category.id,
                  name: cleanCategoryName,
                });
                log(
                  `Categoria (EPV) criada: '${cleanCategoryName}' (id=${category.id}) na linha ${r}, coluna ${c}`,
                );
              } else {
                categoryMarkers.push({
                  rowIndex: r,
                  id: exists.id,
                  name: exists.name,
                });
                log(
                  `Categoria (EPV) já existente referenciada: '${exists.name}' (id=${exists.id}) na linha ${r}, coluna ${c}`,
                );
              }
              break;
            }
          }
        }
        log(
          `Total de categorias (EPV) criadas/encontradas: ${createdCategories[sheetName].length}`,
        );
        log(
          `Categorias (EPV) na aba ${sheetName}: ${createdCategories[sheetName].map((c) => c.name).join(", ")}`,
        );

        let endRowIndex = rows2D.length;
        for (let r = rows2D.length - 1; r >= headerRowIndex + 1; r--) {
          const row = rows2D[r];
          const nameCellRaw = row[nameColIndex];
          const nameCell =
            typeof nameCellRaw === "string"
              ? nameCellRaw.replace(/\u00A0/g, " ").trim()
              : "";
          if (
            nameCell.toLowerCase() === "total (r$)" ||
            nameCell.toLowerCase().includes("total")
          ) {
            endRowIndex = r;
            break;
          }
        }

        const headerRow = headerRowIndex !== -1 ? rows2D[headerRowIndex] : [];

        for (let r = headerRowIndex + 1; r < endRowIndex; r++) {
          const row = rows2D[r];
          const nameCellRaw = row[nameColIndex];
          const nameCell =
            typeof nameCellRaw === "string"
              ? nameCellRaw.replace(/\u00A0/g, " ").trim()
              : "";
          if (!nameCell) continue;
          if (nameCell.startsWith("-")) continue;
          if (
            nameCell.toLowerCase() === "total (r$)" ||
            nameCell.toLowerCase().includes("total")
          )
            continue;

          let closestCategoryId: number | null = null;
          let closestCategoryName: string | null = null;
          let closestDistance = Infinity;
          for (const marker of categoryMarkers) {
            if (marker.rowIndex <= r) {
              const distance = r - marker.rowIndex;
              if (distance < closestDistance) {
                closestDistance = distance;
                closestCategoryId = marker.id;
                closestCategoryName = marker.name;
              }
            }
          }
          if (!closestCategoryId) {
            closestDistance = Infinity;
            for (const marker of categoryMarkers) {
              if (marker.rowIndex > r) {
                const distance = marker.rowIndex - r;
                if (distance < closestDistance) {
                  closestDistance = distance;
                  closestCategoryId = marker.id;
                  closestCategoryName = marker.name;
                }
              }
            }
          }

          if (closestCategoryId) {
            const categoryNameLower = (closestCategoryName || "").toLowerCase();
            const sheetNameLower = sheetName.toLowerCase();
            const isPessoal =
              categoryNameLower.includes("pessoal") ||
              categoryNameLower.includes("salarios") ||
              categoryNameLower.includes("salários") ||
              categoryNameLower.includes("encargos") ||
              categoryNameLower.includes("beneficios") ||
              categoryNameLower.includes("benefícios") ||
              sheetNameLower === "pessoal";

            const isLogistica = sheetName === "Logística";
            const isCltOrPj = sheetName === "CLT" || sheetName === "PJ";

            let releaseType = isPessoal || isCltOrPj
              ? SubCategoryReleaseType.DESPESAS_PESSOAIS
              : SubCategoryReleaseType.IPCA;
            if (isLogistica) {
              releaseType = SubCategoryReleaseType.DESPESAS_LOGISTICAS;
            }

            log(
              `  DEBUG (EPV): aba='${sheetName}', isPessoal=${isPessoal}, isCltOrPj=${isCltOrPj}, isLogistica=${isLogistica}, releaseType=${releaseType}`,
            );

            const subCategory = await this.findOrCreateSubcategory(
              nameCell,
              closestCategoryId,
              SubCategoryType.REDE,
              releaseType,
            );
            createdSubcategories[sheetName].push(subCategory);
            log(
              `  Subcategoria (EPV): '${nameCell}' (id=${subCategory.id}) associada à categoria ID ${closestCategoryId}${isPessoal || isCltOrPj ? " [DESPESAS_PESSOAIS]" : isLogistica ? " [DESPESAS_LOGISTICAS]" : ""}`,
            );

            if (monthColIndexes.some((idx) => typeof idx === "number")) {
              for (let m = 0; m < monthNames.length; m++) {
                const colIdx = monthColIndexes[m];
                if (typeof colIdx !== "number") continue;
                const cell = row[colIdx];
                const value = parseCurrencyToCents(cell);

                try {
                  if (isLogistica) {
                    await this.createOrUpdateBudgetResultLogistics(
                      budget.id,
                      closestCategoryId,
                      subCategory.id,
                      m + 1,
                      value,
                      row,
                      nameCell,
                    );
                  } else {
                    await this.createOrUpdateBudgetResult(
                      budget.id,
                      closestCategoryId,
                      subCategory.id,
                      m + 1,
                      value,
                      subCategory.releaseType,
                      sheetName,
                      row,
                      headerRow,
                      nameCell,
                    );
                  }
                  log(
                    `    mes=${m + 1} col=${colIdx} raw='${cell}' -> salvo=${value}`,
                  );
                } catch (e: any) {
                  log(
                    `    ERRO mes=${m + 1} col=${colIdx} raw='${cell}': ${e?.message || e}`,
                  );
                }
              }
            } else {
              log(
                `    Subcategoria (EPV) '${nameCell}' criada sem valores mensais (aba sem headers de meses válidos)`,
              );
            }
          } else {
            log(
              `    AVISO (EPV): Subcategoria '${nameCell}' ignorada - não foi possível associar a uma categoria`,
            );
          }
        }

        log(`Aba (EPV) ${sheetName} processada com sucesso`);
        log(
          `  - Categorias (EPV) criadas: ${createdCategories[sheetName].length}`,
        );
        log(
          `  - Subcategorias (EPV) criadas: ${createdSubcategories[sheetName].length}`,
        );
      }

      log("Todas as abas (EPV) processadas com sucesso");

      log("Calculando valor total do Budget (EPV)...");
      const totalValueInCents = await this.budgetResultRepository.query(
        `
        SELECT COALESCE(SUM(valueInCents), 0) as total 
        FROM budget_results 
        WHERE budgetId = ?
      `,
        [budget.id],
      );
      const total = parseInt(totalValueInCents[0]?.total || "0");
      await this.budgetRepository.update(budget.id, { valueInCents: total });
      log(`Budget ID ${budget.id} valor total atualizado: ${total} centavos`);

      log("Calculando valor total do BudgetPlan (EPV)...");
      const budgetPlanTotalResult = await this.budgetRepository
        .getRepository(Budget)
        .createQueryBuilder("b")
        .select("COALESCE(SUM(b.valueInCents), 0)", "total")
        .where("b.budgetPlanId = :budgetPlanId", {
          budgetPlanId: budgetPlan.id,
        })
        .getRawOne();
      const budgetPlanTotal = parseInt(budgetPlanTotalResult?.total || "0");

      const MAX_INT_VALUE = 2147483647;
      let finalTotalInCents = budgetPlanTotal;
      let alertMessage = "";

      if (budgetPlanTotal > MAX_INT_VALUE) {
        finalTotalInCents = MAX_INT_VALUE;
        alertMessage = `⚠️ ALERTA: Valor total calculado (${budgetPlanTotal.toLocaleString("pt-BR")}) excede o limite máximo permitido (${MAX_INT_VALUE.toLocaleString("pt-BR")}). Valor foi limitado ao máximo permitido.`;
        log(alertMessage);
      }

      try {
        await this.budgetPlanRepository.update(budgetPlan.id, {
          totalInCents: finalTotalInCents,
        });
        log(
          `BudgetPlan ID ${budgetPlan.id} valor total atualizado: ${finalTotalInCents.toLocaleString("pt-BR")} centavos`,
        );

        if (alertMessage) {
          log(`🚨 ${alertMessage}`);
        }
      } catch (updateError: any) {
        log(
          `ERRO ao atualizar totalInCents: ${updateError?.message || updateError}`,
        );
        try {
          await this.budgetPlanRepository.update(budgetPlan.id, {
            totalInCents: MAX_INT_VALUE,
          });
          log(
            `BudgetPlan atualizado com valor máximo permitido: ${MAX_INT_VALUE.toLocaleString("pt-BR")} centavos`,
          );
        } catch (finalError: any) {
          log(
            `ERRO CRÍTICO ao definir valor máximo: ${finalError?.message || finalError}`,
          );
        }
      }

      try {
        fs.writeFileSync(logPath, logs.join("\n"), "utf8");
      } catch {}

      return {
        program,
        budgetPlan,
        partnerState,
        partnerMunicipality,
        budget,
        logFile: logPath,
        alert: alertMessage || null,
      };
    } catch (error: any) {
      log(`ERRO CRÍTICO (EPV): ${error?.message || error}`);
      try {
        fs.writeFileSync(logPath, logs.join("\n"), "utf8");
      } catch {}
      throw error;
    }
  }

  public async testRoute(): Promise<any> {
    try {
      const budgetWithResults = await this.budgetResultRepository
        .getRepository(BudgetResult)
        .createQueryBuilder("br")
        .leftJoinAndSelect("br.costCenterSubCategory", "ccs")
        .select([
          "br.budgetId",
          "br.costCenterSubCategoryId",
          "ccs.name",
          "COUNT(br.id) as resultCount",
        ])
        .groupBy("br.budgetId, br.costCenterSubCategoryId, ccs.name")
        .orderBy("resultCount", "DESC")
        .limit(1)
        .getRawOne();

      if (!budgetWithResults) {
        return {
          success: false,
          message: "Nenhum budget_result encontrado no banco",
          data: null,
        };
      }

      const {
        br_budgetId: budgetId,
        br_costCenterSubCategoryId: costCenterSubCategoryId,
        ccs_name: subCategoryName,
        resultCount,
      } = budgetWithResults;

      const routeResults = await this.budgetResultRepository
        .getRepository(BudgetResult)
        .createQueryBuilder("br")
        .leftJoinAndSelect("br.costCenterSubCategory", "ccs")
        .leftJoinAndSelect("br.costCenterCategory", "ccc")
        .leftJoinAndSelect("br.budget", "b")
        .where("br.budgetId = :budgetId", { budgetId })
        .andWhere("br.costCenterSubCategoryId = :subCategoryId", {
          subCategoryId: costCenterSubCategoryId,
        })
        .orderBy("br.month", "ASC")
        .getMany();

      return {
        success: routeResults.length > 0,
        message: `Rota testada com Budget ID ${budgetId} e SubCategory "${subCategoryName}"`,
        expectedCount: resultCount,
        actualCount: routeResults.length,
        data: routeResults,
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Erro ao testar rota",
        error: error?.message || error,
      };
    }
  }
}
