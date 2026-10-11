/**
 * Интеграционные тесты: запускают настоящий сервер на временной БД и проверяют
 * авторизацию, защиту API, CRUD разделов и отражение изменений на публичном сайте.
 *
 *   npm test
 */
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const PORT = 3900 + Math.floor(Math.random() * 90);
const BASE = `http://127.0.0.1:${PORT}`;
const EMAIL = "owner@test.local";
const PASSWORD = "Strong-pass-12345";
const DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "cr-test-"));
const ENV = { ...process.env, DATA_DIR, PORT: String(PORT), HOST: "127.0.0.1", LOGIN_MAX_ATTEMPTS: "3", NODE_ENV: "development" };

let server: ChildProcess | null = null;

async function startServer() {
  server = spawn(process.execPath, ["--import", "tsx", "server/index.ts"], { cwd: ROOT, env: ENV, stdio: ["ignore", "pipe", "pipe"] });
  let log = "";
  server.stdout!.on("data", (d) => (log += d));
  server.stderr!.on("data", (d) => (log += d));
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`${BASE}/api/public/site`);
      if (r.ok) return;
    } catch {
      /* ещё не запустился */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("Сервер не запустился:\n" + log);
}

async function stopServer() {
  if (!server) return;
  const s = server;
  server = null;
  await new Promise<void>((resolve) => {
    s.once("exit", () => resolve());
    s.kill("SIGTERM");
  });
}

// ---------- клиент с cookie и CSRF ----------
class Client {
  cookie = "";
  csrf = "";
  async req(method: string, url: string, body?: unknown, opts: { csrf?: boolean; origin?: string; form?: FormData } = {}) {
    const headers: Record<string, string> = {};
    if (this.cookie) headers.cookie = this.cookie;
    if (opts.csrf !== false && method !== "GET") headers["x-csrf-token"] = this.csrf;
    if (opts.origin) headers.origin = opts.origin;
    let payload: BodyInit | undefined;
    if (opts.form) payload = opts.form;
    else if (body !== undefined) {
      headers["content-type"] = "application/json";
      payload = JSON.stringify(body);
    }
    const res = await fetch(BASE + url, { method, headers, body: payload, redirect: "manual" });
    const set = res.headers.get("set-cookie");
    if (set) {
      const [pair] = set.split(";");
      this.cookie = pair.endsWith("=") ? "" : pair;
    }
    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      /* не JSON */
    }
    return { status: res.status, json, text, headers: res.headers };
  }
  async login(email = EMAIL, password = PASSWORD) {
    const r = await this.req("POST", "/api/admin/auth/login", { email, password });
    if (r.status === 200) this.csrf = r.json.csrfToken;
    return r;
  }
}

const page = async (url: string) => {
  const r = await fetch(BASE + url, { redirect: "manual" });
  return { status: r.status, html: await r.text() };
};

async function pngFile(name = "test.png", color = { r: 200, g: 30, b: 30 }) {
  const buf = await sharp({ create: { width: 64, height: 48, channels: 3, background: color } }).png().toBuffer();
  const fd = new FormData();
  fd.append("file", new Blob([buf], { type: "image/png" }), name);
  fd.append("alt", "Тестовое изображение");
  return fd;
}

before(async () => {
  const r = spawnSync(process.execPath, ["--import", "tsx", "server/cli/create-admin.ts", "--email", EMAIL, "--name", "Тест"], {
    cwd: ROOT,
    env: { ...ENV, ADMIN_PASSWORD: PASSWORD },
    encoding: "utf8",
  });
  assert.equal(r.status, 0, r.stderr || r.stdout);
  await startServer();
});

after(async () => {
  await stopServer();
  fs.rmSync(DATA_DIR, { recursive: true, force: true });
});

describe("Доступ и авторизация", () => {
  test("слабый пароль отклоняется при создании администратора", () => {
    const r = spawnSync(process.execPath, ["--import", "tsx", "server/cli/create-admin.ts", "--email", "weak@test.local"], {
      cwd: ROOT,
      env: { ...ENV, ADMIN_PASSWORD: "123" },
      encoding: "utf8",
    });
    assert.notEqual(r.status, 0);
  });

  test("/admin отдаёт приложение без индексации", async () => {
    const r = await fetch(`${BASE}/admin/news`);
    assert.equal(r.status, 200);
    assert.match(r.headers.get("x-robots-tag") ?? "", /noindex/);
    const html = await r.text();
    assert.match(html, /admin-root/);
    assert.doesNotMatch(html, new RegExp(PASSWORD));
  });

  test("публичный сайт не содержит ссылок на вход в админку", async () => {
    const { html } = await page("/");
    assert.doesNotMatch(html, /href="\/admin/);
    assert.doesNotMatch(html, />Войти</);
  });

  test("robots.txt закрывает /admin и /api", async () => {
    const { html } = await page("/robots.txt");
    assert.match(html, /Disallow: \/admin/);
    assert.match(html, /Disallow: \/api\//);
  });

  test("закрытые API без входа отвечают 401", async () => {
    const c = new Client();
    for (const [m, u] of [
      ["GET", "/api/admin/stats"],
      ["GET", "/api/admin/news"],
      ["POST", "/api/admin/news"],
      ["DELETE", "/api/admin/partners/1"],
      ["PUT", "/api/admin/pages/home"],
      ["GET", "/api/admin/media"],
      ["GET", "/api/admin/auth/session"],
    ] as const) {
      const r = await c.req(m, u, m === "GET" ? undefined : {});
      assert.equal(r.status, 401, `${m} ${u}`);
    }
  });

  test("неверный пароль — 401 с общим сообщением", async () => {
    const c = new Client();
    const r = await c.login(EMAIL, "wrong-password-1");
    assert.equal(r.status, 401);
    assert.equal(r.json.error, "Неверный e-mail или пароль");
    const r2 = await c.login("nobody@test.local", "wrong-password-1");
    assert.equal(r2.json.error, r.json.error);
  });

  test("вход, cookie HttpOnly/SameSite, проверка сессии", async () => {
    const c = new Client();
    const r = await c.login();
    assert.equal(r.status, 200);
    const set = r.headers.get("set-cookie") ?? "";
    assert.match(set, /HttpOnly/);
    assert.match(set, /SameSite=Strict/);
    assert.ok(r.json.csrfToken.length > 20);
    const s = await c.req("GET", "/api/admin/auth/session");
    assert.equal(s.status, 200);
    assert.equal(s.json.admin.email, EMAIL);
  });

  test("изменяющий запрос без CSRF-токена — 403", async () => {
    const c = new Client();
    await c.login();
    const r = await c.req("POST", "/api/admin/news", { title: "CSRF" }, { csrf: false });
    assert.equal(r.status, 403);
    const r2 = await c.req("POST", "/api/admin/news", { title: "CSRF" }, { origin: "https://evil.example" });
    assert.equal(r2.status, 403);
  });

  test("выход завершает сессию на сервере", async () => {
    const c = new Client();
    await c.login();
    const saved = c.cookie;
    const out = await c.req("POST", "/api/admin/auth/logout", {});
    assert.equal(out.status, 200);
    c.cookie = saved; // старый токен больше не действует
    const s = await c.req("GET", "/api/admin/auth/session");
    assert.equal(s.status, 401);
  });

  test("ограничение попыток входа — 429 после серии неудач", async () => {
    const c = new Client();
    const email = "brute@test.local";
    const codes: number[] = [];
    for (let i = 0; i < 4; i++) codes.push((await c.login(email, "bad-password-" + i)).status);
    assert.deepEqual(codes.slice(0, 3), [401, 401, 401]);
    assert.equal(codes[3], 429);
  });
});

describe("Новости", () => {
  const c = new Client();
  let id = 0;
  let slug = "";
  before(async () => {
    await c.login();
  });

  test("валидация: пустой заголовок — 400 с подробностями", async () => {
    const r = await c.req("POST", "/api/admin/news", { title: "" });
    assert.equal(r.status, 400);
    assert.ok(r.json.details.some((d: any) => d.path === "title"));
  });

  test("черновик создаётся и не виден на сайте", async () => {
    const r = await c.req("POST", "/api/admin/news", {
      title: "Запуск модуля планирования",
      excerpt: "Кратко о запуске",
      body: '<h2>Подробности</h2><p>Текст <a href="https://example.com">ссылка</a></p><script>alert(1)</script><img src="x" onerror="alert(1)"><p onclick="x()">клик</p>',
      status: "draft",
    });
    assert.equal(r.status, 201);
    id = r.json.id;
    slug = r.json.slug;
    assert.equal(slug, "zapusk-modulya-planirovaniya");
    // XSS: скрипты и обработчики вырезаны, внешняя ссылка безопасна
    assert.doesNotMatch(r.json.body, /<script|onerror|onclick/);
    assert.match(r.json.body, /rel="noopener noreferrer"/);
    assert.equal((await page(`/news/${slug}/`)).status, 404);
  });

  test("публикация — новость появляется в списке, на главной и на своей странице", async () => {
    const r = await c.req("PATCH", `/api/admin/news/${id}/status`, { status: "published" });
    assert.equal(r.status, 200);
    assert.ok(r.json.publishedAt);
    const detail = await page(`/news/${slug}/`);
    assert.equal(detail.status, 200);
    assert.match(detail.html, /Запуск модуля планирования/);
    assert.match(detail.html, /<h2>Подробности<\/h2>/);
    assert.match((await page("/news/")).html, /Запуск модуля планирования/);
    assert.match((await page("/")).html, /Запуск модуля планирования/);
    assert.match((await page("/sitemap.xml")).html, new RegExp(`/news/${slug}/`));
  });

  test("поиск и сортировка по дате", async () => {
    await c.req("POST", "/api/admin/news", { title: "Старая новость", status: "published", publishedAt: "2020-01-01T10:00:00.000Z" });
    const found = await c.req("GET", "/api/admin/news?q=" + encodeURIComponent("модуля"));
    assert.equal(found.json.length, 1);
    const asc = await c.req("GET", "/api/admin/news?sort=date_asc");
    assert.equal(asc.json[0].title, "Старая новость");
    const desc = await c.req("GET", "/api/admin/news?sort=date_desc");
    assert.equal(desc.json[0].title, "Запуск модуля планирования");
  });

  test("отложенная публикация не видна до наступления даты", async () => {
    const r = await c.req("POST", "/api/admin/news", { title: "Будущая новость", status: "published", publishedAt: "2099-01-01T00:00:00.000Z" });
    assert.equal(r.status, 201);
    assert.equal((await page(`/news/${r.json.slug}/`)).status, 404);
  });

  test("редактирование, SEO и смена адреса", async () => {
    const r = await c.req("PUT", `/api/admin/news/${id}`, {
      title: "Запуск модуля планирования ТОиР",
      slug: "zapusk-planirovaniya",
      excerpt: "Новое описание",
      body: "<p>Обновлённый текст</p>",
      status: "published",
      publishedAt: new Date(Date.now() - 60_000).toISOString(),
      seoTitle: "SEO заголовок новости",
      seoDescription: "SEO описание новости",
    });
    assert.equal(r.status, 200);
    slug = r.json.slug;
    const d = await page(`/news/${slug}/`);
    assert.equal(d.status, 200);
    assert.match(d.html, /<title>SEO заголовок новости/);
    assert.match(d.html, /SEO описание новости/);
    assert.match(d.html, /Обновлённый текст/);
  });

  test("занятый адрес получает уникальный суффикс", async () => {
    const r = await c.req("POST", "/api/admin/news", { title: "Дубль", slug: "zapusk-planirovaniya" });
    assert.equal(r.status, 201);
    assert.notEqual(r.json.slug, "zapusk-planirovaniya");
  });

  test("снятие с публикации и удаление", async () => {
    await c.req("PATCH", `/api/admin/news/${id}/status`, { status: "draft" });
    assert.equal((await page(`/news/${slug}/`)).status, 404);
    const del = await c.req("DELETE", `/api/admin/news/${id}`);
    assert.equal(del.status, 204);
    assert.equal((await c.req("GET", `/api/admin/news/${id}`)).status, 404);
    assert.equal((await c.req("DELETE", `/api/admin/news/${id}`)).status, 404);
  });
});

describe("Партнёры, кейсы, продукты", () => {
  const c = new Client();
  before(async () => {
    await c.login();
  });

  test("партнёр: создание, скрытие, порядок, удаление", async () => {
    const bad = await c.req("POST", "/api/admin/partners", { name: "X", url: "javascript:alert(1)" });
    assert.equal(bad.status, 400);
    const r = await c.req("POST", "/api/admin/partners", { name: "Тестовый партнёр", url: "https://partner.example", description: "Описание" });
    assert.equal(r.status, 201);
    const pid = r.json.id;
    assert.match((await page("/")).html, /Тестовый партнёр/);
    await c.req("PATCH", `/api/admin/partners/${pid}/visibility`, { visible: false });
    assert.doesNotMatch((await page("/")).html, /Тестовый партнёр/);
    await c.req("PATCH", `/api/admin/partners/${pid}/visibility`, { visible: true });
    const list = (await c.req("GET", "/api/admin/partners")).json as { id: number }[];
    const ids = [pid, ...list.map((p) => p.id).filter((x) => x !== pid)];
    assert.equal((await c.req("POST", "/api/admin/partners/reorder", { ids })).status, 200);
    const site = (await c.req("GET", "/api/public/site")).json;
    assert.equal(site.partners[0].name, "Тестовый партнёр");
    assert.equal((await c.req("DELETE", `/api/admin/partners/${pid}`)).status, 204);
    assert.doesNotMatch((await page("/")).html, /Тестовый партнёр/);
  });

  test("кейс: черновик, публикация со страницей, ссылки, порядок, удаление", async () => {
    const r = await c.req("POST", "/api/admin/cases", {
      title: "Кейс Тестпром",
      client: "Тестпром",
      excerpt: "Внедрение за 3 месяца",
      body: "<p>История внедрения</p>",
      links: [{ label: "Сайт клиента", href: "https://client.example" }],
      status: "draft",
    });
    assert.equal(r.status, 201);
    const cid = r.json.id;
    assert.doesNotMatch((await page("/")).html, /Кейс Тестпром/);
    await c.req("PATCH", `/api/admin/cases/${cid}/status`, { status: "published" });
    assert.match((await page("/")).html, /Кейс Тестпром/);
    const d = await page(`/cases/${r.json.slug}/`);
    assert.equal(d.status, 200);
    assert.match(d.html, /История внедрения/);
    assert.match(d.html, /client\.example/);
    const ids = ((await c.req("GET", "/api/admin/cases")).json as { id: number }[]).map((x) => x.id);
    await c.req("POST", "/api/admin/cases/reorder", { ids: [cid, ...ids.filter((x) => x !== cid)] });
    assert.equal((await c.req("GET", "/api/public/site")).json.cases[0].title, "Кейс Тестпром");
    assert.equal((await c.req("DELETE", `/api/admin/cases/${cid}`)).status, 204);
    assert.equal((await page(`/cases/${r.json.slug}/`)).status, 404);
  });

  test("продукт: создание, публикация, ссылка карточки, удаление", async () => {
    const r = await c.req("POST", "/api/admin/products", { title: "Тестовый продукт", excerpt: "Описание продукта", body: "<p>Подробно</p>", status: "published" });
    assert.equal(r.status, 201);
    const home = (await page("/")).html;
    assert.match(home, /Тестовый продукт/);
    assert.match(home, new RegExp(`/products/${r.json.slug}/`));
    assert.equal((await page(`/products/${r.json.slug}/`)).status, 200);
    await c.req("PATCH", `/api/admin/products/${r.json.id}/status`, { status: "draft" });
    assert.doesNotMatch((await page("/")).html, /Тестовый продукт/);
    assert.equal((await c.req("DELETE", `/api/admin/products/${r.json.id}`)).status, 204);
  });
});

describe("Тексты страниц", () => {
  const c = new Client();
  before(async () => {
    await c.login();
  });

  test("изменение текста «О нас» отражается на сайте", async () => {
    const cur = (await c.req("GET", "/api/admin/pages/about")).json;
    cur.sections.hero.title = "Новый заголовок страницы О нас";
    const r = await c.req("PUT", "/api/admin/pages/about", { sections: cur.sections, order: cur.order, seoTitle: "О компании — тест", seoDescription: cur.seoDescription });
    assert.equal(r.status, 200);
    const html = (await page("/about/")).html;
    assert.match(html, /Новый заголовок страницы О нас/);
    assert.match(html, /<title>О компании — тест/);
  });

  test("порядок секций меняется только среди разрешённых, лишние ключи отбрасываются", async () => {
    const cur = (await c.req("GET", "/api/admin/pages/about")).json;
    const reversed = [...cur.order].reverse();
    const r = await c.req("PUT", "/api/admin/pages/about", { sections: cur.sections, order: ["hero", "evil", ...reversed], seoTitle: "", seoDescription: "" });
    assert.equal(r.status, 200);
    assert.deepEqual(r.json.order, reversed);
  });

  test("небезопасные ссылки и изображения в тексте страницы отклоняются", async () => {
    const cur = (await c.req("GET", "/api/admin/pages/about")).json;
    const s = structuredClone(cur.sections);
    s.hero.buttonHref = "javascript:alert(1)";
    s.principles.image = "https://evil.example/x.png";
    const r = await c.req("PUT", "/api/admin/pages/about", { sections: s, order: cur.order });
    assert.equal(r.status, 400);
    const paths = r.json.details.map((d: any) => d.path);
    assert.ok(paths.includes("hero.buttonHref"));
    assert.ok(paths.includes("principles.image"));
  });

  test("главная, обучение и продукт редактируются", async () => {
    for (const [key, url, sec, field] of [
      ["home", "/", "hero", "tagline"],
      ["training", "/obuchen/", "hero", "title"],
      ["product", "/vnutyankaya-training/", "hero", "title"],
    ] as const) {
      const cur = (await c.req("GET", `/api/admin/pages/${key}`)).json;
      cur.sections[sec][field] = `Проверка ${key} 123`;
      const r = await c.req("PUT", `/api/admin/pages/${key}`, { sections: cur.sections, order: cur.order, seoTitle: cur.seoTitle, seoDescription: cur.seoDescription });
      assert.equal(r.status, 200, `${key}: ${JSON.stringify(r.json)}`);
      assert.match((await page(url)).html, new RegExp(`Проверка ${key} 123`));
    }
  });

  test("настройки контактов отражаются в подвале", async () => {
    const cur = (await c.req("GET", "/api/admin/settings")).json;
    const bad = await c.req("PUT", "/api/admin/settings", { ...cur, email: "не почта" });
    assert.equal(bad.status, 400);
    const r = await c.req("PUT", "/api/admin/settings", { ...cur, phone: "8 (900) 000-00-00" });
    assert.equal(r.status, 200);
    assert.match((await page("/")).html, /8 \(900\) 000-00-00/);
  });
});

describe("Медиафайлы", () => {
  const c = new Client();
  let mediaId = 0;
  let url = "";
  before(async () => {
    await c.login();
  });

  test("загрузка изображения: оптимизация в WebP и уникальное имя", async () => {
    const r = await c.req("POST", "/api/admin/media", undefined, { form: await pngFile("Логотип клиента.png") });
    assert.equal(r.status, 201, r.text);
    mediaId = r.json.id;
    url = r.json.url;
    assert.match(url, /^\/uploads\/[0-9a-f-]{36}\.webp$/);
    const f = await fetch(BASE + url);
    assert.equal(f.status, 200);
    assert.equal(f.headers.get("content-type"), "image/webp");
    assert.equal(f.headers.get("x-content-type-options"), "nosniff");
  });

  test("не-изображения и подделки отклоняются", async () => {
    const fd = new FormData();
    fd.append("file", new Blob(["<?php echo 1; ?>"], { type: "application/x-php" }), "shell.php");
    assert.equal((await c.req("POST", "/api/admin/media", undefined, { form: fd })).status, 415);
    const fake = new FormData();
    fake.append("file", new Blob(["MZ\x90\x00 not an image"], { type: "image/png" }), "virus.png");
    assert.equal((await c.req("POST", "/api/admin/media", undefined, { form: fake })).status, 415);
    const svg = new FormData();
    svg.append("file", new Blob(['<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'], { type: "image/svg+xml" }), "x.svg");
    assert.equal((await c.req("POST", "/api/admin/media", undefined, { form: svg })).status, 415);
  });

  test("загрузка без входа запрещена", async () => {
    const anon = new Client();
    assert.equal((await anon.req("POST", "/api/admin/media", undefined, { form: await pngFile() })).status, 401);
  });

  test("используемый файл нельзя удалить, замена сохраняет адрес", async () => {
    const n = await c.req("POST", "/api/admin/news", { title: "Новость с обложкой", coverId: mediaId, status: "published" });
    assert.equal(n.status, 201);
    assert.match((await page(`/news/${n.json.slug}/`)).html, new RegExp(url.replace(/[.]/g, "\\.")));
    const del = await c.req("DELETE", `/api/admin/media/${mediaId}`);
    assert.equal(del.status, 409);
    assert.equal(del.json.details[0].type, "Новость");

    const before = Buffer.from(await (await fetch(BASE + url)).arrayBuffer());
    const rep = await c.req("PUT", `/api/admin/media/${mediaId}/file`, undefined, { form: await pngFile("new.png", { r: 10, g: 200, b: 10 }) });
    assert.equal(rep.status, 200);
    assert.equal(rep.json.url, url);
    const afterBuf = Buffer.from(await (await fetch(BASE + url)).arrayBuffer());
    assert.ok(!before.equals(afterBuf), "содержимое файла заменено");

    await c.req("DELETE", `/api/admin/news/${n.json.id}`);
    assert.equal((await c.req("DELETE", `/api/admin/media/${mediaId}`)).status, 204);
    assert.equal((await fetch(BASE + url)).status, 404);
  });

  test("несуществующий медиафайл в записи — 400", async () => {
    const r = await c.req("POST", "/api/admin/news", { title: "Битая обложка", coverId: 999999 });
    assert.equal(r.status, 400);
  });
});

describe("Сохранность данных", () => {
  test("данные и сессия сохраняются после перезапуска сервера", async () => {
    const c = new Client();
    await c.login();
    const r = await c.req("POST", "/api/admin/news", { title: "Переживёт перезапуск", status: "published" });
    assert.equal(r.status, 201);
    await stopServer();
    await startServer();
    assert.equal((await c.req("GET", "/api/admin/auth/session")).status, 200);
    assert.match((await page(`/news/${r.json.slug}/`)).html, /Переживёт перезапуск/);
  });
});
