# CloudRepairs — сайт

Адаптивный сайт CloudRepairs («Облачные ремонты») на **React + TypeScript + Vite** с пререндером
страниц: каждый URL отдаётся готовым HTML (SEO, любой статический хостинг).

Содержимое — из макета Figma «CloudRepairs» и cloudrepairs.ru; дизайн — новый.
Что откуда взято и что не перенесено — в [AUDIT.md](AUDIT.md).

## Запуск

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production-сборка в dist/ (с пререндером)
npm run preview    # просмотр сборки: http://localhost:4173
```

Node.js 18+.

## Страницы

| URL | Страница |
|---|---|
| `/` | Главная |
| `/vnutyankaya-training/` | Продукт CloudRepairs: функции, характеристики, область применения, выгоды, тарифы |
| `/obuchen/` | Обучение и консультация |
| `/about/` | О нас |
| остальные | 404 (`dist/404.html`) |

## Дизайн-система

- Цвета (из макета): тёмно-синий `#082765`, текст `#194768`, салатовый `#A3D20C`, кремовый `#FBF8EF`,
  голубой из логотипа `#29ABE2` — переменные в `src/styles/global.css`.
- Шрифты: **Unbounded** (заголовки; замена коммерческого Etelka Wide из макета) и **Onest** (текст).
- Компоненты: `Header` (+ мобильное меню), `Footer` (контакты, якорь `#contacts`), `Section`, `PageHero`,
  `Button`, `BrowserFrame` (скриншот с увеличением), `SubNav` (липкая навигация по разделам),
  `CtaBand`, `Icon`, `Seo`, `Layout` (прокрутка к якорям, появление блоков при прокрутке).

## Структура

```
public/brand/            логотип и символ из макета
public/img/              скриншот интерфейса системы
scripts/prerender.mjs    пререндер страниц, 404.html, sitemap.xml
src/content/             ВСЕ тексты сайта: site.ts, home.ts, product.ts, training.ts, about.ts, seo.ts
src/components/          общие компоненты
src/pages/               страницы и их стили
src/styles/global.css    токены дизайн-системы
```

## Заявки

Кнопки «Оставить заявку», «Попробовать», «Связаться» открывают письмо на
`Vladimir.slepov.cr@yandex.ru` с заполненной темой (`requestHref` в `src/content/site.ts`).
Серверной формы нет: чтобы принимать заявки на сайте, нужен обработчик (почтовый сервис или API).
«Войти» ведёт на существующую страницу `https://cloudrepairs.ru/Account/Login?ReturnUrl=/`.

## Размещение

`npm run build` создаёт статическую папку `dist/`.

- Nginx / Apache / shared-хостинг — загрузите содержимое `dist/` в корень сайта
  (для Nginx: `error_page 404 /404.html;`).
- Netlify / Vercel / Cloudflare Pages — команда `npm run build`, папка `dist`.
- Сайт делит домен с системой (`/Account/Login`): маршруты приложения не должны перекрываться статикой.
