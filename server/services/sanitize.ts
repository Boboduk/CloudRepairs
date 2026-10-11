import sanitizeHtml from "sanitize-html";
import { isSafeHref, isSafeImage } from "../../shared/validatePage";

/**
 * Очистка HTML из визуального редактора: только безопасные теги и атрибуты.
 * Скрипты, обработчики событий, style, iframe и javascript:-ссылки удаляются.
 */
export function sanitizeRich(html: string): string {
  if (!html) return "";
  const clean = sanitizeHtml(html, {
    allowedTags: ["p", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li", "blockquote", "br", "hr", "img", "code", "pre"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    transformTags: {
      b: "strong",
      i: "em",
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        if (!isSafeHref(href)) return { tagName: "span", attribs: {} as Record<string, string> };
        const external = /^https?:/i.test(href);
        const out: Record<string, string> = external ? { href, target: "_blank", rel: "noopener noreferrer" } : { href };
        return { tagName, attribs: out };
      },
    },
    exclusiveFilter: (frame) => frame.tag === "img" && !isSafeImage(frame.attribs.src ?? ""),
  });
  // пустой абзац из редактора считаем пустым текстом
  return clean.replace(/^(<p><\/p>\s*)+$/, "").trim();
}

/** Простой текст: без тегов */
export function plainText(s: string): string {
  return sanitizeHtml(s, { allowedTags: [], allowedAttributes: {} }).trim();
}
