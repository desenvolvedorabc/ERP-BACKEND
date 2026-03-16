export const defaultSelectById = {
  id: true,
  name: true,
  initialBalance: true,
  bank: true,
  agency: true,
  accountNumber: true,
  dv: true,
  lastReconciliation: true,
  createdAt: true,
  updatedAt: true,
};

export const defaultSelectAll = [
  "Accounts.id AS id",
  "Accounts.bank AS bank",
  "Accounts.name AS name",
  "Accounts.lastReconciliation AS lastReconciliation",
  "Accounts.systemBalance AS systemBalance",
  "Accounts.createdAt AS createdAt",
  "Accounts.updatedAt AS updatedAt",
];
