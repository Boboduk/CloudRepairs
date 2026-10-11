import { Router } from "express";
import { z } from "zod";
import type { DB } from "../db";
import { idParam, notFound } from "../http";
import { sanitizeRich } from "../services/sanitize";
import { slugify, uniqueSlug } from "../services/slug";
import { getMediaRef } from "../services/media";
import { assertMediaExists, zDate, zMediaId, zRequiredText, zSeo, zSlug, zStatus, zText } from "../validation";

const newsSchema = z.object({
  title: zRequiredText(300, "Заголовок"),
  slug: zSlug,
  excerpt: zText(1000, "Краткое описание").optional().default(""),
  body: z.string().max(500_000, "Текст слишком длинный").optional().default(""),
  coverId: zMediaId,
  publishedAt: zDate,
  status: zStatus.default("draft"),
  ...zSeo,
});

interface NewsRow {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_id: number | null;
  published_at: string | null;
  status: "draft" | "published";
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
}

const toDto = (db: DB, r: NewsRow) => ({
  id: r.id,
  title: r.title,
  slug: r.slug,
  excerpt: r.excerpt,
  body: r.body,
  coverId: r.cover_id,
  cover: getMediaRef(db, r.cover_id),
  publishedAt: r.published_at,
  status: r.status,
  seoTitle: r.seo_title,
  seoDescription: r.seo_description,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export function newsRoutes(db: DB) {
  const r = Router();
  const get = (id: number) => db.prepare("SELECT * FROM news WHERE id = ?").get(id) as NewsRow | undefined;

  r.get("/", (req, res) => {
    const q = String(req.query.q ?? "").trim().slice(0, 200);
    const sort = req.query.sort === "date_asc" ? "ASC" : "DESC";
    const status = req.query.status === "draft" || req.query.status === "published" ? String(req.query.status) : null;
    const where: string[] = [];
    const params: unknown[] = [];
    if (q) {
      where.push("title LIKE ? ESCAPE '\\'");
      params.push(`%${q.replace(/[\\%_]/g, (m) => "\\" + m)}%`);
    }
    if (status) {
      where.push("status = ?");
      params.push(status);
    }
    const rows = db
      .prepare(`SELECT * FROM news ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY COALESCE(published_at, created_at) ${sort}, id ${sort}`)
      .all(...params) as NewsRow[];
    res.json(rows.map((row) => ({ ...toDto(db, row), body: undefined })));
  });

  r.get("/:id", (req, res) => {
    const row = get(idParam(req));
    if (!row) throw notFound("Новость");
    res.json(toDto(db, row));
  });

  r.post("/", (req, res) => {
    const d = newsSchema.parse(req.body);
    assertMediaExists(db, d.coverId);
    const slug = uniqueSlug(db, "news", d.slug || slugify(d.title));
    const publishedAt = d.status === "published" && !d.publishedAt ? new Date().toISOString() : d.publishedAt;
    const info = db
      .prepare("INSERT INTO news (title, slug, excerpt, body, cover_id, published_at, status, seo_title, seo_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(d.title, slug, d.excerpt, sanitizeRich(d.body), d.coverId, publishedAt, d.status, d.seoTitle, d.seoDescription);
    res.status(201).json(toDto(db, get(Number(info.lastInsertRowid))!));
  });

  r.put("/:id", (req, res) => {
    const id = idParam(req);
    const row = get(id);
    if (!row) throw notFound("Новость");
    const d = newsSchema.parse(req.body);
    assertMediaExists(db, d.coverId);
    const slug = uniqueSlug(db, "news", d.slug || slugify(d.title), id);
    const publishedAt = d.status === "published" && !d.publishedAt ? new Date().toISOString() : d.publishedAt;
    db.prepare(
      "UPDATE news SET title = ?, slug = ?, excerpt = ?, body = ?, cover_id = ?, published_at = ?, status = ?, seo_title = ?, seo_description = ?, updated_at = ? WHERE id = ?",
    ).run(d.title, slug, d.excerpt, sanitizeRich(d.body), d.coverId, publishedAt, d.status, d.seoTitle, d.seoDescription, new Date().toISOString(), id);
    res.json(toDto(db, get(id)!));
  });

  r.patch("/:id/status", (req, res) => {
    const id = idParam(req);
    const row = get(id);
    if (!row) throw notFound("Новость");
    const { status } = z.object({ status: zStatus }).parse(req.body);
    const publishedAt = status === "published" && !row.published_at ? new Date().toISOString() : row.published_at;
    db.prepare("UPDATE news SET status = ?, published_at = ?, updated_at = ? WHERE id = ?").run(status, publishedAt, new Date().toISOString(), id);
    res.json(toDto(db, get(id)!));
  });

  r.delete("/:id", (req, res) => {
    const info = db.prepare("DELETE FROM news WHERE id = ?").run(idParam(req));
    if (!info.changes) throw notFound("Новость");
    res.status(204).end();
  });

  return r;
}
