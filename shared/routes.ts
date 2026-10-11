import type { DetailKind, PageKey } from "./types";

/** Публичные маршруты сайта (общие для сервера и клиента) */
export type ResolvedRoute =
  | { kind: "page"; page: PageKey }
  | { kind: "news-list" }
  | { kind: "detail"; detail: DetailKind; slug: string }
  | { kind: "not-found" };

const SLUG = "([a-z0-9]+(?:-[a-z0-9]+)*)";

export function resolveRoute(pathname: string): ResolvedRoute {
  const p = pathname.endsWith("/") ? pathname : pathname + "/";
  if (p === "/") return { kind: "page", page: "home" };
  if (p === "/obuchen/") return { kind: "page", page: "training" };
  if (p === "/about/") return { kind: "page", page: "about" };
  if (p === "/vnutyankaya-training/") return { kind: "page", page: "product" };
  if (p === "/news/") return { kind: "news-list" };
  for (const [prefix, detail] of [
    ["news", "news"],
    ["cases", "cases"],
    ["products", "products"],
  ] as const) {
    const m = p.match(new RegExp(`^/${prefix}/${SLUG}/$`));
    if (m) return { kind: "detail", detail, slug: m[1] };
  }
  return { kind: "not-found" };
}

export const detailPath = (kind: DetailKind, slug: string) => `/${kind}/${slug}/`;
