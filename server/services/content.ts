import type { DB } from "../db";
import { DEFAULT_PAGES, DEFAULT_SETTINGS, type SiteSettings } from "../../shared/defaults";
import { PAGE_SCHEMAS, type PageKey } from "../../shared/schema";
import { mergeWithDefaults, normalizeOrder } from "../../shared/validatePage";
import { upgradeStoredPage } from "../../shared/upgrade";
import { detailPath } from "../../shared/routes";
import type { CaseItem, CaseLink, CaseListItem, NewsItem, NewsListItem, PageData, Partner, ProductItem, ProductListItem, SiteData } from "../../shared/types";
import { getMediaRef, toMediaRef, type MediaRow } from "./media";

/**
 * Данные публичного сайта — читаются из той же БД, которую редактирует админка.
 * Возвращаются только опубликованные/видимые записи.
 */

interface PageRow {
  key: string;
  content: string;
  section_order: string;
  seo_title: string;
  seo_description: string;
  updated_at: string;
}

function safeJson<T>(s: string | null | undefined, fallback: T): T {
  try {
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getPage(db: DB, key: PageKey): PageData<Record<string, Record<string, unknown>>> & { updatedAt: string | null } {
  const row = db.prepare("SELECT * FROM pages WHERE key = ?").get(key) as PageRow | undefined;
  const schema = PAGE_SCHEMAS[key];
  const def = DEFAULT_PAGES[key];
  return {
    sections: mergeWithDefaults(schema, upgradeStoredPage(key, safeJson(row?.content, undefined)), def.sections),
    order: normalizeOrder(schema, safeJson(row?.section_order, schema.orderable)),
    seoTitle: row?.seo_title || def.seoTitle,
    seoDescription: row?.seo_description || def.seoDescription,
    updatedAt: row?.updated_at ?? null,
  };
}

export function getSettings(db: DB): SiteSettings {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'site'").get() as { value: string } | undefined;
  return { ...DEFAULT_SETTINGS, ...safeJson<Partial<SiteSettings>>(row?.value, {}) };
}

const media = (db: DB, id: number | null) => getMediaRef(db, id);

export function listPublishedNews(db: DB, limit = 200): NewsListItem[] {
  const rows = db
    .prepare(
      "SELECT id, slug, title, excerpt, published_at, cover_id FROM news WHERE status = 'published' AND (published_at IS NULL OR published_at <= ?) ORDER BY published_at DESC, id DESC LIMIT ?",
    )
    .all(new Date().toISOString(), limit) as { id: number; slug: string; title: string; excerpt: string; published_at: string | null; cover_id: number | null }[];
  return rows.map((r) => ({ id: r.id, slug: r.slug, title: r.title, excerpt: r.excerpt, publishedAt: r.published_at, cover: media(db, r.cover_id) }));
}

export function getPublishedNews(db: DB, slug: string): NewsItem | null {
  const r = db
    .prepare("SELECT * FROM news WHERE slug = ? AND status = 'published' AND (published_at IS NULL OR published_at <= ?)")
    .get(slug, new Date().toISOString()) as
    | { id: number; slug: string; title: string; excerpt: string; body: string; published_at: string | null; cover_id: number | null; seo_title: string; seo_description: string }
    | undefined;
  if (!r) return null;
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    body: r.body,
    publishedAt: r.published_at,
    cover: media(db, r.cover_id),
    seoTitle: r.seo_title,
    seoDescription: r.seo_description,
  };
}

interface PartnerRow {
  id: number;
  name: string;
  url: string;
  description: string;
  logo_id: number | null;
}
const toPartner = (db: DB, r: PartnerRow): Partner => ({ id: r.id, name: r.name, url: r.url, description: r.description, logo: media(db, r.logo_id) });

export function listVisiblePartners(db: DB): Partner[] {
  return (db.prepare("SELECT id, name, url, description, logo_id FROM partners WHERE visible = 1 ORDER BY sort_order, id").all() as PartnerRow[]).map((r) => toPartner(db, r));
}

interface CaseRow {
  id: number;
  slug: string;
  title: string;
  client: string;
  partner_id: number | null;
  excerpt: string;
  body: string;
  cover_id: number | null;
  links: string;
  seo_title: string;
  seo_description: string;
}

const caseHasPage = (r: Pick<CaseRow, "body">) => r.body.trim().length > 0;

export function listPublishedCases(db: DB): CaseListItem[] {
  const rows = db.prepare("SELECT * FROM cases WHERE status = 'published' ORDER BY sort_order, id").all() as CaseRow[];
  return rows.map((r) => ({ id: r.id, slug: r.slug, title: r.title, client: r.client, excerpt: r.excerpt, cover: media(db, r.cover_id), hasPage: caseHasPage(r) }));
}

export function getPublishedCase(db: DB, slug: string): CaseItem | null {
  const r = db.prepare("SELECT * FROM cases WHERE slug = ? AND status = 'published'").get(slug) as CaseRow | undefined;
  // страница кейса существует, когда у него есть полный текст
  if (!r || !caseHasPage(r)) return null;
  const images = (
    db
      .prepare("SELECT m.* FROM case_images ci JOIN media m ON m.id = ci.media_id WHERE ci.case_id = ? ORDER BY ci.sort_order")
      .all(r.id) as MediaRow[]
  )
    .map((m) => toMediaRef(m))
    .filter((m): m is NonNullable<typeof m> => !!m);
  const partnerRow = r.partner_id ? (db.prepare("SELECT id, name, url, description, logo_id FROM partners WHERE id = ? AND visible = 1").get(r.partner_id) as PartnerRow | undefined) : undefined;
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    client: r.client,
    excerpt: r.excerpt,
    body: r.body,
    cover: media(db, r.cover_id),
    hasPage: caseHasPage(r),
    images,
    links: safeJson<CaseLink[]>(r.links, []),
    partner: partnerRow ? toPartner(db, partnerRow) : null,
    seoTitle: r.seo_title,
    seoDescription: r.seo_description,
  };
}

interface ProductRow {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  image_id: number | null;
  link_url: string;
  link_label: string;
  seo_title: string;
  seo_description: string;
}

/** Карточка ведёт по ссылке продукта; если её нет, но есть текст — на страницу продукта */
const productHref = (r: ProductRow) => r.link_url || (r.body.trim() ? detailPath("products", r.slug) : null);

const toProductListItem = (db: DB, r: ProductRow): ProductListItem => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt,
  image: media(db, r.image_id),
  href: productHref(r),
  linkLabel: r.link_label,
});

export function listPublishedProducts(db: DB): ProductListItem[] {
  return (db.prepare("SELECT * FROM products WHERE status = 'published' ORDER BY sort_order, id").all() as ProductRow[]).map((r) => toProductListItem(db, r));
}

export function getPublishedProduct(db: DB, slug: string): ProductItem | null {
  const r = db.prepare("SELECT * FROM products WHERE slug = ? AND status = 'published'").get(slug) as ProductRow | undefined;
  if (!r || !r.body.trim()) return null;
  return { ...toProductListItem(db, r), body: r.body, seoTitle: r.seo_title, seoDescription: r.seo_description };
}

export function getSiteData(db: DB): SiteData {
  const page = <K extends PageKey>(k: K) => {
    const { updatedAt: _u, ...p } = getPage(db, k);
    return p;
  };
  return {
    settings: getSettings(db),
    pages: {
      home: page("home") as unknown as SiteData["pages"]["home"],
      training: page("training") as unknown as SiteData["pages"]["training"],
      about: page("about") as unknown as SiteData["pages"]["about"],
      product: page("product") as unknown as SiteData["pages"]["product"],
    },
    news: listPublishedNews(db),
    partners: listVisiblePartners(db),
    cases: listPublishedCases(db),
    products: listPublishedProducts(db),
  };
}
