import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import type { DB } from "../db";
import { config } from "../config";
import { HttpError, idParam, notFound } from "../http";
import { deleteMediaFile, findMediaUsage, mediaUrl, replaceUpload, saveUpload, type MediaRow } from "../services/media";
import { zText } from "../validation";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUploadMb * 1024 * 1024, files: 1, fields: 5 },
  fileFilter: (_req, file, cb) => {
    // первичная проверка по заявленному типу; настоящая — декодированием в sharp
    if (!ALLOWED_MIME.has(file.mimetype)) return cb(new HttpError(415, "Допустимы только изображения JPG, PNG, WebP, GIF, AVIF"));
    cb(null, true);
  },
});

const single = (req: Parameters<ReturnType<typeof upload.single>>[0], res: Parameters<ReturnType<typeof upload.single>>[1]) =>
  new Promise<void>((resolve, reject) =>
    upload.single("file")(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        return reject(new HttpError(err.code === "LIMIT_FILE_SIZE" ? 413 : 400, err.code === "LIMIT_FILE_SIZE" ? `Файл больше ${config.maxUploadMb} МБ` : "Ошибка загрузки файла"));
      }
      if (err) return reject(err);
      resolve();
    }),
  );

const toDto = (r: MediaRow) => ({
  id: r.id,
  url: mediaUrl(r.filename),
  filename: r.filename,
  originalName: r.original_name,
  width: r.width,
  height: r.height,
  size: r.size,
  alt: r.alt,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export function mediaRoutes(db: DB) {
  const r = Router();
  const get = (id: number) => db.prepare("SELECT * FROM media WHERE id = ?").get(id) as MediaRow | undefined;

  r.get("/", (req, res) => {
    const q = String(req.query.q ?? "").trim().slice(0, 200);
    const rows = q
      ? (db.prepare("SELECT * FROM media WHERE original_name LIKE ? ESCAPE '\\' OR alt LIKE ? ESCAPE '\\' ORDER BY id DESC").all(...Array(2).fill(`%${q.replace(/[\\%_]/g, (m) => "\\" + m)}%`)) as MediaRow[])
      : (db.prepare("SELECT * FROM media ORDER BY id DESC").all() as MediaRow[]);
    res.json(rows.map(toDto));
  });

  r.get("/:id", (req, res) => {
    const row = get(idParam(req));
    if (!row) throw notFound("Файл");
    res.json({ ...toDto(row), usage: findMediaUsage(db, row) });
  });

  r.post("/", async (req, res) => {
    await single(req, res);
    if (!req.file) throw new HttpError(400, "Выберите файл");
    const alt = zText(300, "Описание").parse(String(req.body?.alt ?? ""));
    const row = await saveUpload(db, req.file.buffer, req.file.originalname, alt);
    res.status(201).json(toDto(row));
  });

  r.put("/:id/file", async (req, res) => {
    const id = idParam(req);
    await single(req, res);
    if (!req.file) throw new HttpError(400, "Выберите файл");
    res.json(toDto(await replaceUpload(db, id, req.file.buffer, req.file.originalname)));
  });

  r.patch("/:id", (req, res) => {
    const id = idParam(req);
    if (!get(id)) throw notFound("Файл");
    const { alt } = z.object({ alt: zText(300, "Описание") }).parse(req.body);
    db.prepare("UPDATE media SET alt = ?, updated_at = ? WHERE id = ?").run(alt, new Date().toISOString(), id);
    res.json(toDto(get(id)!));
  });

  r.delete("/:id", (req, res) => {
    const id = idParam(req);
    const row = get(id);
    if (!row) throw notFound("Файл");
    const usage = findMediaUsage(db, row);
    if (usage.length) throw new HttpError(409, "Файл используется на сайте — сначала замените его в этих местах", usage);
    db.prepare("DELETE FROM media WHERE id = ?").run(id);
    deleteMediaFile(row.filename);
    res.status(204).end();
  });

  return r;
}
