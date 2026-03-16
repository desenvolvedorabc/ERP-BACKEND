import { RawData } from "src/modules/reports/types/analysis";

type returnData = {
  [x: string]: string | number;
} & {
  tipo: string;
  plano: string;
  centro_de_custo: string;
  total: number;
  mes: string;
};

// ! Não é necessário fazer outra função

export function FormatAnalysisForCSV(
  accounts: Array<RawData>,
  type: "p" | "r" = "r",
) {
  const data = accounts.reduce((acc, curr) => {
    acc.push({
      tipo: type === "r" ? "Receber" : "Pagar",
      plano: curr.BudgetPlan_name ?? "Não categorizado",
      centro_de_custo: curr.CostCenter_name ?? "Não categorizado",
      total: curr.total ?? 0,
      mes: curr.monthYear ?? "Não categorizado",
    });
    return acc;
  }, [] as Array<returnData>);

  return data;
}
