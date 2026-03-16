import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCollaboratorId1761228599194 implements MigrationInterface {
  name = 'AddCollaboratorId1761228599194'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a coluna já existe
    const table = await queryRunner.getTable('users')
    const columnExists = table?.findColumnByName('collaboratorId')

    if (!columnExists) {
    await queryRunner.query(`ALTER TABLE \`users\` ADD \`collaboratorId\` int NULL`)
    }

    // Verificar se a constraint já existe (recarregar a tabela após adicionar a coluna)
    const updatedTable = await queryRunner.getTable('users')
    const foreignKeys = updatedTable?.foreignKeys || []
    const constraintExists = foreignKeys.some(
      (fk) => fk.name === 'FK_291574ccf50a622bba1b5e0a3fe',
    )

    if (!constraintExists) {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD CONSTRAINT \`FK_291574ccf50a622bba1b5e0a3fe\` FOREIGN KEY (\`collaboratorId\`) REFERENCES \`collaborators\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('users')
    const foreignKeys = table?.foreignKeys || []
    const constraintExists = foreignKeys.some(
      (fk) => fk.name === 'FK_291574ccf50a622bba1b5e0a3fe',
    )

    if (constraintExists) {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_291574ccf50a622bba1b5e0a3fe\``,
    )
    }

    const columnExists = table?.findColumnByName('collaboratorId')
    if (columnExists) {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`collaboratorId\``)
    }
  }
}
