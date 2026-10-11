// Пререндер: создаёт dist/<route>/index.html для каждой страницы и dist/404.html.
// Сайт становится статическим — подходит для любого хостинга без настройки rewrite.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const { render, ROUTES } = await import(pathToFileURL(path.join(root, "dist-ssr", "entry-server.js")).href);

function write(url, file) {
  const { html, head } = render(url);
  const out = template
    .replace("<!--app-head-->", head)
    .replace('<div id="root">', `<div id="root" data-path="${url}">`)
    .replace("<!--app-html-->", html);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, out);
  console.log("  prerendered", url, "→", path.relative(root, file));
}

for (const url of ROUTES) {
  write(url, path.join(dist, url, "index.html"));
}
write("/404", path.join(dist, "404.html"));

// sitemap.xml
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map((r) => `  <url><loc>https://cloudrepairs.ru${r}</loc></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemap);
fs.rmSync(path.join(root, "dist-ssr"), { recursive: true, force: true });
console.log("  sitemap.xml written");
