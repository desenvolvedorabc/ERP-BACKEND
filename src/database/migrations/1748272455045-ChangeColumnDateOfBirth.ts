import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeColumnDateOfBirth1748272455045
  implements MigrationInterface
{
  name = "ChangeColumnDateOfBirth1748272455045";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE collaborators 
            MODIFY COLUMN dateOfBirth DATETIME NULL;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE collaborators 
            MODIFY COLUMN dateOfBirth TIMESTAMP NULL;
        `);
  }
}
