import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCollaboratorHistory1764088249000
  implements MigrationInterface
{
  name = "CreateCollaboratorHistory1764088249000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`collaborator_history\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`collaboratorId\` int NOT NULL,
        \`previousRole\` varchar(255) NULL,
        \`newRole\` varchar(255) NULL,
        \`previousStartOfContract\` timestamp NULL,
        \`newStartOfContract\` timestamp NULL,
        \`previousRemuneration\` decimal(10,2) NULL,
        \`newRemuneration\` decimal(10,2) NULL,
        \`previousActive\` tinyint NULL,
        \`newActive\` tinyint NULL,
        \`previousDisableBy\` enum('DESLIGAMENTO_ABC', 'FALECIMENTO', 'TEMPO_CONTRATO_FINALIZADO', 'SOLICITACAO_RESCISAO_CONTRATUAL') NULL,
        \`newDisableBy\` enum('DESLIGAMENTO_ABC', 'FALECIMENTO', 'TEMPO_CONTRATO_FINALIZADO', 'SOLICITACAO_RESCISAO_CONTRATUAL') NULL,
        \`changedField\` varchar(255) NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_collaborator_history_collaboratorId\` (\`collaboratorId\`),
        CONSTRAINT \`FK_collaborator_history_collaborator\` FOREIGN KEY (\`collaboratorId\`) REFERENCES \`collaborators\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`collaborator_history\``);
  }
}

