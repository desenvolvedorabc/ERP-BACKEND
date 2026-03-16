import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Installments } from "src/modules/installments/entities/installments.entity";
import { InstallmentStatus } from "src/modules/installments/enum";

export type GroupedTotal = {
  id: string;
  total: number;
};

export type LastPayment = {
  name: string;
  dueDate: string;
  backAccount: string;
  value: number;
};

@Injectable()
export class StatisticsRepository {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Retrieves the total sum of installment values for each costCenter within a specified date range.
   * Obs: The first element of the array is the costCenter with the highest total value.
   *
   * @param startDate ISO date string
   * @param endDate ISO date string
   */
  async getTotalCostCenters(
    startDate: Date,
    endDate: Date,
  ): Promise<GroupedTotal[]> {
    const costCenters = await this.dataSource
      .createQueryBuilder()
      .from(Installments, "Installments")
      .select("SUM(Installments.value)", "total")
      .addSelect("CostCenter.name", "id")
      .where("Installments.status = :status", {
        status: InstallmentStatus.PAID,
      })
      .andWhere("Installments.dueDate BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .innerJoin(`Installments.payable`, "Payables")
      .innerJoin("Payables.categorization", "Categorization")
      .innerJoin(`Categorization.costCenter`, "CostCenter")
      .addGroupBy("CostCenter.id")
      .orderBy("total", "DESC")
      .getRawMany<GroupedTotal>();

    return costCenters.map((costCenter) => ({
      id: costCenter?.id || "Gastos",
      total: costCenter?.total || 0, // treat null values
    }));
  }

  /**
   * Retrieves the total sum of installment values for each financier within a specified date range.
   * Obs: The first element of the array is the financier with the highest total value.
   *
   * @param startDate ISO date string
   * @param endDate ISO date string
   */
  async getTotalFinaciers(
    startDate: Date,
    endDate: Date,
  ): Promise<GroupedTotal[]> {
    const financiers = await this.dataSource
      .createQueryBuilder()
      .from(Installments, "Installments")
      .select("SUM(Installments.value)", "total")
      .addSelect("Financier.name", "id")
      .where("Installments.status = :status", {
        status: InstallmentStatus.PAID,
      })
      .andWhere("Installments.dueDate BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .innerJoin(`Installments.receivable`, "Receivables")
      .innerJoin(`Receivables.financier`, "Financier")
      .addGroupBy("Receivables.financierId")
      .orderBy("total", "DESC")
      .getRawMany<GroupedTotal>();

    return financiers.map((financier) => ({
      id: financier?.id || "Financiador",
      total: financier?.total || 0, // treat null values
    }));
  }

  async getLastPayments(): Promise<LastPayment[]> {
    return this.dataSource
      .createQueryBuilder()
      .from(Installments, "Installments")
      .select(
        "CAST(CONCAT(Payables.identifierCode, '-Parcela ', Installments.installmentNumber, '/', Installments.totalInstallments) AS CHAR) AS name",
      )
      .addSelect("DATE_FORMAT(Installments.dueDate, '%d/%m/%Y')", "dueDate")
      .addSelect("Accounts.name", "backAccount")
      .addSelect("Installments.value", "value")
      .innerJoin(`Installments.payable`, "Payables")
      .innerJoin("Payables.account", "Accounts")
      .where("Installments.status = :status", {
        status: InstallmentStatus.PAID,
      })
      .orderBy("Installments.dueDate", "DESC")
      .limit(5)
      .getRawMany();
  }
}
