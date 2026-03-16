import { MigrationInterface, QueryRunner } from "typeorm";

export class FixValueInCentsColumnToBigint1756321700000 implements MigrationInterface {
  name = "FixValueInCentsColumnToBigint1756321700000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`budget_results\` MODIFY COLUMN \`valueInCents\` bigint NOT NULL DEFAULT '0'`,
    );

    await queryRunner.query(
      `ALTER TABLE \`budgets\` MODIFY COLUMN \`valueInCents\` bigint NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`budget_results\` MODIFY COLUMN \`valueInCents\` int NOT NULL DEFAULT '0'`,
    );

    await queryRunner.query(
      `ALTER TABLE \`budgets\` MODIFY COLUMN \`valueInCents\` int NOT NULL DEFAULT '0'`,
    );
  }
}
