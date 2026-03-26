import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";

async function readSqlFile() {
  const filePath = path.join(process.cwd(), "scripts", "create_tables.sql");
  return fs.readFileSync(filePath, "utf8");
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = await readSqlFile();

  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    await client.query(sql);
  } finally {
    await client.end();
  }
}

await main();

