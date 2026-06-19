/**
 * Applies pending Prisma migrations to the Turso (libsql) database.
 * Run with: node scripts/migrate.mjs
 *
 * Requires DATABASE_URL and DATABASE_AUTH_TOKEN env vars (or a .env.local file).
 */

import { createClient } from "@libsql/client";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local if present
const envFile = join(__dirname, "..", ".env.local");
if (existsSync(envFile)) {
  const lines = readFileSync(envFile, "utf8").split("\n");
  for (const line of lines) {
    const [key, ...rest] = line.split("=");
    if (key?.trim() && !process.env[key.trim()]) {
      process.env[key.trim()] = rest.join("=").trim().replace(/^["']|["']$/g, "");
    }
  }
}

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url) {
  console.error("❌  DATABASE_URL is not set");
  process.exit(1);
}

const client = createClient({ url, authToken });

const migrationsDir = join(__dirname, "..", "prisma", "migrations");

// Get all migration folders in order
import { readdirSync, statSync } from "fs";

const folders = readdirSync(migrationsDir)
  .filter((f) => statSync(join(migrationsDir, f)).isDirectory())
  .sort();

// Create a _migrations table to track what's been applied
await client.execute(`
  CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    id TEXT PRIMARY KEY,
    checksum TEXT NOT NULL,
    finished_at DATETIME,
    migration_name TEXT NOT NULL,
    logs TEXT,
    rolled_back_at DATETIME,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    applied_steps_count INTEGER NOT NULL DEFAULT 0
  )
`);

for (const folder of folders) {
  const sqlPath = join(migrationsDir, folder, "migration.sql");
  if (!existsSync(sqlPath)) continue;

  const already = await client.execute({
    sql: "SELECT id FROM _prisma_migrations WHERE migration_name = ?",
    args: [folder],
  });

  if (already.rows.length > 0) {
    console.log(`  ↩  ${folder} (already applied)`);
    continue;
  }

  const sql = readFileSync(sqlPath, "utf8");
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`  ▶  Applying: ${folder}`);

  for (const stmt of statements) {
    try {
      await client.execute(stmt);
    } catch (e) {
      // Ignore "already exists" errors for idempotency
      if (!e.message?.includes("already exists") && !e.message?.includes("duplicate column")) {
        console.error(`     ❌  Failed on: ${stmt.slice(0, 60)}…`);
        console.error(`     ${e.message}`);
      }
    }
  }

  await client.execute({
    sql: "INSERT INTO _prisma_migrations (id, checksum, migration_name, applied_steps_count, finished_at) VALUES (?, ?, ?, ?, datetime('now'))",
    args: [crypto.randomUUID(), folder, folder, statements.length],
  });

  console.log(`     ✅  Done`);
}

console.log("\n✅  All migrations applied.");
client.close?.();
