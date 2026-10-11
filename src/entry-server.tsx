import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { App, ROUTER_FUTURE } from "./App";
import { NOT_FOUND_SEO, SEO } from "./content/seo";
import { SITE_NAME, SITE_URL } from "./content/site";

export const ROUTES = Object.keys(SEO);

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** Рендер страницы в HTML для пререндера (SEO: контент и мета-теги есть в исходном коде) */
export function render(url: string) {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url} future={ROUTER_FUTURE}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
  const page = SEO[url] ?? NOT_FOUND_SEO;
  const head = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    `<link rel="canonical" href="${SITE_URL}${page.path}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="ru_RU" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:url" content="${SITE_URL}${page.path}" />`,
  ].join("\n    ");
  return { html, head };
}
