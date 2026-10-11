import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import type { DB } from "../db";
import { config } from "../config";
import { HttpError } from "../http";

/**
 * Сессии администратора.
 * - Токен (32 случайных байта) хранится только в HttpOnly-cookie; в БД — его SHA-256.
 * - CSRF: каждой сессии выдаётся отдельный токен, который клиент отправляет
 *   в заголовке X-CSRF-Token при любом изменяющем запросе.
 * - Cookie: HttpOnly, SameSite=Strict, Secure (в production), префикс __Host-.
 */

export const COOKIE_NAME = config.cookieSecure ? "__Host-cr_admin" : "cr_admin";

export interface AdminSession {
  id: string;
  adminId: number;
  email: string;
  name: string;
  csrfToken: string;
}

declare module "express-serve-static-core" {
  interface Request {
    admin?: AdminSession;
  }
}

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    try {
      out[k] = decodeURIComponent(v);
    } catch {
      out[k] = v;
    }
  }
  return out;
}

function cookieAttrs(maxAgeSec: number) {
  const attrs = [`Path=/`, `HttpOnly`, `SameSite=Strict`, `Max-Age=${maxAgeSec}`];
  if (config.cookieSecure) attrs.push("Secure");
  return attrs.join("; ");
}

export function createSession(db: DB, adminId: number, req: Request, res: Response) {
  const token = crypto.randomBytes(32).toString("base64url");
  const csrf = crypto.randomBytes(32).toString("base64url");
  const now = Date.now();
  const ttlMs = config.sessionTtlHours * 3600_000;
  db.prepare("INSERT INTO sessions (id, admin_id, csrf_token, created_at, expires_at, last_seen_at, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
    sha256(token),
    adminId,
    csrf,
    now,
    now + ttlMs,
    now,
    req.ip ?? null,
    String(req.headers["user-agent"] ?? "").slice(0, 300),
  );
  // удаляем просроченные сессии
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(now);
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${token}; ${cookieAttrs(Math.floor(ttlMs / 1000))}`);
  return csrf;
}

export function destroySession(db: DB, req: Request, res: Response) {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (token) db.prepare("DELETE FROM sessions WHERE id = ?").run(sha256(token));
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; ${cookieAttrs(0)}`);
}

export function destroyAllSessions(db: DB, adminId: number, exceptSessionId?: string) {
  if (exceptSessionId) db.prepare("DELETE FROM sessions WHERE admin_id = ? AND id != ?").run(adminId, exceptSessionId);
  else db.prepare("DELETE FROM sessions WHERE admin_id = ?").run(adminId);
}

/** Загружает сессию из cookie (если она действительна) в req.admin */
export function loadSession(db: DB) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
    if (token) {
      const id = sha256(token);
      const row = db
        .prepare(
          "SELECT s.id, s.admin_id, s.csrf_token, s.expires_at, s.last_seen_at, a.email, a.name FROM sessions s JOIN admins a ON a.id = s.admin_id WHERE s.id = ?",
        )
        .get(id) as { id: string; admin_id: number; csrf_token: string; expires_at: number; last_seen_at: number; email: string; name: string } | undefined;
      const now = Date.now();
      const idleMs = config.sessionIdleMinutes * 60_000;
      if (row && row.expires_at > now && now - row.last_seen_at < idleMs) {
        if (now - row.last_seen_at > 60_000) db.prepare("UPDATE sessions SET last_seen_at = ? WHERE id = ?").run(now, id);
        req.admin = { id: row.id, adminId: row.admin_id, email: row.email, name: row.name, csrfToken: row.csrf_token };
      } else if (row) {
        db.prepare("DELETE FROM sessions WHERE id = ?").run(id);
        res.setHeader("Set-Cookie", `${COOKIE_NAME}=; ${cookieAttrs(0)}`);
      }
    }
    next();
  };
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Проверка источника запроса: изменяющие запросы принимаются только со своего сайта */
export function checkOrigin(req: Request) {
  if (SAFE_METHODS.has(req.method)) return;
  const origin = req.headers.origin;
  if (!origin) {
    const fetchSite = req.headers["sec-fetch-site"];
    if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") throw new HttpError(403, "Запрос с чужого сайта отклонён");
    return;
  }
  const host = req.headers["x-forwarded-host"] && config.trustProxy ? String(req.headers["x-forwarded-host"]) : req.headers.host;
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    /* empty */
  }
  if (originHost !== host && origin !== config.publicUrl) throw new HttpError(403, "Запрос с чужого сайта отклонён");
}

/** Требует авторизации; для изменяющих запросов — ещё и корректный CSRF-токен */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.admin) return next(new HttpError(401, "Требуется вход в систему"));
  checkOrigin(req);
  if (!SAFE_METHODS.has(req.method)) {
    const header = String(req.headers["x-csrf-token"] ?? "");
    const expected = req.admin.csrfToken;
    const ok = header.length === expected.length && crypto.timingSafeEqual(Buffer.from(header), Buffer.from(expected));
    if (!ok) return next(new HttpError(403, "Недействительный CSRF-токен. Обновите страницу."));
  }
  next();
}
