import type { DB } from "../db";
import { config } from "../config";

/**
 * Ограничение попыток входа. Счётчики хранятся в БД (переживают перезапуск),
 * отдельно по IP и по логину. После N неудачных попыток в окне — блокировка до конца окна.
 */
export function checkLoginAllowed(db: DB, keys: string[]): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  let retry = 0;
  for (const key of keys) {
    const row = db.prepare("SELECT locked_until FROM login_attempts WHERE key = ?").get(key) as { locked_until: number | null } | undefined;
    if (row?.locked_until && row.locked_until > now) retry = Math.max(retry, Math.ceil((row.locked_until - now) / 1000));
  }
  return { allowed: retry === 0, retryAfterSec: retry };
}

export function registerLoginFailure(db: DB, keys: string[]) {
  const now = Date.now();
  const windowMs = config.loginWindowMinutes * 60_000;
  for (const key of keys) {
    const row = db.prepare("SELECT failures, window_start FROM login_attempts WHERE key = ?").get(key) as { failures: number; window_start: number } | undefined;
    let failures = 1;
    let windowStart = now;
    if (row && now - row.window_start < windowMs) {
      failures = row.failures + 1;
      windowStart = row.window_start;
    }
    // IP-адрес может принадлежать нескольким сотрудникам — для него порог выше
    const limit = key.startsWith("ip:") ? config.loginMaxAttempts * 4 : config.loginMaxAttempts;
    const lockedUntil = failures >= limit ? windowStart + windowMs : null;
    db.prepare(
      "INSERT INTO login_attempts (key, failures, window_start, locked_until) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET failures = excluded.failures, window_start = excluded.window_start, locked_until = excluded.locked_until",
    ).run(key, failures, windowStart, lockedUntil);
  }
}

export function resetLoginFailures(db: DB, key: string) {
  db.prepare("DELETE FROM login_attempts WHERE key = ?").run(key);
}
