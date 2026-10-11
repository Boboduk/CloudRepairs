# CloudRepairs — новая версия сайта

Современный адаптивный сайт CloudRepairs на **React + TypeScript + Vite** с пререндером страниц
(каждый URL отдаётся готовым HTML — хорошо для SEO и любого статического хостинга).

> ⚠️ Оригинальный сайт был недоступен из среды разработки. Содержание собрано только из
> проверенных фрагментов; пробелы честно помечены на страницах. Подробности — в [AUDIT.md](AUDIT.md).

## Запуск

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production-сборка в dist/ (с пререндером)
npm run preview    # просмотр сборки: http://localhost:4173
```

Требуется Node.js 18+.

## Страницы

| URL | Файл |
|---|---|
| `/` | `src/pages/HomePage.tsx` |
| `/obuchen/` | `src/pages/TrainingPage.tsx` |
| `/about/` | `src/pages/AboutPage.tsx` |
| `/vnutyankaya-training/` | `src/pages/InternalTrainingPage.tsx` |
| любой другой | `src/pages/NotFoundPage.tsx` → `dist/404.html` |

## Структура

```
index.html                 шаблон (шрифт Onest, места для пререндера)
public/                    favicon.svg, robots.txt (+ сюда изображения)
scripts/prerender.mjs      пререндер страниц, 404.html, sitemap.xml
src/
  content/                 ВСЁ содержание сайта (тексты, контакты, SEO) — правится здесь
    site.ts                навигация, контакты, ссылка «Войти в систему»
    seo.ts                 title / description страниц
    home.ts training.ts about.ts internalTraining.ts
  components/              Header (+ мобильное меню), Footer, Logo, Button, Section, PageHero,
                           FeatureGrid, ContactsBlock, Gallery (лайтбокс), Pending, Seo, Icon, Layout
  pages/                   страницы + общие стили pages.module.css
  styles/global.css        дизайн-система: цвета, типографика, сетка, отступы
  App.tsx                  маршруты
  main.tsx                 клиентский вход (гидратация пререндера)
  entry-server.tsx         серверный рендер для пререндера
```

## Как добавить оригинальные материалы

- **Тексты** — в `src/content/*.ts`. После заполнения удалите соответствующие элементы
  из массивов `*_PENDING` — жёлтые блоки исчезнут.
- **Изображения внутреннего обучения** — положите файлы в `public/images/training/` и
  добавьте в `INTERNAL_GALLERY` (`src/content/internalTraining.ts`):
  `{ src: "/images/training/01.jpg", alt: "Описание", caption: "Подпись" }`. Галерея
  с увеличением (клавиши ←/→/Esc, свайп) включится автоматически.
- **Логотип и цвета** — `src/components/Logo.tsx`, `public/favicon.svg`, переменные `--c-*`.

## Функции, требующие сервера

Форм обратной связи в подтверждённом содержании оригинала нет, поэтому отправка форм
не реализована. Вход в систему ведёт на существующую страницу
`https://cloudrepairs.ru/Account/Login?ReturnUrl=/`. Контакты — ссылки `mailto:`, `tel:` и Telegram.

## Размещение на хостинге

`npm run build` создаёт полностью статическую папку `dist/`:

```
dist/index.html
dist/obuchen/index.html
dist/about/index.html
dist/vnutyankaya-training/index.html
dist/404.html, sitemap.xml, robots.txt, assets/
```

- **Nginx / Apache / любой shared-хостинг** — загрузите содержимое `dist/` в корень сайта.
  URL со слешем на конце работают без rewrite-правил. Для 404 в Nginx: `error_page 404 /404.html;`
- **Netlify / Vercel / Cloudflare Pages** — команда сборки `npm run build`, папка `dist`.
- Сайт стоит на том же домене, что и система (`/Account/Login`) — при размещении убедитесь,
  что маршруты приложения CloudRepairs не перекрываются статикой.
