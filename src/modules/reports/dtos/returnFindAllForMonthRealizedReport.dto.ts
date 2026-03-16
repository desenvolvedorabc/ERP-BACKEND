export interface RealizedExpectedReportData {
  totalExpected: number;
  totalRealized: number;
  costCenters: CostCenterData[];
}

type CostCenterData = {
  id: number;
  name: string;
  totalExpected: number;
  totalRealized: number;
  budgetPlanId: number;
  categories: Category[];
};

interface Category {
  totalExpected: number;
  totalRealized: number;
  id: number;
  name: string;
  months: Month[];
  subCategories: SubCategory[];
}

interface SubCategory {
  totalExpected: number;
  totalRealized: number;
  id: number;
  name: string;
  months: Month[];
}

interface Month {
  month: number;
  expected: number;
  realized: number;
}
