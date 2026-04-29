/*
https://docs.nestjs.com/providers#services
*/

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ClearDatabaseReporistory } from "./repositories/clear-database-repository";
import { comparePassword } from "src/common/utils/bcrypt";
import { Accounts } from "src/modules/accounts/entities/accounts.entity";
import { Approvals } from "src/modules/payables/entities/approval.entity";
import { BankReconciliation } from "src/modules/bank-reconciliation/entities/bank-reconciliation.entity";
import { BankRecordApi } from "src/modules/bank-reconciliation/entities/bank-record-api.entity";
import { ShareBudgetPlan } from "src/modules/budget-plans/entities/share-budget-plan.entity";
import { BudgetResult } from "src/modules/budgets/entities/budget-result.entity";
import { Budget } from "src/modules/budgets/entities/budget.entity";
import { BudgetPlan } from "src/modules/budget-plans/entities/budget-plan.entity";
import { CreditCard } from "src/modules/creditCard/entities/creditCard.entity";
import { CardMovimentation } from "src/modules/creditCard/entities/cardMovimentation.entity";
import { Contracts } from "src/modules/contracts/entities/contracts.entity";
import { Files } from "src/modules/files/entities/files.entity";
import { Installments } from "src/modules/installments/entities/installments.entity";
import { Payables } from "src/modules/payables/entities/payable.entity";
import { Receivables } from "src/modules/receivables/entities/receivables.entity";
import { CostCenter } from "src/modules/cost-centers/entities/cost-center.entity";
import { CostCenterCategory } from "src/modules/cost-centers/entities/cost-center-category.entity";
import { CostCenterSubCategory } from "src/modules/cost-centers/entities/cost-center-sub-category.entity";
import { DataSource } from "typeorm";
import { History } from "src/modules/history/entities/history.entity";
import { Program } from "src/modules/programs/entities/program.entity";

@Injectable()
export class ClearDatabaseService {
  constructor(
    private databaseRepository: ClearDatabaseReporistory,
    private dataSource: DataSource,
  ) {}

  async clear(password: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const hashedPassword = process.env.DB_RESET_PASSWORD;
      if (!hashedPassword) {
        throw new NotFoundException("RP not found");
      }
      console.log(password);
      const { isMatch } = await comparePassword(
        password,
        process.env.DB_RESET_PASSWORD,
      );
      if (!isMatch) {
        throw new UnauthorizedException("Não autorizado");
      }
      await this.databaseRepository._deleteAll(queryRunner.manager, Approvals);
      await this.databaseRepository._deleteAll(queryRunner.manager, Files);
      await this.databaseRepository._deleteAll(
        queryRunner.manager,
        CardMovimentation,
      );
      await this.databaseRepository._deleteAll(queryRunner.manager, CreditCard);
      await this.databaseRepository._deleteAll(
        queryRunner.manager,
        BankReconciliation,
      );
      await this.databaseRepository._deleteAll(
        queryRunner.manager,
        BankRecordApi,
      );
      await this.databaseRepository._deleteAll(queryRunner.manager, Payables);
      await this.databaseRepository._deleteAll(
        queryRunner.manager,
        Receivables,
      );
      await this.databaseRepository._deleteAll(queryRunner.manager, Accounts);
      await this.databaseRepository._deleteAll(
        queryRunner.manager,
        Installments,
      );
      await this.databaseRepository._deleteAll(
        queryRunner.manager,
        ShareBudgetPlan,
      );
      await this.databaseRepository._deleteAll(
        queryRunner.manager,
        BudgetResult,
      );
      await this.databaseRepository._deleteAll(queryRunner.manager, Budget);
      await this.databaseRepository._deleteAll(queryRunner.manager, History);
      await this.databaseRepository._deleteAll(queryRunner.manager, Contracts);
      await this.databaseRepository._deleteAll(queryRunner.manager, BudgetPlan);
      await this.databaseRepository._deleteAll(
        queryRunner.manager,
        CostCenterSubCategory,
      );
      await this.databaseRepository._deleteAll(
        queryRunner.manager,
        CostCenterCategory,
      );
      await this.databaseRepository._deleteAll(queryRunner.manager, CostCenter);
      await this.databaseRepository._deleteAll(queryRunner.manager, Program);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
    } finally {
      await queryRunner.release();
    }
  }
}
