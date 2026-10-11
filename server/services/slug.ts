import type { DB } from "../db";

const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Человекопонятный адрес из заголовка: «Новый кейс ЯТЭК» → «novyy-keys-yatek» */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((ch) => MAP[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** Уникальный slug в таблице: при совпадении добавляется -2, -3, … */
export function uniqueSlug(db: DB, table: "news" | "cases" | "products", base: string, excludeId?: number): string {
  const root = base || "zapis";
  let slug = root;
  for (let i = 2; ; i++) {
    const row = db.prepare(`SELECT id FROM ${table} WHERE slug = ?`).get(slug) as { id: number } | undefined;
    if (!row || row.id === excludeId) return slug;
    slug = `${root}-${i}`;
  }
}
