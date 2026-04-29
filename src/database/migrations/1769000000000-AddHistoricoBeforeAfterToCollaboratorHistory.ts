import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHistoricoBeforeAfterToCollaboratorHistory1769000000000
  implements MigrationInterface
{
  name = "AddHistoricoBeforeAfterToCollaboratorHistory1769000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`collaborator_history\`
        ADD COLUMN \`previousOccupationArea\` VARCHAR(255) NULL,
        ADD COLUMN \`newOccupationArea\` VARCHAR(255) NULL,
        ADD COLUMN \`historico_antes\` VARCHAR(1000) NULL,
        ADD COLUMN \`historico_depois\` VARCHAR(1000) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`collaborator_history\`
        DROP COLUMN \`previousOccupationArea\`,
        DROP COLUMN \`newOccupationArea\`,
        DROP COLUMN \`historico_antes\`,
        DROP COLUMN \`historico_depois\`
    `);
  }
}
