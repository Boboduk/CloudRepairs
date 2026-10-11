import { useEffect } from "react";
import { SITE_NAME, SITE_URL } from "../content/site";

function setMeta(attr: "name" | "property", key: string, value: string | null) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (value === null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

export interface SeoProps {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}

/** Обновляет title/description/OG при переходах. При первом заходе их уже отдаёт сервер. */
export function Seo({ title, description, path, noindex }: SeoProps) {
  useEffect(() => {
    document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", SITE_URL + path);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("name", "robots", noindex ? "noindex" : null);
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = SITE_URL + path;
  }, [title, description, path, noindex]);
  return null;
}
