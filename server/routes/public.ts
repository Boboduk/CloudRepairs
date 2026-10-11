import { Router } from "express";
import type { DB } from "../db";
import { HttpError } from "../http";
import { SLUG_RE } from "../services/slug";
import { getPublishedCase, getPublishedNews, getPublishedProduct, getSiteData } from "../services/content";

/** Публичное API (только чтение опубликованных данных) — для навигации без перезагрузки */
export function publicRoutes(db: DB) {
  const r = Router();
  r.use((_req, res, next) => {
    res.setHeader("Cache-Control", "no-cache");
    next();
  });
  r.get("/site", (_req, res) => res.json(getSiteData(db)));
  const detail = (getter: (db: DB, slug: string) => unknown) => (req: { params: { slug: string } }, res: { json: (v: unknown) => void }) => {
    const slug = String(req.params.slug);
    if (!SLUG_RE.test(slug)) throw new HttpError(404, "Не найдено");
    const item = getter(db, slug);
    if (!item) throw new HttpError(404, "Не найдено");
    res.json(item);
  };
  r.get("/news/:slug", detail(getPublishedNews));
  r.get("/cases/:slug", detail(getPublishedCase));
  r.get("/products/:slug", detail(getPublishedProduct));
  return r;
}
