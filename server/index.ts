import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import { config } from "./config";
import { closeDb, getDb } from "./db";
import { seed } from "./db/seed";
import { apiErrorHandler, HttpError } from "./http";
import { loadSession, requireAdmin } from "./auth/session";
import { authRoutes } from "./routes/auth";
import { newsRoutes } from "./routes/news";
import { partnerRoutes } from "./routes/partners";
import { caseRoutes } from "./routes/cases";
import { productRoutes } from "./routes/products";
import { pageRoutes } from "./routes/pages";
import { mediaRoutes } from "./routes/media";
import { settingsRoutes, statsRoute } from "./routes/settings";
import { publicRoutes } from "./routes/public";
import { buildHead, loadInitialData, renderPage } from "./ssr";
import type { InitialData } from "../shared/types";

type RenderFn = (url: string, data: InitialData) => { html: string };

async function main() {
  const db = getDb();
  seed(db);

  const app = express();
  app.disable("x-powered-by");
  if (config.trustProxy) app.set("trust proxy", 1);

  // Nonce для единственного встроенного скрипта страницы
  app.use((_req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString("base64");
    next();
  });

  app.use(
    helmet({
      contentSecurityPolicy: config.isProd
        ? {
            useDefaults: true,
            directives: {
              "default-src": ["'self'"],
              "script-src": ["'self'", (_req, res) => `'nonce-${(res as Response).locals.nonce}'`],
              "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
              "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
              "img-src": ["'self'", "data:", "blob:"],
              "connect-src": ["'self'"],
              "frame-ancestors": ["'none'"],
              "form-action": ["'self'"],
              "object-src": ["'none'"],
              "base-uri": ["'self'"],
              "upgrade-insecure-requests": config.cookieSecure ? [] : null,
            },
          }
        : false, // в режиме разработки Vite использует встроенные скрипты
      crossOriginEmbedderPolicy: false,
      strictTransportSecurity: config.cookieSecure,
    }),
  );

  // ---------- API ----------
  const api = express.Router();
  api.use(express.json({ limit: "2mb" }));
  api.use((_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  api.use("/public", publicRoutes(db));
  api.use("/admin", loadSession(db));
  api.use("/admin/auth", authRoutes(db));
  api.use("/admin", requireAdmin);
  api.get("/admin/stats", statsRoute(db));
  api.use("/admin/news", newsRoutes(db));
  api.use("/admin/partners", partnerRoutes(db));
  api.use("/admin/cases", caseRoutes(db));
  api.use("/admin/products", productRoutes(db));
  api.use("/admin/pages", pageRoutes(db));
  api.use("/admin/media", mediaRoutes(db));
  api.use("/admin/settings", settingsRoutes(db));
  api.use((_req, _res, next) => next(new HttpError(404, "Метод API не найден")));
  api.use(apiErrorHandler);
  app.use("/api", api);

  // ---------- Загруженные изображения ----------
  fs.mkdirSync(config.uploadsDir, { recursive: true });
  app.use(
    "/uploads",
    express.static(config.uploadsDir, {
      index: false,
      dotfiles: "deny",
      fallthrough: false,
      setHeaders: (res) => {
        res.setHeader("Content-Type", "image/webp");
        res.setHeader("X-Content-Type-Options", "nosniff");
        // адрес файла сохраняется при замене — браузер перепроверяет его по ETag
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        res.setHeader("Content-Disposition", "inline");
      },
    }),
  );

  // ---------- Клиентские приложения ----------
  let getTemplate: (name: "index" | "admin", url: string) => Promise<string>;
  let getRender: () => Promise<RenderFn>;

  if (!config.isProd) {
    const { createServer } = await import("vite");
    // настройки передаются напрямую: Vite не создаёт временный vite.config.ts.timestamp-*.mjs,
    // из-за которого tsx watch перезапускал сервер по кругу
    const configUrl = pathToFileURL(path.join(config.root, "vite.config.ts")).href;
    const { default: viteConfig } = (await import(/* @vite-ignore */ configUrl)) as { default: import("vite").InlineConfig };
    const vite = await createServer({ ...viteConfig, configFile: false, server: { middlewareMode: true }, appType: "custom" });
    app.use(vite.middlewares);
    getTemplate = async (name, url) => vite.transformIndexHtml(url, fs.readFileSync(path.join(config.root, `${name}.html`), "utf8"));
    getRender = async () => (await vite.ssrLoadModule("/src/entry-server.tsx")).render as RenderFn;
  } else {
    const clientDir = path.join(config.root, "dist", "client");
    const templates = {
      index: fs.readFileSync(path.join(clientDir, "index.html"), "utf8"),
      admin: fs.readFileSync(path.join(clientDir, "admin.html"), "utf8"),
    };
    const ssrEntry = path.join(config.root, "dist", "ssr", "entry-server.js");
    const mod = (await import(/* @vite-ignore */ "file://" + ssrEntry)) as { render: RenderFn };
    getTemplate = async (name) => templates[name];
    getRender = async () => mod.render;
    app.use(
      "/assets",
      express.static(path.join(clientDir, "assets"), { index: false, immutable: true, maxAge: "1y", fallthrough: false }),
    );
    app.use(express.static(clientDir, { index: false, maxAge: "1h" }));
  }

  // Админ-панель: клиентское приложение, без индексации поисковиками
  app.get(["/admin", "/admin/*splat"], async (req, res, next) => {
    try {
      const nonce = res.locals.nonce as string;
      const html = (await getTemplate("admin", req.originalUrl)).replace(/<script(?=[^>]*>document\.documentElement)/, `<script nonce="${nonce}"`);
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
      res.setHeader("Cache-Control", "no-store");
      res.type("html").send(html);
    } catch (e) {
      next(e);
    }
  });

  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(`User-agent: *\nDisallow: /admin\nDisallow: /api/\nAllow: /\n\nSitemap: ${config.publicUrl}/sitemap.xml\n`);
  });

  app.get("/sitemap.xml", (_req, res) => {
    const { data } = loadInitialData(db, "/");
    const urls = ["/", "/vnutyankaya-training/", "/obuchen/", "/about/", "/news/", "/cases/"];
    data.site.news.forEach((n) => urls.push(`/news/${n.slug}/`));
    data.site.cases.filter((c) => c.hasPage).forEach((c) => urls.push(`/cases/${c.slug}/`));
    data.site.products.filter((p) => p.href?.startsWith("/products/")).forEach((p) => urls.push(p.href!));
    const body = urls.map((u) => `  <url><loc>${config.publicUrl}${u}</loc></url>`).join("\n");
    res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
  });

  // Публичный сайт: серверный рендеринг с актуальными данными из БД
  app.get(["/", "/*splat"], async (req, res, next) => {
    try {
      const url = req.originalUrl;
      const pathname = decodeURIComponent(url.split("?")[0]);
      // единый вид адресов: со слешем на конце
      if (!pathname.endsWith("/") && !path.extname(pathname)) {
        const qs = url.includes("?") ? url.slice(url.indexOf("?")) : "";
        return res.redirect(301, pathname + "/" + qs);
      }
      if (path.extname(pathname)) throw new HttpError(404, "Not found");
      const { data, status } = loadInitialData(db, pathname);
      const render = await getRender();
      const { html } = render(pathname, data);
      const template = await getTemplate("index", url);
      res.status(status);
      res.setHeader("Cache-Control", "no-cache");
      res.type("html").send(renderPage(template, { head: buildHead(data), html, data, nonce: res.locals.nonce as string }));
    } catch (e) {
      next(e);
    }
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    // 404 от express.static (нет файла) и от маршрутов
    const status = err instanceof HttpError ? err.status : (err as { status?: number; statusCode?: number })?.status;
    if (status === 404) return res.status(404).type("text/plain").send("Not found");
    if (status === 400 || status === 403) return res.status(status).type("text/plain").send("Bad request");
    console.error("[server]", err);
    res.status(500).type("text/plain").send("Внутренняя ошибка сервера");
  });

  const server = app.listen(config.port, config.host, (err?: Error) => {
    if (err) return; // ошибка обрабатывается ниже, в server.on("error")
    console.log(`CloudRepairs: http://${config.host === "0.0.0.0" ? "localhost" : config.host}:${config.port} (${config.isProd ? "production" : "development"})`);
  });
  server.on("error", (e: NodeJS.ErrnoException) => {
    if (e.code === "EADDRINUSE") {
      console.error(`\nПорт ${config.port} уже занят — скорее всего, сервер уже запущен в другом окне терминала.\nЗакройте его (Ctrl+C) или запустите на другом порту:\n  macOS/Linux:  PORT=3001 npm run dev\n  Windows:      set PORT=3001&& npm run dev   (PowerShell: $env:PORT=3001; npm run dev)\n`);
    } else if (e.code === "EACCES") {
      console.error(`\nНет прав открыть порт ${config.port}. Укажите порт больше 1024: PORT=3000\n`);
    } else {
      console.error(e);
    }
    process.exit(1);
  });
  const shutdown = () => {
    server.close(() => {
      closeDb();
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
