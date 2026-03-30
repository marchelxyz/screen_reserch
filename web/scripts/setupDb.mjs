/**
 * Синхронизация схемы БД перед стартом приложения (Railway, Docker, локально).
 *
 * Почему два шага:
 * 1) create_tables.sql — «bootstrap»: CREATE TABLE IF NOT EXISTS + идемпотентные ALTER для
 *    старых БД, где таблица появилась без части колонок (CREATE IF NOT EXISTS саму таблицу
 *    не обновляет).
 * 2) prisma migrate deploy — применяет миграции из prisma/migrations и ведёт _prisma_migrations,
 *    чтобы схема не расходилась с репозиторием.
 *
 * Раньше в Docker не копировались prisma/ и prisma.config.ts, поэтому migrate deploy
 * вообще нельзя было вызывать в production.
 * В .dockerignore не должно быть prisma/migrations — иначе в образе пустая папка и P3005.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  console.log("[db:setup] bootstrap SQL (scripts/create_tables.sql)…");
  await runBootstrapSql(databaseUrl);

  if (!hasPrismaMigrationFiles()) {
    console.warn(
      "[db:setup] prisma/migrations пуст или отсутствует — пропускаем migrate deploy (схема только из create_tables.sql)."
    );
  } else {
    console.log("[db:setup] prisma migrate deploy…");
    runPrismaMigrateDeploy();
  }

  console.log("[db:setup] done.");
}

/**
 * Выполняет идемпотентный SQL: создание таблицы при отсутствии и доведение legacy-строк
 * до ограничений NOT NULL / уникального session_id.
 */
async function runBootstrapSql(databaseUrl) {
  const filePath = path.join(process.cwd(), "scripts", "create_tables.sql");
  const sql = fs.readFileSync(filePath, "utf8");
  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    await client.query(sql);
  } finally {
    await client.end();
  }
}

/**
 * Проверяет, что в образе есть хотя бы одна миграция (в .dockerignore не должно быть prisma/migrations).
 */
function hasPrismaMigrationFiles() {
  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
  if (!fs.existsSync(migrationsDir)) {
    return false;
  }
  const entries = fs.readdirSync(migrationsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const sqlPath = path.join(migrationsDir, entry.name, "migration.sql");
    if (fs.existsSync(sqlPath)) {
      return true;
    }
  }
  return false;
}

/**
 * Применяет неприменённые миграции Prisma (нужны каталог prisma/ и prisma.config.ts в образе).
 */
function runPrismaMigrateDeploy() {
  execSync("npx prisma migrate deploy", {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });
}

try {
  await main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
