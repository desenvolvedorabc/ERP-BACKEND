import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompetenceDateToPayables1764700700000 implements MigrationInterface {
    name = 'AddCompetenceDateToPayables1764700700000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payables\` ADD \`competence_date\` date NULL DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payables\` DROP COLUMN \`competence_date\``);
    }
}
