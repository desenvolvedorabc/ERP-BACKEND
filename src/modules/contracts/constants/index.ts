export const defaultSelectColumnsContracts = {
  id: true,
  contractCode: true,
  contractType: true,
  contractModel: true,
  contractStatus: true,
  object: true,
  totalValue: true,
  agreement: true,
  collaboratorId: true,
  supplierId: true,
  financierId: true,
  contractPeriod: {
    end: true,
    start: true,
    isIndefinite: true,
  },
  budgetPlanId: true,
  files: true,
  supplier: {
    id: true,
    name: true,
    cnpj: true,
    fantasyName: true,
    serviceCategory: true,
  },
  financier: {
    id: true,
    cnpj: true,
    name: true,
    telephone: true,
    address: true,
  },
  collaborator: {
    id: true,
    name: true,
    email: true,
    cpf: true,
    role: true,
  },
  payable: {
    id: true,
  },
  receivable: {
    id: true,
  },
  programId: true,
  bancaryInfo: {
    accountNumber: true,
    agency: true,
    dv: true,
    bank: true,
  },
  pixInfo: {
    key: true,
    key_type: true,
  },
  historys: true,
  createdAt: true,
  updatedAt: true,
};

export const defaultListContractsSelect = [
  "Contracts.id",
  "Contracts.createdAt",
  "Contracts.parentId",
  "Contracts.updatedAt",
  "Contracts.contractType",
  "Contracts.contractCode",
  "Contracts.object",
  "Contracts.contractPeriod.start",
  "Contracts.contractPeriod.end",
  "Contracts.contractPeriod.isIndefinite",
  "Contracts.totalValue",
  "Contracts.contractStatus",
  "Contracts.signedContractUrl",
  "Contracts.contractModel",
  "Contracts.settleTermUrl",
  "Contracts.withdrawalUrl",
  "BudgetPlan.id",
  "BudgetPlan.scenarioName",
  "BudgetPlan.year",
  "BudgetPlan.version",
  "Financier.id",
  "Financier.name",
  "Supplier.id",
  "Supplier.name",
  "Collaborator.id",
  "Collaborator.name",
  "Program.id",
  "Program.name",
  `(
    SELECT CASE 
      WHEN Contracts.contractType = :type 
      THEN COALESCE(SUM(ri.value), 0)
      ELSE COALESCE(SUM(pi.value), 0)
    END
    FROM contracts c
    LEFT JOIN payables p ON p.contractId = c.id 
    LEFT JOIN installments pi ON (pi.payableId = p.id AND pi.status IN (:...iStatus))
    LEFT JOIN receivables r ON r.contractId = c.id
    LEFT JOIN installments ri ON (ri.receivableId = r.id AND ri.status IN (:...iStatus))
    WHERE c.id = Contracts.id
  ) AS pending`,
];

export const defaultChildSelectedFields = [
  "Children.id",
  "Children.contractCode",
  "Children.parentId",
  "Children.createdAt",
  "Children.updatedAt",
  "Children.contractType",
  "Children.contractModel",
  "Children.contractStatus",
  "Children_BudgetPlan.id",
  "Children_BudgetPlan.scenarioName",
  "Children_BudgetPlan.year",
  "Children_BudgetPlan.version",
  "Children_Financier.id",
  "Children_Financier.name",
  "Children_Supplier.id",
  "Children_Supplier.name",
  "Children_Collaborator.id",
  "Children_Collaborator.name",
  "Children.object",
  "Children.contractPeriod.start AS Children_contractPeriodstart",
  "Children.contractPeriod.end AS Children_contractPeriodend",
  "Children.contractPeriod.isIndefinite AS Children_contractPeriodIsIndefinite",
  "Children.totalValue",
  "Children.signedContractUrl",
  "Children.settleTermUrl",
  "Children.withdrawalUrl",
  "Children_program.id",
  "Children_program.name",
  `(
    SELECT CASE 
      WHEN Children.contractType = :type 
      THEN COALESCE(SUM(ri.value), 0)
      ELSE COALESCE(SUM(pi.value), 0)
    END
    FROM contracts c
    LEFT JOIN payables p ON p.contractId = c.id 
    LEFT JOIN installments pi ON (pi.payableId = p.id AND pi.status IN (:...iStatus))
    LEFT JOIN receivables r ON r.contractId = c.id
    LEFT JOIN installments ri ON (ri.receivableId = r.id AND ri.status IN (:...iStatus))
    WHERE c.id = Children.id 
  ) AS Children_pending`,
];

export const queryFields = {
  budgetPlanId: "BudgetPlan.id",
  agreement: "Contracts.agreement",
  contractType: "Contracts.contractType",
  contractStatus: "Contracts.contractStatus",
};

export const PDFHeaders = [
  "ID",
  "CODIGO",
  "CONTRATO ORIGINAL",
  "TIPO",
  "OBJETO",
  "INICIO",
  "FIM",
  "TOTAL",
  "PENDENTE",
  "STATUS",
  "ACORDO",
  "FINANCIADOR",
  "FORNECEDOR",
  "COLABORADOR",
  "PROGRAMA",
  "PLANO ORÇAMENTARIO",
];
