import type { InitialData, SiteData } from "./types";
import { resolveRoute } from "./routes";

export interface SeoInfo {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
  type?: "website" | "article";
}

const SUFFIX = " — CloudRepairs";

/** SEO-данные страницы: используются и сервером (в <head>), и клиентом при переходах */
export function seoFor(path: string, site: SiteData, detail: InitialData["detail"]): SeoInfo {
  const route = resolveRoute(path);
  const p = site.pages;
  switch (route.kind) {
    case "page": {
      const page = p[route.page];
      return { title: page.seoTitle, description: page.seoDescription, path: normalize(path) };
    }
    case "news-list":
      return {
        title: `Новости${SUFFIX}`,
        description: "Все о мире управления основными фондами, тех. обслуживаний и ремонтов, производственные практики.",
        path: "/news/",
      };
    case "detail": {
      const item = detail?.kind === route.detail && detail.slug === route.slug ? detail.item : null;
      if (!item) return notFound(path);
      const title = item.seoTitle || item.title + SUFFIX;
      const description = item.seoDescription || item.excerpt || "";
      const image = "cover" in item ? item.cover?.url : "image" in item ? item.image?.url : undefined;
      return { title, description, path: normalize(path), image, type: route.detail === "news" ? "article" : "website" };
    }
    default:
      return notFound(path);
  }
}

const normalize = (p: string) => (p.endsWith("/") ? p : p + "/");
const notFound = (path: string): SeoInfo => ({ title: "Страница не найдена" + SUFFIX, description: "Запрошенная страница не найдена.", path: normalize(path), noindex: true });
