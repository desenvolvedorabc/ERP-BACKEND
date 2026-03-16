import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTotalInCentsColumn1748272455047 implements MigrationInterface {
  name = "FixTotalInCentsColumn1748272455047";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`budget_plans\` MODIFY COLUMN \`totalInCents\` bigint NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`budget_plans\` MODIFY COLUMN \`totalInCents\` int NOT NULL DEFAULT '0'`,
    );
  }
}
