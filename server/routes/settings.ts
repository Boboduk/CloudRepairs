import { Router } from "express";
import { z } from "zod";
import type { DB } from "../db";
import { getSettings } from "../services/content";
import { zText } from "../validation";

const tg = z
  .string()
  .trim()
  .transform((s) => s.replace(/^@/, "").replace(/^https?:\/\/t\.me\//, ""))
  .refine((s) => s === "" || /^[A-Za-z0-9_]{3,64}$/.test(s), "Телеграм: имя пользователя из латиницы, цифр и _");

const settingsSchema = z.object({
  email: z.string().trim().email("Укажите корректный e-mail").max(200),
  phone: zText(50, "Телефон").refine((s) => s === "" || /^[\d\s()+-]+$/.test(s), "Телефон: только цифры, пробелы, скобки, + и -"),
  phoneNote: zText(200, "Подпись к телефону"),
  telegramMain: tg,
  telegramPersonal: tg,
  footerTitle: zText(300, "Заголовок в подвале"),
  footerButton: zText(60, "Кнопка в подвале"),
  copyright: zText(100, "Копирайт"),
  headerCta: zText(40, "Кнопка в шапке"),
});

export function settingsRoutes(db: DB) {
  const r = Router();
  r.get("/", (_req, res) => res.json(getSettings(db)));
  r.put("/", (req, res) => {
    const d = settingsSchema.parse(req.body);
    db.prepare("INSERT INTO settings (key, value) VALUES ('site', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(JSON.stringify(d));
    res.json(getSettings(db));
  });
  return r;
}

export function statsRoute(db: DB) {
  return (_req: unknown, res: { json: (v: unknown) => void }) => {
    const n = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
    res.json({
      newsPublished: n("SELECT COUNT(*) AS n FROM news WHERE status = 'published'"),
      newsDrafts: n("SELECT COUNT(*) AS n FROM news WHERE status = 'draft'"),
      partners: n("SELECT COUNT(*) AS n FROM partners"),
      partnersVisible: n("SELECT COUNT(*) AS n FROM partners WHERE visible = 1"),
      cases: n("SELECT COUNT(*) AS n FROM cases"),
      casesPublished: n("SELECT COUNT(*) AS n FROM cases WHERE status = 'published'"),
      products: n("SELECT COUNT(*) AS n FROM products"),
      productsPublished: n("SELECT COUNT(*) AS n FROM products WHERE status = 'published'"),
      media: n("SELECT COUNT(*) AS n FROM media"),
      recentNews: db.prepare("SELECT id, title, status, updated_at AS updatedAt FROM news ORDER BY updated_at DESC LIMIT 5").all(),
    });
  };
}
