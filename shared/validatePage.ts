import type { Field, PageSchema } from "./schema";

/**
 * Проверка и нормализация содержимого страницы по схеме.
 * Возвращает очищенные данные (только поля из схемы) или список ошибок.
 * Используется на сервере перед сохранением.
 */

export interface ValidationIssue {
  path: string;
  message: string;
}

const DEFAULT_MAX = 2000;
const MAX_LIST = 100;

/** Разрешённые ссылки: относительные пути, якоря, http(s), mailto, tel */
export function isSafeHref(href: string): boolean {
  if (href === "") return true;
  if (/^(\/(?!\/)|#)/.test(href)) return !/[\s<>"]/.test(href);
  try {
    const u = new URL(href);
    return ["http:", "https:", "mailto:", "tel:"].includes(u.protocol);
  } catch {
    return false;
  }
}

/** Разрешённые изображения: загруженные файлы и встроенные изображения сайта */
export function isSafeImage(src: string): boolean {
  return src === "" || /^\/(uploads|img|brand)\/[A-Za-z0-9._/-]+$/.test(src);
}

function cleanString(v: unknown): string | null {
  if (v === undefined || v === null) return "";
  if (typeof v !== "string") return null;
  // убираем управляющие символы, кроме переносов строк и табуляции
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}

function validateField(field: Field, value: unknown, path: string, issues: ValidationIssue[], sanitizeRich: (html: string) => string, fallback: unknown): unknown {
  const p = `${path}.${field.key}`;
  switch (field.type) {
    case "text":
    case "textarea": {
      const s = cleanString(value);
      if (s === null) return issues.push({ path: p, message: `${field.label}: ожидается текст` }), "";
      const max = field.max ?? DEFAULT_MAX;
      if (s.length > max) issues.push({ path: p, message: `${field.label}: не длиннее ${max} символов` });
      if (field.required && !s) issues.push({ path: p, message: `${field.label}: обязательное поле` });
      return field.type === "text" ? s.replace(/\s*\n\s*/g, " ") : s;
    }
    case "richtext": {
      const s = typeof value === "string" ? value : "";
      if (s.length > 200_000) issues.push({ path: p, message: `${field.label}: слишком длинный текст` });
      return sanitizeRich(s);
    }
    case "image": {
      const s = cleanString(value) ?? "";
      if (!isSafeImage(s)) issues.push({ path: p, message: `${field.label}: выберите изображение из медиатеки` });
      return s;
    }
    case "url": {
      const s = cleanString(value) ?? "";
      if (s.length > 1000 || !isSafeHref(s)) issues.push({ path: p, message: `${field.label}: некорректная ссылка` });
      if (field.required && !s) issues.push({ path: p, message: `${field.label}: обязательное поле` });
      return s;
    }
    case "select": {
      const s = cleanString(value) ?? "";
      if (!field.options.some((o) => o.value === s)) {
        const fb = typeof fallback === "string" ? fallback : field.options[0]?.value;
        return fb;
      }
      return s;
    }
    case "strings": {
      if (!Array.isArray(value)) return issues.push({ path: p, message: `${field.label}: ожидается список` }), [];
      const max = field.max ?? MAX_LIST;
      if (value.length > max) issues.push({ path: p, message: `${field.label}: не более ${max} пунктов` });
      return value
        .slice(0, max)
        .map((v, i) => {
          const s = cleanString(v);
          if (s === null) issues.push({ path: `${p}[${i}]`, message: `${field.label}: ожидается текст` });
          if (s && s.length > DEFAULT_MAX) issues.push({ path: `${p}[${i}]`, message: `${field.label}: пункт не длиннее ${DEFAULT_MAX} символов` });
          return s ?? "";
        })
        .filter((s) => s !== "");
    }
    case "items": {
      if (!Array.isArray(value)) return issues.push({ path: p, message: `${field.label}: ожидается список` }), [];
      const max = field.max ?? MAX_LIST;
      if (value.length > max) issues.push({ path: p, message: `${field.label}: не более ${max} элементов` });
      return value.slice(0, max).map((item, i) => validateObject(field.fields, item, `${p}[${i}]`, issues, sanitizeRich, undefined));
    }
  }
}

function validateObject(fields: Field[], value: unknown, path: string, issues: ValidationIssue[], sanitizeRich: (html: string) => string, fallback: unknown) {
  const obj = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const fb = fallback && typeof fallback === "object" ? (fallback as Record<string, unknown>) : {};
  const out: Record<string, unknown> = {};
  for (const f of fields) out[f.key] = validateField(f, obj[f.key], path, issues, sanitizeRich, fb[f.key]);
  return out;
}

export function validatePageContent(
  schema: PageSchema,
  input: { sections?: unknown; order?: unknown },
  sanitizeRich: (html: string) => string,
): { sections: Record<string, Record<string, unknown>>; order: string[]; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  const raw = input.sections && typeof input.sections === "object" ? (input.sections as Record<string, unknown>) : {};
  const sections: Record<string, Record<string, unknown>> = {};
  for (const s of schema.sections) sections[s.key] = validateObject(s.fields, raw[s.key], s.key, issues, sanitizeRich, undefined);
  return { sections, order: normalizeOrder(schema, input.order), issues };
}

/** Порядок секций: только разрешённые к перестановке ключи, без повторов, все на месте */
export function normalizeOrder(schema: PageSchema, order: unknown): string[] {
  const allowed = schema.orderable;
  const given = Array.isArray(order) ? order.filter((k): k is string => typeof k === "string" && allowed.includes(k)) : [];
  const unique = Array.from(new Set(given));
  for (const k of allowed) if (!unique.includes(k)) unique.push(k);
  return unique;
}

/** Дополняет сохранённые данные значениями по умолчанию для полей, которых ещё нет */
export function mergeWithDefaults(schema: PageSchema, stored: Record<string, unknown> | undefined, defaults: Record<string, Record<string, unknown>>) {
  const out: Record<string, Record<string, unknown>> = {};
  for (const s of schema.sections) {
    const st = (stored?.[s.key] as Record<string, unknown> | undefined) ?? undefined;
    const def = defaults[s.key] ?? {};
    out[s.key] = {};
    for (const f of s.fields) out[s.key][f.key] = st && f.key in st ? st[f.key] : def[f.key] ?? (f.type === "strings" || f.type === "items" ? [] : "");
  }
  return out;
}
