import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const sql = readFileSync(
  "prisma/migrations/20260514093814_init/migration.sql",
  "utf8"
);

// Extract only the actual SQL statements (lines not starting with --)
const statements = [];
let current = [];

for (const line of sql.split("\n")) {
  const trimmed = line.trim();
  if (trimmed.startsWith("--") || trimmed === "") continue;
  current.push(trimmed);
  if (trimmed.endsWith(";")) {
    statements.push(current.join(" "));
    current = [];
  }
}

console.log(`Found ${statements.length} statements to execute.\n`);

let ok = 0, skipped = 0, errors = 0;

for (const stmt of statements) {
  try {
    await client.execute(stmt);
    console.log("✓", stmt.substring(0, 70).replace(/\s+/g, " "));
    ok++;
  } catch (e) {
    if (e.message?.includes("already exists") || e.message?.includes("duplicate")) {
      console.log("~", stmt.substring(0, 70).replace(/\s+/g, " "), "(already exists)");
      skipped++;
    } else {
      console.error("✗", stmt.substring(0, 70).replace(/\s+/g, " "));
      console.error("  Error:", e.message);
      errors++;
    }
  }
}

console.log(`\n✅ Done: ${ok} executed, ${skipped} skipped (already existed), ${errors} errors.`);
process.exit(errors > 0 ? 1 : 0);
