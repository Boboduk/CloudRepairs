import { Router } from "express";
import { z } from "zod";
import type { DB } from "../db";
import { HttpError } from "../http";
import { getDummyHash, hashPassword, validatePasswordStrength, verifyPassword } from "../auth/password";
import { checkLoginAllowed, registerLoginFailure, resetLoginFailures } from "../auth/rateLimit";
import { checkOrigin, createSession, destroyAllSessions, destroySession, requireAdmin } from "../auth/session";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(200),
  password: z.string().max(200),
});

export function authRoutes(db: DB) {
  const r = Router();

  r.post("/login", async (req, res) => {
    checkOrigin(req);
    const { email, password } = loginSchema.parse(req.body);
    const keys = [`ip:${req.ip}`, `user:${email}`];
    const gate = checkLoginAllowed(db, keys);
    if (!gate.allowed) {
      res.setHeader("Retry-After", String(gate.retryAfterSec));
      throw new HttpError(429, `Слишком много попыток входа. Повторите через ${Math.ceil(gate.retryAfterSec / 60)} мин.`);
    }
    const admin = db.prepare("SELECT id, email, name, password_hash FROM admins WHERE email = ?").get(email) as
      | { id: number; email: string; name: string; password_hash: string }
      | undefined;
    // проверяем хеш даже для несуществующего пользователя, чтобы время ответа не выдавало логины
    const ok = await verifyPassword(password, admin?.password_hash ?? (await getDummyHash()));
    if (!admin || !ok) {
      registerLoginFailure(db, keys);
      throw new HttpError(401, "Неверный e-mail или пароль");
    }
    resetLoginFailures(db, `user:${email}`);
    db.prepare("UPDATE admins SET last_login_at = ? WHERE id = ?").run(new Date().toISOString(), admin.id);
    const csrfToken = createSession(db, admin.id, req, res);
    res.json({ admin: { email: admin.email, name: admin.name }, csrfToken });
  });

  r.get("/session", (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    if (!req.admin) throw new HttpError(401, "Требуется вход в систему");
    res.json({ admin: { email: req.admin.email, name: req.admin.name }, csrfToken: req.admin.csrfToken });
  });

  r.post("/logout", (req, res) => {
    checkOrigin(req);
    destroySession(db, req, res);
    res.json({ ok: true });
  });

  const pwSchema = z.object({ currentPassword: z.string().max(200), newPassword: z.string().max(200) });
  r.post("/password", requireAdmin, async (req, res) => {
    const { currentPassword, newPassword } = pwSchema.parse(req.body);
    const admin = db.prepare("SELECT password_hash FROM admins WHERE id = ?").get(req.admin!.adminId) as { password_hash: string };
    if (!(await verifyPassword(currentPassword, admin.password_hash))) throw new HttpError(400, "Текущий пароль указан неверно");
    const weak = validatePasswordStrength(newPassword);
    if (weak) throw new HttpError(400, weak);
    db.prepare("UPDATE admins SET password_hash = ?, updated_at = ? WHERE id = ?").run(await hashPassword(newPassword), new Date().toISOString(), req.admin!.adminId);
    // завершаем все другие сессии этого администратора
    destroyAllSessions(db, req.admin!.adminId, req.admin!.id);
    res.json({ ok: true });
  });

  return r;
}
