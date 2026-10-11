import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { config } from "../config";

export type DB = Database.Database;

let db: DB | null = null;

/** Каталог с SQL-миграциями: рядом с исходником (dev) или скопированный в сборку (prod) */
function migrationsDir() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [path.join(here, "migrations"), path.join(here, "db", "migrations"), path.join(config.root, "server", "db", "migrations")];
  const found = candidates.find((d) => fs.existsSync(d));
  if (!found) throw new Error("Не найден каталог миграций");
  return found;
}

/** Применяет новые миграции по порядку; каждая — в отдельной транзакции */
export function migrate(conn: DB) {
  conn.exec("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
  const applied = new Set(conn.prepare("SELECT name FROM schema_migrations").all().map((r) => (r as { name: string }).name));
  const dir = migrationsDir();
  const files = fs
    .readdirSync(dir)
    .filter((f) => /^\d+_.+\.sql$/.test(f))
    .sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    conn.transaction(() => {
      conn.exec(sql);
      conn.prepare("INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)").run(file, new Date().toISOString());
    })();
    console.log(`[db] применена миграция ${file}`);
  }
}

export function openDb(file = config.dbFile): DB {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const conn = new Database(file);
  conn.pragma("journal_mode = WAL");
  conn.pragma("foreign_keys = ON");
  conn.pragma("busy_timeout = 5000");
  return conn;
}

export function getDb(): DB {
  if (!db) {
    db = openDb();
    migrate(db);
  }
  return db;
}

export function closeDb() {
  db?.close();
  db = null;
}

export const nowIso = () => new Date().toISOString();
