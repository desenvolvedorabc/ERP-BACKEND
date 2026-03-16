import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFoodCategoryEnum1748272455047 implements MigrationInterface {
  name = "UpdateFoodCategoryEnum1748272455047";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Atualizar o enum foodCategory para incluir a opção OUTRO
    await queryRunner.query(
      `ALTER TABLE \`collaborators\` MODIFY COLUMN \`foodCategory\` enum('ONIVORO', 'VEGANO', 'VEGETARIANO', 'PESCETARIANO', 'OUTRO', 'PREFIRO_NAO_RESPONDER') NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter para o enum original
    await queryRunner.query(
      `ALTER TABLE \`collaborators\` MODIFY COLUMN \`foodCategory\` enum('ONIVORO', 'VEGANO', 'VEGETARIANO', 'PESCETARIANO', 'PREFIRO_NAO_RESPONDER') NULL`,
    );
  }
}
