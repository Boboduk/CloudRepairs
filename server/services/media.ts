import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type { DB } from "../db";
import { config } from "../config";
import { HttpError } from "../http";
import type { MediaRef } from "../../shared/types";

export interface MediaRow {
  id: number;
  filename: string;
  original_name: string;
  mime: string;
  width: number | null;
  height: number | null;
  size: number;
  alt: string;
  created_at: string;
  updated_at: string;
}

const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "gif", "avif"]);

export const mediaUrl = (filename: string) => `/uploads/${filename}`;

export function toMediaRef(row: Pick<MediaRow, "id" | "filename" | "alt" | "width" | "height"> | null | undefined): MediaRef | null {
  if (!row) return null;
  return { id: row.id, url: mediaUrl(row.filename), alt: row.alt, width: row.width, height: row.height };
}

export function getMediaRef(db: DB, id: number | null | undefined): MediaRef | null {
  if (!id) return null;
  return toMediaRef(db.prepare("SELECT id, filename, alt, width, height FROM media WHERE id = ?").get(id) as MediaRow | undefined);
}

/**
 * Проверка и оптимизация изображения. Файл декодируется библиотекой sharp —
 * если это не настоящее изображение (например, исполняемый файл с расширением .jpg),
 * он будет отклонён. Результат перекодируется в WebP: это удаляет метаданные и любые
 * «вложенные» данные, уменьшает размер и ограничивает разрешение 2400 px.
 */
export async function processImage(buffer: Buffer): Promise<{ data: Buffer; width: number; height: number }> {
  let meta: sharp.Metadata;
  try {
    meta = await sharp(buffer, { failOn: "error", limitInputPixels: 50_000_000 }).metadata();
  } catch {
    throw new HttpError(415, "Файл не является изображением или повреждён");
  }
  if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) {
    throw new HttpError(415, "Допустимые форматы: JPG, PNG, WebP, GIF, AVIF");
  }
  const lossless = meta.format === "png" && (meta.width ?? 0) * (meta.height ?? 0) < 400_000;
  const { data, info } = await sharp(buffer, { failOn: "error", limitInputPixels: 50_000_000 })
    .rotate()
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .webp(lossless ? { quality: 92, nearLossless: true } : { quality: 82, effort: 4 })
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function safeOriginalName(name: string) {
  return path.basename(name).replace(/[^\p{L}\p{N}._ -]+/gu, "_").slice(0, 150) || "image";
}

export async function saveUpload(db: DB, buffer: Buffer, originalName: string, alt = ""): Promise<MediaRow> {
  const { data, width, height } = await processImage(buffer);
  fs.mkdirSync(config.uploadsDir, { recursive: true });
  const filename = `${crypto.randomUUID()}.webp`;
  fs.writeFileSync(path.join(config.uploadsDir, filename), data, { flag: "wx" });
  const info = db
    .prepare("INSERT INTO media (filename, original_name, mime, width, height, size, alt) VALUES (?, ?, 'image/webp', ?, ?, ?, ?)")
    .run(filename, safeOriginalName(originalName), width, height, data.length, alt);
  return db.prepare("SELECT * FROM media WHERE id = ?").get(info.lastInsertRowid) as MediaRow;
}

/** Замена файла с сохранением адреса: все места, где используется изображение, обновятся сами */
export async function replaceUpload(db: DB, id: number, buffer: Buffer, originalName: string): Promise<MediaRow> {
  const row = db.prepare("SELECT * FROM media WHERE id = ?").get(id) as MediaRow | undefined;
  if (!row) throw new HttpError(404, "Файл не найден");
  const { data, width, height } = await processImage(buffer);
  const target = path.join(config.uploadsDir, row.filename);
  const tmp = `${target}.${crypto.randomUUID()}.tmp`;
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, target);
  db.prepare("UPDATE media SET original_name = ?, width = ?, height = ?, size = ?, updated_at = ? WHERE id = ?").run(
    safeOriginalName(originalName),
    width,
    height,
    data.length,
    new Date().toISOString(),
    id,
  );
  return db.prepare("SELECT * FROM media WHERE id = ?").get(id) as MediaRow;
}

export interface MediaUsage {
  type: string;
  id: number | string;
  title: string;
}

/** Где используется файл: обложки, логотипы, галереи, тексты и страницы */
export function findMediaUsage(db: DB, media: Pick<MediaRow, "id" | "filename">): MediaUsage[] {
  const out: MediaUsage[] = [];
  const url = mediaUrl(media.filename);
  const like = `%${url}%`;
  const push = (type: string, rows: { id: number | string; title: string }[]) => rows.forEach((r) => out.push({ type, id: r.id, title: r.title }));
  push("Новость", db.prepare("SELECT id, title FROM news WHERE cover_id = ? OR body LIKE ?").all(media.id, like) as { id: number; title: string }[]);
  push("Кейс", db.prepare("SELECT DISTINCT c.id, c.title FROM cases c LEFT JOIN case_images ci ON ci.case_id = c.id WHERE c.cover_id = ? OR ci.media_id = ? OR c.body LIKE ?").all(media.id, media.id, like) as { id: number; title: string }[]);
  push("Партнер", db.prepare("SELECT id, name AS title FROM partners WHERE logo_id = ?").all(media.id) as { id: number; title: string }[]);
  push("Продукт", db.prepare("SELECT id, title FROM products WHERE image_id = ? OR body LIKE ?").all(media.id, like) as { id: number; title: string }[]);
  push("Страница", db.prepare("SELECT key AS id, key AS title FROM pages WHERE content LIKE ?").all(like) as { id: string; title: string }[]);
  push("Настройки", db.prepare("SELECT key AS id, key AS title FROM settings WHERE value LIKE ?").all(like) as { id: string; title: string }[]);
  return out;
}

export function deleteMediaFile(filename: string) {
  const p = path.join(config.uploadsDir, path.basename(filename));
  if (fs.existsSync(p)) fs.unlinkSync(p);
}
