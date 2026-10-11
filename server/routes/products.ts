import { Router } from "express";
import { z } from "zod";
import type { DB } from "../db";
import { idParam, notFound } from "../http";
import { sanitizeRich } from "../services/sanitize";
import { slugify, uniqueSlug } from "../services/slug";
import { getMediaRef } from "../services/media";
import { assertMediaExists, zHref, zMediaId, zRequiredText, zSeo, zSlug, zStatus, zText } from "../validation";
import { nextSortOrder, reorder } from "./reorder";

const productSchema = z.object({
  title: zRequiredText(200, "Название"),
  slug: zSlug,
  excerpt: zText(1000, "Краткое описание").optional().default(""),
  body: z.string().max(500_000, "Текст слишком длинный").optional().default(""),
  imageId: zMediaId,
  linkUrl: zHref("Ссылка карточки").optional().default(""),
  linkLabel: zText(100, "Текст ссылки").optional().default(""),
  status: zStatus.default("draft"),
  ...zSeo,
});

interface ProductRow {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  image_id: number | null;
  link_url: string;
  link_label: string;
  status: "draft" | "published";
  sort_order: number;
  seo_title: string;
  seo_description: string;
  updated_at: string;
}

const toDto = (db: DB, r: ProductRow) => ({
  id: r.id,
  title: r.title,
  slug: r.slug,
  excerpt: r.excerpt,
  body: r.body,
  imageId: r.image_id,
  image: getMediaRef(db, r.image_id),
  linkUrl: r.link_url,
  linkLabel: r.link_label,
  status: r.status,
  sortOrder: r.sort_order,
  seoTitle: r.seo_title,
  seoDescription: r.seo_description,
  updatedAt: r.updated_at,
});

export function productRoutes(db: DB) {
  const r = Router();
  const get = (id: number) => db.prepare("SELECT * FROM products WHERE id = ?").get(id) as ProductRow | undefined;

  r.get("/", (_req, res) => {
    res.json((db.prepare("SELECT * FROM products ORDER BY sort_order, id").all() as ProductRow[]).map((p) => ({ ...toDto(db, p), body: undefined })));
  });
  r.get("/:id", (req, res) => {
    const row = get(idParam(req));
    if (!row) throw notFound("Продукт");
    res.json(toDto(db, row));
  });
  r.post("/", (req, res) => {
    const d = productSchema.parse(req.body);
    assertMediaExists(db, d.imageId);
    const info = db
      .prepare(
        "INSERT INTO products (title, slug, excerpt, body, image_id, link_url, link_label, status, sort_order, seo_title, seo_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        d.title,
        uniqueSlug(db, "products", d.slug || slugify(d.title)),
        d.excerpt,
        sanitizeRich(d.body),
        d.imageId,
        d.linkUrl,
        d.linkLabel,
        d.status,
        nextSortOrder(db, "products"),
        d.seoTitle,
        d.seoDescription,
      );
    res.status(201).json(toDto(db, get(Number(info.lastInsertRowid))!));
  });
  r.put("/:id", (req, res) => {
    const id = idParam(req);
    if (!get(id)) throw notFound("Продукт");
    const d = productSchema.parse(req.body);
    assertMediaExists(db, d.imageId);
    db.prepare(
      "UPDATE products SET title = ?, slug = ?, excerpt = ?, body = ?, image_id = ?, link_url = ?, link_label = ?, status = ?, seo_title = ?, seo_description = ?, updated_at = ? WHERE id = ?",
    ).run(
      d.title,
      uniqueSlug(db, "products", d.slug || slugify(d.title), id),
      d.excerpt,
      sanitizeRich(d.body),
      d.imageId,
      d.linkUrl,
      d.linkLabel,
      d.status,
      d.seoTitle,
      d.seoDescription,
      new Date().toISOString(),
      id,
    );
    res.json(toDto(db, get(id)!));
  });
  r.patch("/:id/status", (req, res) => {
    const id = idParam(req);
    if (!get(id)) throw notFound("Продукт");
    const { status } = z.object({ status: zStatus }).parse(req.body);
    db.prepare("UPDATE products SET status = ?, updated_at = ? WHERE id = ?").run(status, new Date().toISOString(), id);
    res.json(toDto(db, get(id)!));
  });
  r.post("/reorder", (req, res) => {
    reorder(db, "products", req.body);
    res.json({ ok: true });
  });
  r.delete("/:id", (req, res) => {
    const info = db.prepare("DELETE FROM products WHERE id = ?").run(idParam(req));
    if (!info.changes) throw notFound("Продукт");
    res.status(204).end();
  });
  return r;
}
