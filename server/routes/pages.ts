import { Router } from "express";
import { z } from "zod";
import type { DB } from "../db";
import { HttpError } from "../http";
import { PAGE_KEYS, PAGE_SCHEMAS, type PageKey } from "../../shared/schema";
import { validatePageContent } from "../../shared/validatePage";
import { sanitizeRich } from "../services/sanitize";
import { getPage } from "../services/content";
import { zSeo } from "../validation";

const pageKey = (k: string): PageKey => {
  if (!(PAGE_KEYS as string[]).includes(k)) throw new HttpError(404, "Страница не найдена");
  return k as PageKey;
};

export function pageRoutes(db: DB) {
  const r = Router();

  r.get("/", (_req, res) => {
    res.json(
      PAGE_KEYS.map((key) => {
        const p = getPage(db, key);
        return { key, label: PAGE_SCHEMAS[key].label, path: PAGE_SCHEMAS[key].path, updatedAt: p.updatedAt };
      }),
    );
  });

  r.get("/:key", (req, res) => {
    const key = pageKey(req.params.key);
    res.json({ schema: PAGE_SCHEMAS[key], ...getPage(db, key) });
  });

  const bodySchema = z.object({ sections: z.record(z.unknown()), order: z.array(z.string()).optional(), ...zSeo });

  r.put("/:key", (req, res) => {
    const key = pageKey(req.params.key);
    const body = bodySchema.parse(req.body);
    const { sections, order, issues } = validatePageContent(PAGE_SCHEMAS[key], body, sanitizeRich);
    if (issues.length) throw new HttpError(400, "Проверьте заполнение полей", issues);
    db.prepare(
      "INSERT INTO pages (key, content, section_order, seo_title, seo_description, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET content = excluded.content, section_order = excluded.section_order, seo_title = excluded.seo_title, seo_description = excluded.seo_description, updated_at = excluded.updated_at",
    ).run(key, JSON.stringify(sections), JSON.stringify(order), body.seoTitle, body.seoDescription, new Date().toISOString());
    res.json({ schema: PAGE_SCHEMAS[key], ...getPage(db, key) });
  });

  return r;
}
