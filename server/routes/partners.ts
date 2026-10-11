import { Router } from "express";
import { z } from "zod";
import type { DB } from "../db";
import { idParam, notFound } from "../http";
import { getMediaRef } from "../services/media";
import { assertMediaExists, zHref, zMediaId, zRequiredText, zText } from "../validation";
import { nextSortOrder, reorder } from "./reorder";

const partnerSchema = z.object({
  name: zRequiredText(200, "Название"),
  url: zHref("Сайт партнера").optional().default(""),
  description: zText(1000, "Описание").optional().default(""),
  logoId: zMediaId,
  visible: z.boolean().optional().default(true),
});

interface PartnerRow {
  id: number;
  name: string;
  url: string;
  description: string;
  logo_id: number | null;
  visible: number;
  sort_order: number;
  updated_at: string;
}

const toDto = (db: DB, r: PartnerRow) => ({
  id: r.id,
  name: r.name,
  url: r.url,
  description: r.description,
  logoId: r.logo_id,
  logo: getMediaRef(db, r.logo_id),
  visible: !!r.visible,
  sortOrder: r.sort_order,
  updatedAt: r.updated_at,
});

export function partnerRoutes(db: DB) {
  const r = Router();
  const get = (id: number) => db.prepare("SELECT * FROM partners WHERE id = ?").get(id) as PartnerRow | undefined;

  r.get("/", (_req, res) => {
    res.json((db.prepare("SELECT * FROM partners ORDER BY sort_order, id").all() as PartnerRow[]).map((p) => toDto(db, p)));
  });
  r.get("/:id", (req, res) => {
    const row = get(idParam(req));
    if (!row) throw notFound("Партнер");
    res.json(toDto(db, row));
  });
  r.post("/", (req, res) => {
    const d = partnerSchema.parse(req.body);
    assertMediaExists(db, d.logoId);
    const info = db
      .prepare("INSERT INTO partners (name, url, description, logo_id, visible, sort_order) VALUES (?, ?, ?, ?, ?, ?)")
      .run(d.name, d.url, d.description, d.logoId, d.visible ? 1 : 0, nextSortOrder(db, "partners"));
    res.status(201).json(toDto(db, get(Number(info.lastInsertRowid))!));
  });
  r.put("/:id", (req, res) => {
    const id = idParam(req);
    if (!get(id)) throw notFound("Партнер");
    const d = partnerSchema.parse(req.body);
    assertMediaExists(db, d.logoId);
    db.prepare("UPDATE partners SET name = ?, url = ?, description = ?, logo_id = ?, visible = ?, updated_at = ? WHERE id = ?").run(
      d.name,
      d.url,
      d.description,
      d.logoId,
      d.visible ? 1 : 0,
      new Date().toISOString(),
      id,
    );
    res.json(toDto(db, get(id)!));
  });
  r.patch("/:id/visibility", (req, res) => {
    const id = idParam(req);
    if (!get(id)) throw notFound("Партнер");
    const { visible } = z.object({ visible: z.boolean() }).parse(req.body);
    db.prepare("UPDATE partners SET visible = ?, updated_at = ? WHERE id = ?").run(visible ? 1 : 0, new Date().toISOString(), id);
    res.json(toDto(db, get(id)!));
  });
  r.post("/reorder", (req, res) => {
    reorder(db, "partners", req.body);
    res.json({ ok: true });
  });
  r.delete("/:id", (req, res) => {
    const info = db.prepare("DELETE FROM partners WHERE id = ?").run(idParam(req));
    if (!info.changes) throw notFound("Партнер");
    res.status(204).end();
  });
  return r;
}
