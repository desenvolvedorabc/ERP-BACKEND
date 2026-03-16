import { RawData } from "src/modules/reports/types/positions";

type returnData = {
  [x: string]: string | number;
} & {
  centro_de_custo: string;
  categoria: string;
  pendente: number;
  pago: number;
  atrasado: number;
};

export function FormatAccountsPositionForCSV(
  accounts: Array<RawData>,
  type: "p" | "r" = "r",
) {
  const data = accounts.reduce((acc, curr) => {
    acc.push({
      [type === "r" ? "financiador" : "fornecedor"]:
        curr.name ?? "Não categorizado",
      centro_de_custo: curr.CostCenter_name ?? "Não categorizado",
      categoria: curr.Category_name ?? "Não categorizado",
      pendente: curr.PENDENTE ?? 0,
      pago: curr.PAGO ?? 0,
      atrasado: curr.ATRASADO ?? 0,
    });

    return acc;
  }, [] as Array<returnData>);

  return data;
}
