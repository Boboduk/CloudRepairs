import { z } from "zod";
import type { DB } from "./db";
import { isSafeHref } from "../shared/validatePage";
import { HttpError } from "./http";
import { SLUG_RE } from "./services/slug";

/** Общие правила проверки данных, приходящих из админки */
const noCtrl = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

export const zText = (max: number, label: string) =>
  z
    .string({ invalid_type_error: `${label}: ожидается текст` })
    .transform((s) => noCtrl(s).trim())
    .refine((s) => s.length <= max, `${label}: не длиннее ${max} символов`);

export const zRequiredText = (max: number, label: string) => zText(max, label).refine((s) => s.length > 0, `${label}: обязательное поле`);

export const zSlug = z
  .string()
  .trim()
  .toLowerCase()
  .refine((s) => s === "" || (SLUG_RE.test(s) && s.length <= 80), "Адрес (slug): только латиница, цифры и дефисы, до 80 символов")
  .optional()
  .default("");

export const zHref = (label: string) =>
  z
    .string()
    .trim()
    .max(1000, `${label}: слишком длинная ссылка`)
    .refine(isSafeHref, `${label}: допустимы ссылки вида https://…, /страница/, mailto:, tel:`);

export const zStatus = z.enum(["draft", "published"], { errorMap: () => ({ message: "Статус: черновик или опубликовано" }) });

export const zMediaId = z.number().int().positive().nullable().optional().default(null);

export const zDate = z
  .string()
  .trim()
  .nullable()
  .optional()
  .default(null)
  .refine((s) => s === null || s === "" || !Number.isNaN(Date.parse(s)), "Дата публикации: некорректная дата")
  .transform((s) => (s ? new Date(s).toISOString() : null));

export const zSeo = {
  seoTitle: zText(200, "SEO-заголовок").optional().default(""),
  seoDescription: zText(400, "SEO-описание").optional().default(""),
};

export function assertMediaExists(db: DB, ...ids: (number | null | undefined)[]) {
  for (const id of ids) {
    if (!id) continue;
    if (!db.prepare("SELECT 1 FROM media WHERE id = ?").get(id)) throw new HttpError(400, `Изображение #${id} не найдено в медиатеке`);
  }
}
