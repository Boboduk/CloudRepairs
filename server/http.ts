import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

/** Ошибка с HTTP-статусом и понятным сообщением для администратора */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function notFound(entity = "Запись") {
  return new HttpError(404, `${entity} не найдена`);
}

/** Обработчик ошибок API: единый формат { error, details } */
export function apiErrorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Проверьте заполнение полей",
      details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  const e = err as { code?: string; type?: string; status?: number };
  if (e?.code === "SQLITE_CONSTRAINT_UNIQUE") return res.status(409).json({ error: "Такой адрес (slug) уже используется" });
  if (e?.type === "entity.too.large") return res.status(413).json({ error: "Слишком большой запрос" });
  if (e?.type === "entity.parse.failed") return res.status(400).json({ error: "Некорректный JSON" });
  console.error("[api]", err);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
}

export const idParam = (req: Request) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "Некорректный идентификатор");
  return id;
};
