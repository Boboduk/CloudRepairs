import type { DB } from "./index";
import { DEFAULT_CASES, DEFAULT_PAGES, DEFAULT_PARTNERS, DEFAULT_PRODUCTS, DEFAULT_SETTINGS } from "../../shared/defaults";
import { PAGE_SCHEMAS, type PageKey } from "../../shared/schema";

const SEED_VERSION = "1";

/**
 * Первичное заполнение базы текущим содержимым сайта. Выполняется один раз:
 * если администратор удалит, например, всех партнеров, они не появятся снова.
 */
export function seed(db: DB) {
  const done = db.prepare("SELECT value FROM settings WHERE key = 'seed_version'").get() as { value: string } | undefined;
  if (done?.value === SEED_VERSION) return;

  db.transaction(() => {
    const insertPage = db.prepare("INSERT OR IGNORE INTO pages (key, content, section_order, seo_title, seo_description) VALUES (?, ?, ?, ?, ?)");
    for (const key of Object.keys(DEFAULT_PAGES) as PageKey[]) {
      const p = DEFAULT_PAGES[key];
      insertPage.run(key, JSON.stringify(p.sections), JSON.stringify(PAGE_SCHEMAS[key].orderable), p.seoTitle, p.seoDescription);
    }

    db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('site', ?)").run(JSON.stringify(DEFAULT_SETTINGS));

    const count = (t: string) => (db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get() as { n: number }).n;
    if (count("products") === 0) {
      const ins = db.prepare("INSERT INTO products (title, slug, excerpt, link_url, link_label, status, sort_order) VALUES (?, ?, ?, ?, ?, 'published', ?)");
      for (const p of DEFAULT_PRODUCTS) ins.run(p.title, p.slug, p.excerpt, p.linkUrl, p.linkLabel, p.sortOrder);
    }
    if (count("partners") === 0) {
      const ins = db.prepare("INSERT INTO partners (name, sort_order, visible) VALUES (?, ?, 1)");
      for (const p of DEFAULT_PARTNERS) ins.run(p.name, p.sortOrder);
    }
    if (count("cases") === 0) {
      const ins = db.prepare("INSERT INTO cases (title, slug, client, status, sort_order) VALUES (?, ?, ?, 'published', ?)");
      for (const c of DEFAULT_CASES) ins.run(c.title, c.slug, c.title, c.sortOrder);
    }
    db.prepare("INSERT INTO settings (key, value) VALUES ('seed_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(SEED_VERSION);
  })();
  console.log("[db] база заполнена начальным содержимым сайта");
}
