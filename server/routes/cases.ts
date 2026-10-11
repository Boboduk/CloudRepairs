import { Router } from "express";
import { z } from "zod";
import type { DB } from "../db";
import { HttpError, idParam, notFound } from "../http";
import { sanitizeRich } from "../services/sanitize";
import { slugify, uniqueSlug } from "../services/slug";
import { getMediaRef } from "../services/media";
import { assertMediaExists, zHref, zMediaId, zRequiredText, zSeo, zSlug, zStatus, zText } from "../validation";
import { nextSortOrder, reorder } from "./reorder";

const caseSchema = z.object({
  title: zRequiredText(300, "Название"),
  slug: zSlug,
  client: zText(200, "Клиент").optional().default(""),
  partnerId: z.number().int().positive().nullable().optional().default(null),
  excerpt: zText(1000, "Краткое описание").optional().default(""),
  body: z.string().max(500_000, "Текст слишком длинный").optional().default(""),
  coverId: zMediaId,
  imageIds: z.array(z.number().int().positive()).max(40, "Не более 40 изображений").optional().default([]),
  links: z
    .array(z.object({ label: zRequiredText(200, "Текст ссылки"), href: zHref("Ссылка").refine((s) => s.length > 0, "Ссылка: обязательное поле") }))
    .max(20)
    .optional()
    .default([]),
  status: zStatus.default("draft"),
  ...zSeo,
});

interface CaseRow {
  id: number;
  title: string;
  slug: string;
  client: string;
  partner_id: number | null;
  excerpt: string;
  body: string;
  cover_id: number | null;
  links: string;
  status: "draft" | "published";
  sort_order: number;
  seo_title: string;
  seo_description: string;
  updated_at: string;
}

function toDto(db: DB, r: CaseRow) {
  const imageIds = (db.prepare("SELECT media_id FROM case_images WHERE case_id = ? ORDER BY sort_order").all(r.id) as { media_id: number }[]).map((x) => x.media_id);
  let links: unknown = [];
  try {
    links = JSON.parse(r.links);
  } catch {
    /* empty */
  }
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    client: r.client,
    partnerId: r.partner_id,
    excerpt: r.excerpt,
    body: r.body,
    coverId: r.cover_id,
    cover: getMediaRef(db, r.cover_id),
    imageIds,
    images: imageIds.map((id) => getMediaRef(db, id)).filter(Boolean),
    links,
    status: r.status,
    sortOrder: r.sort_order,
    seoTitle: r.seo_title,
    seoDescription: r.seo_description,
    updatedAt: r.updated_at,
  };
}

export function caseRoutes(db: DB) {
  const r = Router();
  const get = (id: number) => db.prepare("SELECT * FROM cases WHERE id = ?").get(id) as CaseRow | undefined;

  const saveImages = (caseId: number, ids: number[]) => {
    db.prepare("DELETE FROM case_images WHERE case_id = ?").run(caseId);
    const ins = db.prepare("INSERT INTO case_images (case_id, media_id, sort_order) VALUES (?, ?, ?)");
    Array.from(new Set(ids)).forEach((mid, i) => ins.run(caseId, mid, i));
  };
  const check = (d: z.infer<typeof caseSchema>) => {
    assertMediaExists(db, d.coverId, ...d.imageIds);
    if (d.partnerId && !db.prepare("SELECT 1 FROM partners WHERE id = ?").get(d.partnerId)) throw new HttpError(400, "Выбранный партнер не найден");
  };

  r.get("/", (_req, res) => {
    res.json((db.prepare("SELECT * FROM cases ORDER BY sort_order, id").all() as CaseRow[]).map((c) => ({ ...toDto(db, c), body: undefined })));
  });
  r.get("/:id", (req, res) => {
    const row = get(idParam(req));
    if (!row) throw notFound("Кейс");
    res.json(toDto(db, row));
  });
  r.post("/", (req, res) => {
    const d = caseSchema.parse(req.body);
    check(d);
    const id = db.transaction(() => {
      const info = db
        .prepare(
          "INSERT INTO cases (title, slug, client, partner_id, excerpt, body, cover_id, links, status, sort_order, seo_title, seo_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .run(
          d.title,
          uniqueSlug(db, "cases", d.slug || slugify(d.title)),
          d.client,
          d.partnerId,
          d.excerpt,
          sanitizeRich(d.body),
          d.coverId,
          JSON.stringify(d.links),
          d.status,
          nextSortOrder(db, "cases"),
          d.seoTitle,
          d.seoDescription,
        );
      const newId = Number(info.lastInsertRowid);
      saveImages(newId, d.imageIds);
      return newId;
    })();
    res.status(201).json(toDto(db, get(id)!));
  });
  r.put("/:id", (req, res) => {
    const id = idParam(req);
    if (!get(id)) throw notFound("Кейс");
    const d = caseSchema.parse(req.body);
    check(d);
    db.transaction(() => {
      db.prepare(
        "UPDATE cases SET title = ?, slug = ?, client = ?, partner_id = ?, excerpt = ?, body = ?, cover_id = ?, links = ?, status = ?, seo_title = ?, seo_description = ?, updated_at = ? WHERE id = ?",
      ).run(
        d.title,
        uniqueSlug(db, "cases", d.slug || slugify(d.title), id),
        d.client,
        d.partnerId,
        d.excerpt,
        sanitizeRich(d.body),
        d.coverId,
        JSON.stringify(d.links),
        d.status,
        d.seoTitle,
        d.seoDescription,
        new Date().toISOString(),
        id,
      );
      saveImages(id, d.imageIds);
    })();
    res.json(toDto(db, get(id)!));
  });
  r.patch("/:id/status", (req, res) => {
    const id = idParam(req);
    if (!get(id)) throw notFound("Кейс");
    const { status } = z.object({ status: zStatus }).parse(req.body);
    db.prepare("UPDATE cases SET status = ?, updated_at = ? WHERE id = ?").run(status, new Date().toISOString(), id);
    res.json(toDto(db, get(id)!));
  });
  r.post("/reorder", (req, res) => {
    reorder(db, "cases", req.body);
    res.json({ ok: true });
  });
  r.delete("/:id", (req, res) => {
    const info = db.prepare("DELETE FROM cases WHERE id = ?").run(idParam(req));
    if (!info.changes) throw notFound("Кейс");
    res.status(204).end();
  });
  return r;
}
