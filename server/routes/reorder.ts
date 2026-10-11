import { z } from "zod";
import type { DB } from "../db";
import { HttpError } from "../http";

/** Сохранение порядка отображения: принимает полный список id в нужном порядке */
export function reorder(db: DB, table: "partners" | "cases" | "products", body: unknown) {
  const { ids } = z.object({ ids: z.array(z.number().int().positive()).max(1000) }).parse(body);
  const existing = (db.prepare(`SELECT id FROM ${table}`).all() as { id: number }[]).map((r) => r.id);
  if (ids.length !== existing.length || !existing.every((id) => ids.includes(id))) {
    throw new HttpError(409, "Список устарел — обновите страницу и повторите");
  }
  const upd = db.prepare(`UPDATE ${table} SET sort_order = ? WHERE id = ?`);
  db.transaction(() => ids.forEach((id, i) => upd.run(i, id)))();
}

export function nextSortOrder(db: DB, table: "partners" | "cases" | "products") {
  return ((db.prepare(`SELECT MAX(sort_order) AS m FROM ${table}`).get() as { m: number | null }).m ?? -1) + 1;
}
