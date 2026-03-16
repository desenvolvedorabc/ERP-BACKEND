import { TransformedNoContractsData } from "src/modules/reports/types/noContracts";
import { LastPayment } from "../repositories/statistics-repository";

export type Expenses = {
  totalExpenses: number;
  expensesVariation: string;
  expensesVariationSignal: string;
};

export type Revenue = {
  totalRevenue: number;
  revenueVariation: string;
  revenueVariationSignal: string;
};

export type TopFinanciers = {
  nameTopFinancier: string;
  totalTopFinanciers: string;
  topFinanciersVariation: string;
  topFinanciersVariationSignal: string;
};

export type TopCostCenters = {
  nameTopCostCenter: string;
  totalTopCostCentersExpenses: number;
  topCostCentersVariation: string;
  topCostCentersVariationExpensesSignal: string;
};
export type CostCentersData = { name: string; percentage: number };
export type DashboardStatisticsDto = Expenses &
  Revenue &
  TopFinanciers &
  TopCostCenters & {
    barChartCostCenterPayment: Array<CostCentersData>;
    noContractSuppliers: Array<TransformedNoContractsData>;
    lastPayments: Array<LastPayment>;
    chartRealized: Array<{ month: string; expected: number; realized: number }>;
  };
