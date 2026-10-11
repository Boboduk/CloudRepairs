import path from "node:path";

/** Настройки сервера из переменных окружения (см. .env.example) */
function bool(v: string | undefined, def: boolean) {
  if (v === undefined || v === "") return def;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
}

const isProd = process.env.NODE_ENV === "production";
const root = process.cwd();
const dataDir = path.resolve(root, process.env.DATA_DIR || "data");

export const config = {
  isProd,
  root,
  port: Number(process.env.PORT || 3000),
  host: process.env.HOST || "0.0.0.0",
  dataDir,
  dbFile: path.join(dataDir, "cloudrepairs.db"),
  uploadsDir: path.join(dataDir, "uploads"),
  backupsDir: path.resolve(root, process.env.BACKUP_DIR || "backups"),
  publicUrl: (process.env.PUBLIC_URL || "https://cloudrepairs.ru").replace(/\/$/, ""),
  /** Время жизни сессии администратора, часов */
  sessionTtlHours: Number(process.env.SESSION_TTL_HOURS || 12),
  /** Сессия завершается после бездействия, минут */
  sessionIdleMinutes: Number(process.env.SESSION_IDLE_MINUTES || 120),
  /** Cookie только по HTTPS (в production — обязательно) */
  cookieSecure: bool(process.env.COOKIE_SECURE, isProd),
  /** За reverse-proxy (nginx) — чтобы корректно определять IP для ограничения попыток входа */
  trustProxy: bool(process.env.TRUST_PROXY, false),
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 10),
  loginMaxAttempts: Number(process.env.LOGIN_MAX_ATTEMPTS || 5),
  loginWindowMinutes: Number(process.env.LOGIN_WINDOW_MINUTES || 15),
};
