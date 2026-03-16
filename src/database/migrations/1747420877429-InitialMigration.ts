import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1747420877429 implements MigrationInterface {
  name = "InitialMigration1747420877429";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`partner_municipalities\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`uf\` varchar(2) NOT NULL, \`cod\` varchar(255) NOT NULL, INDEX \`IDX_c8531d7dc0e64b443efcd7f9ca\` (\`uf\`), UNIQUE INDEX \`IDX_ae0c73d6f519f530fc8ae73ebf\` (\`name\`, \`uf\`), UNIQUE INDEX \`IDX_0e07662ca56d7f378876bf3b61\` (\`cod\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`partner_states\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`abbreviation\` varchar(2) NOT NULL, UNIQUE INDEX \`IDX_76175b09a03eac58ff8f9de5e5\` (\`name\`), UNIQUE INDEX \`IDX_c7f7fcf097d8f984fb8257b7c3\` (\`abbreviation\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`programs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`abbreviation\` varchar(255) NOT NULL, \`director\` varchar(255) NOT NULL, \`description\` longtext NOT NULL, \`logo\` varchar(255) NULL, \`active\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_14263c6ac97887c3756c95234f\` (\`abbreviation\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`approvals\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`collaboratorId\` int NULL, \`userId\` int NULL, \`payableId\` int NOT NULL, \`password\` varchar(255) NOT NULL, \`approved\` tinyint NULL, \`obs\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`collaborators\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`emergencyContactName\` varchar(255) NULL, \`email\` varchar(255) NOT NULL, \`telephone\` varchar(255) NULL, \`emergencyContactTelephone\` varchar(255) NULL, \`cpf\` varchar(11) NOT NULL, \`rg\` varchar(255) NULL, \`occupationArea\` enum ('PARC', 'DDI', 'DCE', 'EPV') NOT NULL, \`genderIdentity\` enum ('PREFIRO_NAO_RESPONDER', 'HOMEM_CIS', 'HOMEM_TRANS', 'MULHER_CIS', 'MULHER_TRANS', 'TRAVESTI', 'NAO_BINARIO', 'OUTRO') NULL, \`race\` enum ('AMARELO', 'BRANCO', 'PARDO', 'INDIGENA', 'PRETO', 'PREFIRO_NAO_RESPONDER') NULL, \`role\` varchar(255) NULL, \`startOfContract\` timestamp NOT NULL, \`dateOfBirth\` timestamp NULL, \`employmentRelationship\` enum ('CLT', 'PJ') NOT NULL, \`foodCategory\` enum ('ONIVORO', 'VEGANO', 'VEGETARIANO', 'PESCETARIANO', 'PREFIRO_NAO_RESPONDER') NULL, \`education\` enum ('EDUCACAO_INFANTIL', 'ENSINO_FUNDAMENTAL', 'ENSINO_MEDIO', 'ENSINO_SUPERIOR', 'POS_GRADUACAO', 'MESTRADO', 'DOUTORADO') NULL, \`disableBy\` enum ('DESLIGAMENTO_ABC', 'FALECIMENTO', 'TEMPO_CONTRATO_FINALIZADO', 'SOLICITACAO_RESCISAO_CONTRATUAL') NULL, \`status\` enum ('PRE_CADASTRO', 'CADASTRO_COMPLETO') NOT NULL DEFAULT 'PRE_CADASTRO', \`biography\` longtext NULL, \`completeAddress\` varchar(255) NULL, \`allergies\` varchar(255) NULL, \`experienceInThePublicSector\` tinyint NULL, \`active\` tinyint NOT NULL DEFAULT 1, INDEX \`IDX_110619b124cea89960467e0e4e\` (\`race\`), UNIQUE INDEX \`IDX_b210f505222bd59004a7716585\` (\`email\`), UNIQUE INDEX \`IDX_fa7ec23129d7651aed5b6ce06e\` (\`cpf\`), UNIQUE INDEX \`IDX_e84cd213cc7474ecd87a30f871\` (\`rg\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`financiers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`corporateName\` varchar(255) NOT NULL, \`legalRepresentative\` varchar(255) NOT NULL, \`cnpj\` varchar(14) NOT NULL, \`telephone\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL, \`active\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_f69a2a831342eef4f98add79d2\` (\`cnpj\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`cardMovimentation\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`description\` varchar(200) NOT NULL, \`purchaseDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`referenceDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`hasInstallments\` tinyint NOT NULL, \`installmentId\` varchar(200) NOT NULL DEFAULT '', \`numberOfInstallments\` int NOT NULL DEFAULT '1', \`currentInstallment\` int NOT NULL DEFAULT '1', \`value\` float NOT NULL DEFAULT '0', \`cardId\` int NOT NULL, \`payableId\` int NULL, \`status\` enum ('NÃO FATURADO', 'FATURADO') NOT NULL DEFAULT 'NÃO FATURADO', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`creditCard\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(200) NOT NULL, \`lastDigits\` varchar(4) NOT NULL, \`responsible\` varchar(200) NOT NULL, \`instituition\` varchar(200) NOT NULL, \`accountId\` int NULL, \`dueDay\` int NOT NULL DEFAULT '1', \`active\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`accounts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(200) NOT NULL, \`apiAccountId\` int NULL, \`initialBalance\` double NOT NULL DEFAULT '0', \`balance\` double NOT NULL DEFAULT '0', \`systemBalance\` double NOT NULL DEFAULT '0', \`integracao\` varchar(150) NULL, \`bank\` varchar(150) NOT NULL, \`agency\` varchar(25) NOT NULL, \`accountNumber\` varchar(25) NOT NULL, \`dv\` varchar(3) NOT NULL, \`lastReconciliation\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`bank-record-api\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`documentNumber\` varchar(255) NOT NULL, \`transactionAmount\` float NOT NULL, \`transactionDate\` timestamp NOT NULL, \`fullTransactionDescription\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`bank-reconciliation\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`accountId\` int NOT NULL, \`type\` enum ('TRANSACTION_ENTRY', 'TRANSFER', 'PROFIT', 'TAX') NOT NULL, \`recordSystemId\` int NULL, \`transferedById\` int NULL, \`recordApiId\` int NULL, UNIQUE INDEX \`REL_d9247da1789c3e717038695fa0\` (\`recordSystemId\`), UNIQUE INDEX \`REL_14db56d0d0aa7f0a47c9d95cfc\` (\`transferedById\`), UNIQUE INDEX \`REL_fc06978d5152e3526d72c2a39e\` (\`recordApiId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`installments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`payableId\` int NULL, \`receivableId\` int NULL, \`relatedLiquidInstallmentId\` int NULL, \`installmentNumber\` int NOT NULL, \`totalInstallments\` int NOT NULL, \`type\` varchar(255) NOT NULL DEFAULT 'LIQUIDO', \`dueDate\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`value\` float NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'PENDENTE', \`bankReconciliationId\` int NULL, UNIQUE INDEX \`REL_13e3886745664afcb949ba90e2\` (\`relatedLiquidInstallmentId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`receivables\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`identifierCode\` varchar(255) NULL, \`financierId\` int NOT NULL, \`receivableStatus\` varchar(255) NOT NULL DEFAULT 'APROVADO', \`receivableType\` varchar(255) NOT NULL, \`totalValue\` float NOT NULL, \`receiptMethod\` varchar(255) NULL, \`docType\` varchar(255) NULL, \`accountId\` int NULL, \`contractId\` int NULL, \`lastAditiveId\` int NULL, \`description\` varchar(255) NULL, \`recurrent\` tinyint NOT NULL DEFAULT 0, \`dueDate\` timestamp NULL, \`recurenceDataRecurrencetype\` varchar(50) NULL, \`recurenceDataStartdate\` timestamp NULL, \`recurenceDataEnddate\` timestamp NULL, \`recurenceDataDueday\` int NULL, UNIQUE INDEX \`IDX_772f629c956189807517e76ebb\` (\`identifierCode\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`files\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`payableId\` int NULL, \`receivableId\` int NULL, \`contractId\` int NULL, \`fileUrl\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`suppliers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`cnpj\` varchar(14) NOT NULL, \`corporateName\` varchar(255) NOT NULL, \`fantasyName\` varchar(255) NOT NULL, \`serviceCategory\` enum ('AGUA', 'ALIMENTACAO', 'AR_CONDICIONADO', 'ASSESSORIA', 'AUDITORIA_EXTERNA', 'BUFFET', 'COMPRAS_E_SUPRIMENTOS', 'CONSULTORIA', 'CONTABEIS', 'DEDETIZACAO', 'ELETRICO', 'EMISSAO_DE_PASSAGEM', 'ENERGIA', 'ENTREGA', 'ESGOTO', 'GRAFICA', 'HIDRAULICO', 'INFORMATICA', 'INTERNET', 'JURIDICO', 'LAVAGEM', 'LIMPEZA', 'LOCATICIOS', 'MANUTENCAO', 'MARCENARIA', 'MATERIAL_DE_CONSUMO', 'MATERIAL_DE_INFORMATICA', 'MATERIAL_DE_LIMPEZA', 'MATERIAL_EXPEDIENTE', 'OBRAS', 'ONGANIZACAO_DE_EVENTOS', 'PINTURA', 'PRODUCAO', 'RESERVA_DE_HOSPEDAGEM', 'SEGURANCA', 'SERVICOS_ADMINISTRATIVOS', 'TRASPORTE', 'VIDRACARIA', 'BANCO') NOT NULL, \`serviceEvaluation\` int NULL, \`commentEvaluation\` varchar(255) NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`bancaryInfoBank\` varchar(120) NULL, \`bancaryInfoAgency\` varchar(20) NULL, \`bancaryInfoAccountnumber\` varchar(20) NULL, \`bancaryInfoDv\` varchar(1) NULL, \`pixInfoKey_type\` varchar(255) NULL, \`pixInfoKey\` varchar(255) NULL, UNIQUE INDEX \`IDX_fce20fe3509933fa1931ae7cda\` (\`cnpj\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`payables\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`identifierCode\` varchar(255) NULL, \`debtorType\` varchar(255) NOT NULL DEFAULT 'FORNECEDOR', \`supplierId\` int NULL, \`collaboratorId\` int NULL, \`payableStatus\` varchar(255) NOT NULL DEFAULT 'EM APROVAÇÃO', \`paymentType\` varchar(255) NOT NULL, \`obs\` varchar(255) NULL, \`liquidValue\` float NOT NULL, \`taxValue\` float NOT NULL, \`totalValue\` float NOT NULL, \`paymentMethod\` varchar(255) NULL, \`barcode\` varchar(255) NULL, \`docType\` varchar(255) NULL, \`accountId\` int NULL, \`contractId\` int NULL, \`lastAditiveId\` int NULL, \`recurrent\` tinyint NOT NULL DEFAULT 0, \`dueDate\` timestamp NULL, \`paymentDate\` timestamp NULL, \`createdById\` int NOT NULL, \`updatedById\` int NULL, \`recurenceDataRecurrencetype\` varchar(50) NULL, \`recurenceDataStartdate\` timestamp NULL, \`recurenceDataEnddate\` timestamp NULL, \`recurenceDataDueday\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`categorization\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`programId\` int NOT NULL, \`budgetPlanId\` int NOT NULL, \`costCenterId\` int NOT NULL, \`categoryId\` int NOT NULL, \`subCategoryId\` int NOT NULL, \`payableRelationalId\` int NULL, \`receivableRelationalId\` int NULL, \`cardMovRelationalId\` int NULL, \`bankRecordApiId\` int NULL, UNIQUE INDEX \`REL_c41485b91efbb7cd81e323750a\` (\`payableRelationalId\`), UNIQUE INDEX \`REL_f44a7fdc3ccc8113f30e4be17e\` (\`receivableRelationalId\`), UNIQUE INDEX \`REL_d07d87ae49143f2f4635b1add6\` (\`cardMovRelationalId\`), UNIQUE INDEX \`REL_5e110986ea76ae14f26a09386a\` (\`bankRecordApiId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`cost_centers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL DEFAULT 'A PAGAR', \`active\` tinyint NOT NULL DEFAULT 1, \`budgetPlanId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`cost_centers_categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`costCenterId\` int NOT NULL, \`active\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`cost_centers_sub_categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`type\` enum ('INSTITUCIONAL', 'REDE') NOT NULL, \`releaseType\` enum ('IPCA', 'CAED', 'DESPESAS_PESSOAIS', 'DESPESAS_LOGISTICAS') NOT NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`costCenterCategoryId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`budget_results\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`month\` int NOT NULL, \`valueInCents\` int NOT NULL DEFAULT '0', \`budgetId\` int NOT NULL, \`costCenterSubCategoryId\` int NOT NULL, \`costCenterCategoryId\` int NOT NULL, \`data\` json NOT NULL, INDEX \`IDX_3c8b9c2098ae5188f25f4b2668\` (\`budgetId\`), INDEX \`IDX_a334a9ed71a0c6907598f07d51\` (\`costCenterSubCategoryId\`), INDEX \`IDX_bdeaa28b794d1bfb9a05f8ab11\` (\`costCenterCategoryId\`), INDEX \`IDX_6b70280b1525c45bfeb2293200\` (\`budgetId\`, \`costCenterSubCategoryId\`), INDEX \`IDX_cfa9bc66fef8ddb99c7c78e16d\` (\`budgetId\`, \`costCenterCategoryId\`), UNIQUE INDEX \`IDX_e3d49c15e9b292c4bdff0efa20\` (\`budgetId\`, \`costCenterSubCategoryId\`, \`month\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`budgets\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`valueInCents\` int NOT NULL DEFAULT '0', \`budgetPlanId\` int NOT NULL, \`partnerStateId\` int NULL, \`partnerMunicipalityId\` int NULL, INDEX \`IDX_2dc2b1ce8ec2dce59a8d6724cd\` (\`budgetPlanId\`), INDEX \`IDX_832331934a131d2284db0a6844\` (\`partnerStateId\`), INDEX \`IDX_a872513d801dc85fd210fd62ec\` (\`partnerMunicipalityId\`), UNIQUE INDEX \`IDX_482c917474d5b64be813171511\` (\`budgetPlanId\`, \`partnerMunicipalityId\`), UNIQUE INDEX \`IDX_b01c43f982a82072684b092be9\` (\`budgetPlanId\`, \`partnerStateId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`budget_plans\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`year\` int NOT NULL, \`scenarioName\` varchar(255) NULL, \`version\` float NOT NULL, \`totalInCents\` int NOT NULL DEFAULT '0', \`status\` enum ('APROVADO', 'EM_CALIBRACAO', 'RASCUNHO') NOT NULL DEFAULT 'RASCUNHO', \`programId\` int NOT NULL, \`updatedById\` int NOT NULL, \`parentId\` int NULL, \`mpath\` varchar(255) NULL DEFAULT '', INDEX \`IDX_408611507564b0ef32c0a00510\` (\`programId\`), INDEX \`IDX_9676d7380fa878067ee16ff96f\` (\`parentId\`), UNIQUE INDEX \`IDX_490ef2aad4afdd6f4e4ed73cfc\` (\`year\`, \`programId\`, \`version\`, \`parentId\`), INDEX \`IDX_0e3c48c023af51f159804b4819\` (\`year\`, \`programId\`, \`version\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`contracts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`contractCode\` varchar(30) NOT NULL, \`contractType\` varchar(30) NOT NULL, \`contractModel\` varchar(30) NOT NULL, \`contractStatus\` varchar(30) NOT NULL DEFAULT 'Pendente', \`object\` varchar(100) NOT NULL, \`totalValue\` float NOT NULL, \`agreement\` tinyint NOT NULL DEFAULT 0, \`budgetPlanId\` int NULL, \`programId\` int NULL, \`supplierId\` int NULL, \`financierId\` int NULL, \`collaboratorId\` int NULL, \`signedContractUrl\` varchar(255) NULL, \`settleTermUrl\` varchar(255) NULL, \`withdrawalUrl\` varchar(255) NULL, \`parentId\` int NULL, \`contractPeriodStart\` timestamp NULL, \`contractPeriodEnd\` timestamp NULL, \`pixInfoKey_type\` varchar(255) NULL, \`pixInfoKey\` varchar(255) NULL, \`bancaryInfoBank\` varchar(120) NULL, \`bancaryInfoAgency\` varchar(20) NULL, \`bancaryInfoAccountnumber\` varchar(20) NULL, \`bancaryInfoDv\` varchar(1) NULL, INDEX \`IDX_0915597a862682791c4b37aa2a\` (\`parentId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`history\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`actionType\` varchar(10) NOT NULL, \`contractId\` int NOT NULL, \`userId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`cpf\` varchar(11) NOT NULL, \`telephone\` varchar(255) NOT NULL, \`imageUrl\` varchar(255) NULL, \`password\` varchar(255) NOT NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`massApprovalPermission\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), UNIQUE INDEX \`IDX_230b925048540454c8b4c481e1\` (\`cpf\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`token\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`token\` text NOT NULL, \`expirationDate\` timestamp NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`share_budget_plans\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`username\` varchar(255) NULL, \`password\` varchar(255) NOT NULL, \`budgetPlanIds\` text NOT NULL, UNIQUE INDEX \`IDX_59ec72a3fd26713f9f5391551d\` (\`password\`, \`username\`), UNIQUE INDEX \`IDX_c89f58e266429f72a1f59997b6\` (\`username\`), UNIQUE INDEX \`IDX_5cc8157c1625acfc6ba11461d5\` (\`password\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`forgot_password\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`token\` varchar(255) NOT NULL, \`isValid\` tinyint NOT NULL DEFAULT 1, \`userId\` int NOT NULL, UNIQUE INDEX \`IDX_d4c574a9c74929c60da5a8c89f\` (\`token\`), UNIQUE INDEX \`REL_dba25590105b78ad1a6adfbc6a\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`approvals\` ADD CONSTRAINT \`FK_483a3bb1e2479baded0fd153724\` FOREIGN KEY (\`collaboratorId\`) REFERENCES \`collaborators\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`approvals\` ADD CONSTRAINT \`FK_1e2101aeb9348435fa104a7c166\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`approvals\` ADD CONSTRAINT \`FK_8a046e88925c543239ea91a498b\` FOREIGN KEY (\`payableId\`) REFERENCES \`payables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cardMovimentation\` ADD CONSTRAINT \`FK_b36062cffe8096bdcd055d3d24b\` FOREIGN KEY (\`cardId\`) REFERENCES \`creditCard\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cardMovimentation\` ADD CONSTRAINT \`FK_0e5e68e95cf2e57daaa688ea7b3\` FOREIGN KEY (\`payableId\`) REFERENCES \`payables\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`creditCard\` ADD CONSTRAINT \`FK_7d1617646921ed137739e1869b2\` FOREIGN KEY (\`accountId\`) REFERENCES \`accounts\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`bank-reconciliation\` ADD CONSTRAINT \`FK_30c884b995f6794b7efdb8d6619\` FOREIGN KEY (\`accountId\`) REFERENCES \`accounts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`bank-reconciliation\` ADD CONSTRAINT \`FK_d9247da1789c3e717038695fa07\` FOREIGN KEY (\`recordSystemId\`) REFERENCES \`installments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`bank-reconciliation\` ADD CONSTRAINT \`FK_14db56d0d0aa7f0a47c9d95cfc8\` FOREIGN KEY (\`transferedById\`) REFERENCES \`accounts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`bank-reconciliation\` ADD CONSTRAINT \`FK_fc06978d5152e3526d72c2a39e9\` FOREIGN KEY (\`recordApiId\`) REFERENCES \`bank-record-api\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`installments\` ADD CONSTRAINT \`FK_a2ea5d959b30d7bb247f2286ada\` FOREIGN KEY (\`payableId\`) REFERENCES \`payables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`installments\` ADD CONSTRAINT \`FK_f75558b228e0ad45c09171c9048\` FOREIGN KEY (\`receivableId\`) REFERENCES \`receivables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`installments\` ADD CONSTRAINT \`FK_2d3f999424b9c4e3492a402416f\` FOREIGN KEY (\`bankReconciliationId\`) REFERENCES \`bank-reconciliation\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`installments\` ADD CONSTRAINT \`FK_13e3886745664afcb949ba90e2a\` FOREIGN KEY (\`relatedLiquidInstallmentId\`) REFERENCES \`installments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`receivables\` ADD CONSTRAINT \`FK_122e3a109a8b24bcb7d626aa4d9\` FOREIGN KEY (\`financierId\`) REFERENCES \`financiers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`receivables\` ADD CONSTRAINT \`FK_5f94e48da03c04730e9b9d701f9\` FOREIGN KEY (\`accountId\`) REFERENCES \`accounts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`receivables\` ADD CONSTRAINT \`FK_1c23bb6996d35889683eeb61eab\` FOREIGN KEY (\`contractId\`) REFERENCES \`contracts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`files\` ADD CONSTRAINT \`FK_3ca89164652b42eb4edc9b0467d\` FOREIGN KEY (\`payableId\`) REFERENCES \`payables\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`files\` ADD CONSTRAINT \`FK_50ce6fe14a5cc6104b516034b27\` FOREIGN KEY (\`receivableId\`) REFERENCES \`receivables\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`files\` ADD CONSTRAINT \`FK_a6d407eda78bcda52fc286410a8\` FOREIGN KEY (\`contractId\`) REFERENCES \`contracts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payables\` ADD CONSTRAINT \`FK_ea92a8e12c8ed7ebe2444503afb\` FOREIGN KEY (\`supplierId\`) REFERENCES \`suppliers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payables\` ADD CONSTRAINT \`FK_3c7b755a48b3b56aab8ad13ead0\` FOREIGN KEY (\`collaboratorId\`) REFERENCES \`collaborators\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payables\` ADD CONSTRAINT \`FK_cdbd1df7fb0afe9e08b41172f95\` FOREIGN KEY (\`accountId\`) REFERENCES \`accounts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payables\` ADD CONSTRAINT \`FK_1ef6e318d6258763acd725665de\` FOREIGN KEY (\`contractId\`) REFERENCES \`contracts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categorization\` ADD CONSTRAINT \`FK_c41485b91efbb7cd81e323750a6\` FOREIGN KEY (\`payableRelationalId\`) REFERENCES \`payables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categorization\` ADD CONSTRAINT \`FK_f44a7fdc3ccc8113f30e4be17ec\` FOREIGN KEY (\`receivableRelationalId\`) REFERENCES \`receivables\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categorization\` ADD CONSTRAINT \`FK_d07d87ae49143f2f4635b1add62\` FOREIGN KEY (\`cardMovRelationalId\`) REFERENCES \`cardMovimentation\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categorization\` ADD CONSTRAINT \`FK_5e110986ea76ae14f26a09386a5\` FOREIGN KEY (\`bankRecordApiId\`) REFERENCES \`bank-record-api\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categorization\` ADD CONSTRAINT \`FK_dff5ff5de3e3c29ec66f5d6f1ca\` FOREIGN KEY (\`programId\`) REFERENCES \`programs\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categorization\` ADD CONSTRAINT \`FK_dfc82df3ba21e6744a8ef7a592e\` FOREIGN KEY (\`budgetPlanId\`) REFERENCES \`budget_plans\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categorization\` ADD CONSTRAINT \`FK_782dbbf237cd55478d4aed83772\` FOREIGN KEY (\`costCenterId\`) REFERENCES \`cost_centers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categorization\` ADD CONSTRAINT \`FK_0e1718afdbbf0ecbadb0fd2c2de\` FOREIGN KEY (\`categoryId\`) REFERENCES \`cost_centers_categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categorization\` ADD CONSTRAINT \`FK_c0e254ae09b5e3caa1889db1473\` FOREIGN KEY (\`subCategoryId\`) REFERENCES \`cost_centers_sub_categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cost_centers\` ADD CONSTRAINT \`FK_909be2b77ba6cb8462a7a705875\` FOREIGN KEY (\`budgetPlanId\`) REFERENCES \`budget_plans\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cost_centers_categories\` ADD CONSTRAINT \`FK_667881febfe8a2aa957caa952ee\` FOREIGN KEY (\`costCenterId\`) REFERENCES \`cost_centers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cost_centers_sub_categories\` ADD CONSTRAINT \`FK_555e580ffb5ce5a940d656972de\` FOREIGN KEY (\`costCenterCategoryId\`) REFERENCES \`cost_centers_categories\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`budget_results\` ADD CONSTRAINT \`FK_3c8b9c2098ae5188f25f4b2668c\` FOREIGN KEY (\`budgetId\`) REFERENCES \`budgets\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`budget_results\` ADD CONSTRAINT \`FK_a334a9ed71a0c6907598f07d51c\` FOREIGN KEY (\`costCenterSubCategoryId\`) REFERENCES \`cost_centers_sub_categories\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`budget_results\` ADD CONSTRAINT \`FK_bdeaa28b794d1bfb9a05f8ab11a\` FOREIGN KEY (\`costCenterCategoryId\`) REFERENCES \`cost_centers_categories\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`budgets\` ADD CONSTRAINT \`FK_2dc2b1ce8ec2dce59a8d6724cdd\` FOREIGN KEY (\`budgetPlanId\`) REFERENCES \`budget_plans\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`budgets\` ADD CONSTRAINT \`FK_832331934a131d2284db0a68440\` FOREIGN KEY (\`partnerStateId\`) REFERENCES \`partner_states\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`budgets\` ADD CONSTRAINT \`FK_a872513d801dc85fd210fd62ec6\` FOREIGN KEY (\`partnerMunicipalityId\`) REFERENCES \`partner_municipalities\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`budget_plans\` ADD CONSTRAINT \`FK_408611507564b0ef32c0a005108\` FOREIGN KEY (\`programId\`) REFERENCES \`programs\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`budget_plans\` ADD CONSTRAINT \`FK_0b6d7c9a9dd0dc5129c5ca97a4f\` FOREIGN KEY (\`updatedById\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`budget_plans\` ADD CONSTRAINT \`FK_9676d7380fa878067ee16ff96fd\` FOREIGN KEY (\`parentId\`) REFERENCES \`budget_plans\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`contracts\` ADD CONSTRAINT \`FK_0915597a862682791c4b37aa2a2\` FOREIGN KEY (\`parentId\`) REFERENCES \`contracts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`contracts\` ADD CONSTRAINT \`FK_4839cd50dda36737dbe05d8da83\` FOREIGN KEY (\`budgetPlanId\`) REFERENCES \`budget_plans\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`contracts\` ADD CONSTRAINT \`FK_690b42c3ec45394fb4ede7f956c\` FOREIGN KEY (\`supplierId\`) REFERENCES \`suppliers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`contracts\` ADD CONSTRAINT \`FK_b136fca540b19d7241a9b111626\` FOREIGN KEY (\`financierId\`) REFERENCES \`financiers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`contracts\` ADD CONSTRAINT \`FK_aa9aa2d2e1513ae27a35b1e95bb\` FOREIGN KEY (\`collaboratorId\`) REFERENCES \`collaborators\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`contracts\` ADD CONSTRAINT \`FK_83473b450a5511b3a44ffe6d239\` FOREIGN KEY (\`programId\`) REFERENCES \`programs\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history\` ADD CONSTRAINT \`FK_7d339708f0fa8446e3c4128dea9\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history\` ADD CONSTRAINT \`FK_084f9b89dab9b0e658e9d9c7832\` FOREIGN KEY (\`contractId\`) REFERENCES \`contracts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`forgot_password\` ADD CONSTRAINT \`FK_dba25590105b78ad1a6adfbc6ae\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TABLE \`query-result-cache\` (\`id\` int NOT NULL AUTO_INCREMENT, \`identifier\` varchar(255) NULL, \`time\` bigint NOT NULL, \`duration\` int NOT NULL, \`query\` text NOT NULL, \`result\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`query-result-cache\``);
    await queryRunner.query(
      `ALTER TABLE \`forgot_password\` DROP FOREIGN KEY \`FK_dba25590105b78ad1a6adfbc6ae\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`history\` DROP FOREIGN KEY \`FK_084f9b89dab9b0e658e9d9c7832\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`history\` DROP FOREIGN KEY \`FK_7d339708f0fa8446e3c4128dea9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`contracts\` DROP FOREIGN KEY \`FK_83473b450a5511b3a44ffe6d239\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`contracts\` DROP FOREIGN KEY \`FK_aa9aa2d2e1513ae27a35b1e95bb\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`contracts\` DROP FOREIGN KEY \`FK_b136fca540b19d7241a9b111626\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`contracts\` DROP FOREIGN KEY \`FK_690b42c3ec45394fb4ede7f956c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`contracts\` DROP FOREIGN KEY \`FK_4839cd50dda36737dbe05d8da83\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`contracts\` DROP FOREIGN KEY \`FK_0915597a862682791c4b37aa2a2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`budget_plans\` DROP FOREIGN KEY \`FK_9676d7380fa878067ee16ff96fd\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`budget_plans\` DROP FOREIGN KEY \`FK_0b6d7c9a9dd0dc5129c5ca97a4f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`budget_plans\` DROP FOREIGN KEY \`FK_408611507564b0ef32c0a005108\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`budgets\` DROP FOREIGN KEY \`FK_a872513d801dc85fd210fd62ec6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`budgets\` DROP FOREIGN KEY \`FK_832331934a131d2284db0a68440\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`budgets\` DROP FOREIGN KEY \`FK_2dc2b1ce8ec2dce59a8d6724cdd\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`budget_results\` DROP FOREIGN KEY \`FK_bdeaa28b794d1bfb9a05f8ab11a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`budget_results\` DROP FOREIGN KEY \`FK_a334a9ed71a0c6907598f07d51c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`budget_results\` DROP FOREIGN KEY \`FK_3c8b9c2098ae5188f25f4b2668c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cost_centers_sub_categories\` DROP FOREIGN KEY \`FK_555e580ffb5ce5a940d656972de\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cost_centers_categories\` DROP FOREIGN KEY \`FK_667881febfe8a2aa957caa952ee\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cost_centers\` DROP FOREIGN KEY \`FK_909be2b77ba6cb8462a7a705875\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categorization\` DROP FOREIGN KEY \`FK_c0e254ae09b5e3caa1889db1473\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categorization\` DROP FOREIGN KEY \`FK_0e1718afdbbf0ecbadb0fd2c2de\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categorization\` DROP FOREIGN KEY \`FK_782dbbf237cd55478d4aed83772\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categorization\` DROP FOREIGN KEY \`FK_dfc82df3ba21e6744a8ef7a592e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categorization\` DROP FOREIGN KEY \`FK_dff5ff5de3e3c29ec66f5d6f1ca\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categorization\` DROP FOREIGN KEY \`FK_5e110986ea76ae14f26a09386a5\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categorization\` DROP FOREIGN KEY \`FK_d07d87ae49143f2f4635b1add62\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categorization\` DROP FOREIGN KEY \`FK_f44a7fdc3ccc8113f30e4be17ec\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categorization\` DROP FOREIGN KEY \`FK_c41485b91efbb7cd81e323750a6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payables\` DROP FOREIGN KEY \`FK_1ef6e318d6258763acd725665de\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payables\` DROP FOREIGN KEY \`FK_cdbd1df7fb0afe9e08b41172f95\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payables\` DROP FOREIGN KEY \`FK_3c7b755a48b3b56aab8ad13ead0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payables\` DROP FOREIGN KEY \`FK_ea92a8e12c8ed7ebe2444503afb\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`files\` DROP FOREIGN KEY \`FK_a6d407eda78bcda52fc286410a8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`files\` DROP FOREIGN KEY \`FK_50ce6fe14a5cc6104b516034b27\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`files\` DROP FOREIGN KEY \`FK_3ca89164652b42eb4edc9b0467d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`receivables\` DROP FOREIGN KEY \`FK_1c23bb6996d35889683eeb61eab\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`receivables\` DROP FOREIGN KEY \`FK_5f94e48da03c04730e9b9d701f9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`receivables\` DROP FOREIGN KEY \`FK_122e3a109a8b24bcb7d626aa4d9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`installments\` DROP FOREIGN KEY \`FK_13e3886745664afcb949ba90e2a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`installments\` DROP FOREIGN KEY \`FK_2d3f999424b9c4e3492a402416f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`installments\` DROP FOREIGN KEY \`FK_f75558b228e0ad45c09171c9048\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`installments\` DROP FOREIGN KEY \`FK_a2ea5d959b30d7bb247f2286ada\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`bank-reconciliation\` DROP FOREIGN KEY \`FK_fc06978d5152e3526d72c2a39e9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`bank-reconciliation\` DROP FOREIGN KEY \`FK_14db56d0d0aa7f0a47c9d95cfc8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`bank-reconciliation\` DROP FOREIGN KEY \`FK_d9247da1789c3e717038695fa07\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`bank-reconciliation\` DROP FOREIGN KEY \`FK_30c884b995f6794b7efdb8d6619\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`creditCard\` DROP FOREIGN KEY \`FK_7d1617646921ed137739e1869b2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cardMovimentation\` DROP FOREIGN KEY \`FK_0e5e68e95cf2e57daaa688ea7b3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cardMovimentation\` DROP FOREIGN KEY \`FK_b36062cffe8096bdcd055d3d24b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`approvals\` DROP FOREIGN KEY \`FK_8a046e88925c543239ea91a498b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`approvals\` DROP FOREIGN KEY \`FK_1e2101aeb9348435fa104a7c166\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`approvals\` DROP FOREIGN KEY \`FK_483a3bb1e2479baded0fd153724\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_dba25590105b78ad1a6adfbc6a\` ON \`forgot_password\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_d4c574a9c74929c60da5a8c89f\` ON \`forgot_password\``,
    );
    await queryRunner.query(`DROP TABLE \`forgot_password\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_5cc8157c1625acfc6ba11461d5\` ON \`share_budget_plans\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_c89f58e266429f72a1f59997b6\` ON \`share_budget_plans\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_59ec72a3fd26713f9f5391551d\` ON \`share_budget_plans\``,
    );
    await queryRunner.query(`DROP TABLE \`share_budget_plans\``);
    await queryRunner.query(`DROP TABLE \`token\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_230b925048540454c8b4c481e1\` ON \`users\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(`DROP TABLE \`history\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_0915597a862682791c4b37aa2a\` ON \`contracts\``,
    );
    await queryRunner.query(`DROP TABLE \`contracts\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_0e3c48c023af51f159804b4819\` ON \`budget_plans\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_490ef2aad4afdd6f4e4ed73cfc\` ON \`budget_plans\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_9676d7380fa878067ee16ff96f\` ON \`budget_plans\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_408611507564b0ef32c0a00510\` ON \`budget_plans\``,
    );
    await queryRunner.query(`DROP TABLE \`budget_plans\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_b01c43f982a82072684b092be9\` ON \`budgets\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_482c917474d5b64be813171511\` ON \`budgets\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_a872513d801dc85fd210fd62ec\` ON \`budgets\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_832331934a131d2284db0a6844\` ON \`budgets\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_2dc2b1ce8ec2dce59a8d6724cd\` ON \`budgets\``,
    );
    await queryRunner.query(`DROP TABLE \`budgets\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_e3d49c15e9b292c4bdff0efa20\` ON \`budget_results\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_cfa9bc66fef8ddb99c7c78e16d\` ON \`budget_results\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_6b70280b1525c45bfeb2293200\` ON \`budget_results\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_bdeaa28b794d1bfb9a05f8ab11\` ON \`budget_results\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_a334a9ed71a0c6907598f07d51\` ON \`budget_results\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_3c8b9c2098ae5188f25f4b2668\` ON \`budget_results\``,
    );
    await queryRunner.query(`DROP TABLE \`budget_results\``);
    await queryRunner.query(`DROP TABLE \`cost_centers_sub_categories\``);
    await queryRunner.query(`DROP TABLE \`cost_centers_categories\``);
    await queryRunner.query(`DROP TABLE \`cost_centers\``);
    await queryRunner.query(
      `DROP INDEX \`REL_5e110986ea76ae14f26a09386a\` ON \`categorization\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_d07d87ae49143f2f4635b1add6\` ON \`categorization\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_f44a7fdc3ccc8113f30e4be17e\` ON \`categorization\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_c41485b91efbb7cd81e323750a\` ON \`categorization\``,
    );
    await queryRunner.query(`DROP TABLE \`categorization\``);
    await queryRunner.query(`DROP TABLE \`payables\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_fce20fe3509933fa1931ae7cda\` ON \`suppliers\``,
    );
    await queryRunner.query(`DROP TABLE \`suppliers\``);
    await queryRunner.query(`DROP TABLE \`files\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_772f629c956189807517e76ebb\` ON \`receivables\``,
    );
    await queryRunner.query(`DROP TABLE \`receivables\``);
    await queryRunner.query(
      `DROP INDEX \`REL_13e3886745664afcb949ba90e2\` ON \`installments\``,
    );
    await queryRunner.query(`DROP TABLE \`installments\``);
    await queryRunner.query(
      `DROP INDEX \`REL_fc06978d5152e3526d72c2a39e\` ON \`bank-reconciliation\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_14db56d0d0aa7f0a47c9d95cfc\` ON \`bank-reconciliation\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_d9247da1789c3e717038695fa0\` ON \`bank-reconciliation\``,
    );
    await queryRunner.query(`DROP TABLE \`bank-reconciliation\``);
    await queryRunner.query(`DROP TABLE \`bank-record-api\``);
    await queryRunner.query(`DROP TABLE \`accounts\``);
    await queryRunner.query(`DROP TABLE \`creditCard\``);
    await queryRunner.query(`DROP TABLE \`cardMovimentation\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_f69a2a831342eef4f98add79d2\` ON \`financiers\``,
    );
    await queryRunner.query(`DROP TABLE \`financiers\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_e84cd213cc7474ecd87a30f871\` ON \`collaborators\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_fa7ec23129d7651aed5b6ce06e\` ON \`collaborators\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_b210f505222bd59004a7716585\` ON \`collaborators\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_110619b124cea89960467e0e4e\` ON \`collaborators\``,
    );
    await queryRunner.query(`DROP TABLE \`collaborators\``);
    await queryRunner.query(`DROP TABLE \`approvals\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_14263c6ac97887c3756c95234f\` ON \`programs\``,
    );
    await queryRunner.query(`DROP TABLE \`programs\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_c7f7fcf097d8f984fb8257b7c3\` ON \`partner_states\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_76175b09a03eac58ff8f9de5e5\` ON \`partner_states\``,
    );
    await queryRunner.query(`DROP TABLE \`partner_states\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_0e07662ca56d7f378876bf3b61\` ON \`partner_municipalities\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_ae0c73d6f519f530fc8ae73ebf\` ON \`partner_municipalities\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_c8531d7dc0e64b443efcd7f9ca\` ON \`partner_municipalities\``,
    );
    await queryRunner.query(`DROP TABLE \`partner_municipalities\``);
  }
}
