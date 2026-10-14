import type { PageKey } from "./schema";

/**
 * Обновление сохранённого содержимого страниц под новые версии схемы.
 * Применяется при чтении: старые данные продолжают работать, при следующем сохранении
 * они записываются уже в новом виде.
 */
export function upgradeStoredPage(key: PageKey, stored: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!stored || key !== "product") return stored;
  const functions = stored.functions as { items?: unknown } | undefined;
  if (!functions || !Array.isArray(functions.items)) return stored;
  // функции: одно изображение (image + imageAlt) → список изображений для карусели
  const items = functions.items.map((it) => {
    if (!it || typeof it !== "object") return it;
    const item = it as Record<string, unknown>;
    if (Array.isArray(item.images)) return item;
    const { image, imageAlt, ...rest } = item;
    return { ...rest, images: typeof image === "string" && image ? [{ image, alt: typeof imageAlt === "string" ? imageAlt : "" }] : [] };
  });
  return { ...stored, functions: { ...functions, items } };
}
