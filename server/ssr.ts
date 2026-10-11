import type { DB } from "./db";
import { config } from "./config";
import { resolveRoute } from "../shared/routes";
import { seoFor } from "../shared/seo";
import type { InitialData } from "../shared/types";
import { getPublishedCase, getPublishedNews, getPublishedProduct, getSiteData } from "./services/content";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Собирает данные для страницы: те же функции, что и у публичного API */
export function loadInitialData(db: DB, path: string): { data: InitialData; status: number } {
  const site = getSiteData(db);
  const route = resolveRoute(path);
  let detail: InitialData["detail"] = null;
  let status = route.kind === "not-found" ? 404 : 200;
  if (route.kind === "detail") {
    const getter = { news: getPublishedNews, cases: getPublishedCase, products: getPublishedProduct }[route.detail];
    const item = getter(db, route.slug);
    detail = { kind: route.detail, slug: route.slug, item };
    if (!item) status = 404;
  }
  return { data: { site, path, detail, loadedAt: Date.now() }, status };
}

export function buildHead(data: InitialData): string {
  const seo = seoFor(data.path, data.site, data.detail);
  const url = config.publicUrl + seo.path;
  const tags = [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="${seo.type ?? "website"}" />`,
    `<meta property="og:site_name" content="CloudRepairs" />`,
    `<meta property="og:locale" content="ru_RU" />`,
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
  ];
  if (seo.image) tags.push(`<meta property="og:image" content="${esc(config.publicUrl + seo.image)}" />`);
  if (seo.noindex) tags.push(`<meta name="robots" content="noindex" />`);
  return tags.join("\n    ");
}

/** JSON внутри <script type="application/json">: экранируем символы, опасные для HTML */
export function serializeData(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

export function renderPage(template: string, opts: { head: string; html: string; data: InitialData; nonce: string }) {
  return template
    .replace("<!--app-head-->", opts.head)
    .replace(/<script(?=[^>]*>document\.documentElement)/, `<script nonce="${opts.nonce}"`)
    .replace("<!--app-html-->", opts.html)
    .replace("</body>", `<script id="__DATA__" type="application/json">${serializeData(opts.data)}</script>\n  </body>`);
}
