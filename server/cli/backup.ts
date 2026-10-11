/**
 * Резервная копия: снимок БД (онлайн-бэкап SQLite, можно делать при работающем сайте)
 * и копия загруженных файлов в backups/<дата>/.
 *
 *   npm run backup
 *
 * Восстановление: остановить сервер, скопировать cloudrepairs.db и папку uploads
 * из нужной копии в DATA_DIR, запустить сервер (см. README).
 */
import fs from "node:fs";
import path from "node:path";
import { config } from "../config";
import { getDb, closeDb } from "../db";

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(config.backupsDir, stamp);
  fs.mkdirSync(dir, { recursive: true });
  const db = getDb();
  await db.backup(path.join(dir, "cloudrepairs.db"));
  closeDb();
  if (fs.existsSync(config.uploadsDir)) fs.cpSync(config.uploadsDir, path.join(dir, "uploads"), { recursive: true });
  console.log(`Резервная копия создана: ${dir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
