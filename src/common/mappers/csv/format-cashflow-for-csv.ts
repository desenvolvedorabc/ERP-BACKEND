import { CashFlowRawData } from "src/modules/reports/types/cashflow";

export function ifEmpty(value?: string) {
  return !value || value.length === 0 ? "Não categorizado" : value;
}

export function FormatCashflowForCSV(accounts: CashFlowRawData) {
  const entradas = [
    ...accounts.receivableData.map((item) => ({
      tipo: "entrada",
      categoria: ifEmpty(item.Category_name),
      subCategoria: ifEmpty(item.SubCategory_name),
      realizado: item.REALIZED ?? 0,
      esperado: item.EXPECTED ?? 0,
    })),
    ...accounts.bankRecon
      .filter((item) => item.type === "entrada")
      .map((item) => ({
        tipo: "entrada",
        categoria: ifEmpty(item.Category_name),
        subCategoria: ifEmpty(item.SubCategory_name),
        realizado: item.REALIZED ?? 0,
        esperado: item.EXPECTED ?? 0,
      })),
  ];

  const payableData = [...accounts.payableData, ...accounts.cardMov];

  const saidas = [
    ...payableData.map((item) => ({
      tipo: "saida",
      categoria: ifEmpty(item.Category_name),
      subCategoria: ifEmpty(item.SubCategory_name),
      realizado: item.REALIZED ?? 0,
      esperado: item.EXPECTED ?? 0,
    })),
    ...accounts.bankRecon
      .filter((item) => item.type === "saida")
      .map((item) => ({
        tipo: "saida",
        categoria: ifEmpty(item.Category_name),
        subCategoria: ifEmpty(item.SubCategory_name),
        realizado: item.REALIZED ?? 0,
        esperado: item.EXPECTED ?? 0,
      })),
  ];

  return [...entradas, ...saidas];
}
