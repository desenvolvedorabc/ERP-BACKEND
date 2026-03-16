import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsIndefiniteToContractPeriod1764675411277 implements MigrationInterface {
    name = 'AddIsIndefiniteToContractPeriod1764675411277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`contracts\` ADD \`contractPeriodIsIndefinite\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`contracts\` DROP COLUMN \`contractPeriodIsIndefinite\``);
    }
}
