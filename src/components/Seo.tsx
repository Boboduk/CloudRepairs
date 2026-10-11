import { useEffect } from "react";
import { SITE_NAME, SITE_URL } from "../content/site";
import type { PageSeo } from "../content/types";

function setMeta(attr: "name" | "property", key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

/** Обновляет title/description/OG при переходах по сайту.
 *  При сборке те же данные вшиваются в HTML каждой страницы (scripts/prerender.mjs). */
export function Seo({ page }: { page: PageSeo }) {
  useEffect(() => {
    document.title = page.title;
    setMeta("name", "description", page.description);
    setMeta("property", "og:title", page.title);
    setMeta("property", "og:description", page.description);
    setMeta("property", "og:url", SITE_URL + page.path);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", "ru_RU");
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = SITE_URL + page.path;
  }, [page]);
  return null;
}
