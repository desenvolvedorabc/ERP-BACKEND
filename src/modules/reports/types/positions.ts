export type RawData = {
  CostCenter_id: number | null;
  CostCenter_name: string | null;
  Category_id: number | null;
  Category_name: string | null;
  name: string;
  id: number;
  PENDENTE: number;
  PAGO: number;
  ATRASADO: number;
};

type defaultFields = {
  id: number | string;
  name: string;
  totalPendente: number;
  totalPago: number;
  totalAtrasado: number;
};

type Category = defaultFields;

type CostCenter = defaultFields & {
  category: Category[];
};

export type Item = defaultFields & {
  costCenter: CostCenter[];
};

export type stringKey = {
  [key: string]: Item;
};

export type TransformedDataForPosition = Omit<defaultFields, "id" | "name"> & {
  itens: Array<Item>;
};
