import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFoodCategoryDescription1748272455046
  implements MigrationInterface
{
  name = "AddFoodCategoryDescription1748272455046";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`collaborators\` ADD \`foodCategoryDescription\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`collaborators\` DROP COLUMN \`foodCategoryDescription\``,
    );
  }
}
