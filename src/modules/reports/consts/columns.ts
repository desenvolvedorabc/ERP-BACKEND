import { DEFAULTCOLUMNS } from "../types/generalReport";

export const columnsConfig = {
  ID: {
    contract: 'CONCAT("C",Contract.id)',
    payable: 'CONCAT("P",Payable.id)',
    receivable: 'CONCAT("R",Receivable.id)',
    appointment: 'CONCAT("A",Appointment.id)',
    CardMovimentation: 'CONCAT("M",CardMovimentation.id)',
  },
  E_ID: {
    contract: `COALESCE(Payable.id,Receivable.id)`,
    pcontract: "Payable.id",
    rcontract: "Receivable.id",
    payable: "Payable.id",
    receivable: "Receivable.id",
    CardMovimentation: "Payable.id",
    appointment: "NULL",
  },
  NUMERO_CONTRATO: {
    contract: "Contract.contractCode",
    DEFAULT: "NULL",
  },
  TIPO: {
    contract: `CASE WHEN Payable.id IS NOT NULL THEN 'Pagamento' ELSE 'Recebimento' END`,
    pcontract: '"Pagamento"',
    rcontract: '"Recebimento"',
    payable: '"Pagamento"',
    receivable: '"Recebimento"',
    appointment: `CASE WHEN Reconciliation.type = 'TAX' THEN 'Taxa' ELSE 'Lucro' END`,
    CardMovimentation: '"Pagamento"',
  },
  CODE: {
    contract: "COALESCE(Payable.identifierCode, Receivable.identifierCode)",
    pcontract: "Payable.identifierCode",
    rcontract: "Receivable.identifierCode",
    payable: "Payable.identifierCode",
    receivable: "Receivable.identifierCode",
    appointment: "NULL",
    CardMovimentation: "Payable.identifierCode",
  },
  VENCIMENTO: {
    contract: "COALESCE(RInstallment.dueDate, PInstallment.dueDate)",
    pcontract: "PInstallment.dueDate",
    rcontract: "RInstallment.dueDate",
    appointment: "NULL",
    DEFAULT: "Installment.dueDate",
  },
  PARCELA: {
    contract:
      "COALESCE(RInstallment.installmentNumber, PInstallment.installmentNumber)",
    pcontract: "PInstallment.installmentNumber",
    rcontract: "RInstallment.installmentNumber",
    appointment: "NULL",
    DEFAULT: "Installment.installmentNumber",
  },
  APONTAMENTO: {
    contract:
      "COALESCE(RAppointment.fullTransactionDescription, PAppointment.fullTransactionDescription)",
    pcontract: "PAppointment.fullTransactionDescription",
    rcontract: "RAppointment.fullTransactionDescription",
    DEFAULT: "Appointment.fullTransactionDescription",
  },
  FORNECEDOR: {
    contract: "Supplier.name",
    pcontract: "Supplier.name",
    payable: "Supplier.name",
    CardMovimentation: "Supplier.name",
    DEFAULT: "NULL",
  },
  FINANCIADOR: {
    contract: "Financier.name",
    rcontract: "Financier.name",
    receivable: "Financier.name",
    DEFAULT: "NULL",
  },
  COLABORADOR: {
    contract: "Collaborator.name",
    pcontract: "Collaborator.name",
    payable: "Collaborator.name",
    DEFAULT: "NULL",
  },
  CENTRO_CUSTO: {
    contract: "COALESCE(RCostCenter.name, PCostCenter.name)",
    pcontract: "PCostCenter.name",
    rcontract: "RCostCenter.name",
    DEFAULT: "CostCenter.name",
  },
  CATEGORIA: {
    contract: "COALESCE(RCategory.name, PCategory.name)",
    pcontract: "PCategory.name",
    rcontract: "RCategory.name",
    DEFAULT: "Category.name",
  },
  SUB_CATEGORIA: {
    contract: "COALESCE(RSubCategory.name, PSubCategory.name)",
    pcontract: "PSubCategory.name",
    rcontract: "RSubCategory.name",
    DEFAULT: "SubCategory.name",
  },
  PIX: {
    contract: "CONCAT(Contract.pixInfo.key_type,': ', Contract.pixInfo.key)",
    payable: "CONCAT(Supplier.pixInfo.key_type,': ', Supplier.pixInfo.key)",
    receivable: "NULL",
    appointment: "NULL",
    CardMovimentation:
      "CONCAT(Supplier.pixInfo.key_type,': ', Supplier.pixInfo.key)",
  },
  BANCARY: {
    contract:
      'CONCAT_WS(",",Contract.bancaryInfoBank, Contract.bancaryInfoAgency, Contract.bancaryInfoAccountNumber, Contract.bancaryInfoDv)',
    payable:
      'CONCAT_WS(",",Supplier.bancaryInfoBank, Supplier.bancaryInfoAgency, Supplier.bancaryInfoAccountNumber, Supplier.bancaryInfoDv)',
    receivable: "NULL",
    appointment: "NULL",
    CardMovimentation:
      'CONCAT_WS(",",Supplier.bancaryInfoBank, Supplier.bancaryInfoAgency, Supplier.bancaryInfoAccountNumber, Supplier.bancaryInfoDv)',
  },
  DATA: {
    contract: "Contract.createdAt",
    payable: "Payable.createdAt",
    receivable: "Receivable.createdAt",
    appointment: "Appointment.createdAt",
    CardMovimentation: "CardMovimentation.createdAt",
  },
} as DEFAULTCOLUMNS;
