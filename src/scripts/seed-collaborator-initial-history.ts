/**
 * Script: seed-collaborator-initial-history
 *
 * Insere o snapshot inicial (role, PROGRAMA, startOfContract, remuneration)
 * para colaboradores cadastrados antes da funcionalidade de histórico inicial.
 *
 * Um colaborador é considerado "sem histórico inicial" quando não possui nenhum
 * registro em collaborator_history com historico_antes IS NULL e changedField
 * em ('role', 'PROGRAMA', 'startOfContract', 'remuneration', 'INCLUSAO').
 *
 * Uso:
 *   yarn ts-node -r tsconfig-paths/register src/scripts/seed-collaborator-initial-history.ts
 */

import { DataSource, In, IsNull } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

// ─── Configuração da conexão ────────────────────────────────────────────────

const dataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || process.env.DB_HOST_LOCAL,
  port: parseInt(process.env.DB_PORT || "3306", 10),
  username: process.env.DB_USERNAME || process.env.DB_USERNAME_LOCAL,
  password: process.env.DB_PASSWORD || process.env.DB_PASSWORD_LOCAL,
  database: process.env.DB_NAME,
  entities: ["src/**/*.entity{.ts,.js}"],
  synchronize: false,
  logging: false,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// ─── Helpers de formatação (espelho de collaborator-history.service.ts) ─────

function formatDateBR(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR");
}

function formatMoney(value: number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// ─── Campos que identificam um snapshot inicial ───────────────────────────

const INITIAL_FIELDS = ["role", "PROGRAMA", "startOfContract", "remuneration", "INCLUSAO"];

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  await dataSource.initialize();
  console.log("Conectado ao banco de dados.");

  const collaboratorRepo = dataSource.getRepository("collaborators");
  const historyRepo = dataSource.getRepository("collaborator_history");

  // 1. Busca todos os colaboradores
  const collaborators: any[] = await collaboratorRepo.find();
  console.log(`Total de colaboradores encontrados: ${collaborators.length}`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const collaborator of collaborators) {
    try {
      // 2. Verifica se já tem algum registro de snapshot inicial
      const existingInitial = await historyRepo.findOne({
        where: {
          collaboratorId: collaborator.id,
          historico_antes: IsNull(),
          changedField: In(INITIAL_FIELDS),
        },
      } as any);

      if (existingInitial) {
        skipped++;
        continue;
      }

      // 3. Busca a remuneração: pega o newRemuneration mais antigo do histórico
      const remunerationRecord: any = await historyRepo.findOne({
        where: {
          collaboratorId: collaborator.id,
          changedField: "remuneration",
        },
        order: { createdAt: "ASC" },
      } as any);

      const remuneration = remunerationRecord?.newRemuneration ?? null;

      // 4. Monta os registros de snapshot inicial
      const records: any[] = [];

      // Cargo
      if (collaborator.role) {
        records.push({
          collaboratorId: collaborator.id,
          changedField: "role",
          newRole: collaborator.role,
          historico_antes: null,
          historico_depois: collaborator.role,
        });
      }

      // Programa (Área de Atuação)
      if (collaborator.occupationArea) {
        records.push({
          collaboratorId: collaborator.id,
          changedField: "PROGRAMA",
          newOccupationArea: collaborator.occupationArea,
          historico_antes: null,
          historico_depois: collaborator.occupationArea,
        });
      }

      // Data de Admissão
      if (collaborator.startOfContract) {
        const startDate =
          collaborator.startOfContract instanceof Date
            ? collaborator.startOfContract
            : new Date(collaborator.startOfContract);

        records.push({
          collaboratorId: collaborator.id,
          changedField: "startOfContract",
          newStartOfContract: startDate,
          historico_antes: null,
          historico_depois: formatDateBR(startDate),
        });
      }

      // Remuneração
      if (remuneration !== null && remuneration !== undefined) {
        records.push({
          collaboratorId: collaborator.id,
          changedField: "remuneration",
          newRemuneration: remuneration,
          historico_antes: null,
          historico_depois: formatMoney(Number(remuneration)),
        });
      }

      // Fallback: se nenhum campo preenchido, insere registro genérico
      if (records.length === 0) {
        records.push({
          collaboratorId: collaborator.id,
          changedField: "INCLUSAO",
          historico_antes: null,
          historico_depois: "Colaborador incluído no sistema",
        });
      }

      // 5. Persiste os registros
      for (const record of records) {
        const entity = historyRepo.create(record);
        await historyRepo.save(entity);
      }

      processed++;
      console.log(
        `[OK] Colaborador #${collaborator.id} (${collaborator.name}) — ${records.length} registro(s) inserido(s)`,
      );
    } catch (err) {
      errors++;
      console.error(
        `[ERRO] Colaborador #${collaborator.id} (${collaborator.name}):`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  await dataSource.destroy();

  console.log("\n─── Resumo ───────────────────────────────────────");
  console.log(`Processados (histórico inserido): ${processed}`);
  console.log(`Ignorados (já tinham histórico inicial): ${skipped}`);
  console.log(`Erros: ${errors}`);
  console.log("──────────────────────────────────────────────────");
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
