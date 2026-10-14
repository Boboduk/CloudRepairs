/**
 * Схемы редактируемых страниц.
 *
 * Описывают, какие поля каждой секции может менять администратор. По схеме строится
 * форма в админке и выполняется серверная валидация — поэтому изменить можно только
 * предусмотренные тексты, изображения, ссылки и порядок разрешённых секций, но не вёрстку.
 */

export const ICON_OPTIONS = [
  { value: "catalog", label: "Каталог" },
  { value: "planning", label: "Календарь" },
  { value: "staff", label: "Сотрудники" },
  { value: "techcard", label: "Документ" },
  { value: "cabinet", label: "Задачи" },
  { value: "monitor", label: "Монитор" },
  { value: "skills", label: "Звезда" },
  { value: "optimize", label: "Спидометр" },
  { value: "gantt", label: "Диаграмма" },
  { value: "auto", label: "Шестерёнка" },
  { value: "users", label: "Люди" },
  { value: "route", label: "Маршрут" },
  { value: "shield", label: "Щит" },
  { value: "spark", label: "Искра" },
  { value: "layers", label: "Слои" },
  { value: "factory", label: "Завод" },
  { value: "devices", label: "Устройства" },
] as const;

export type FieldType = "text" | "textarea" | "richtext" | "image" | "url" | "select" | "strings" | "items";

interface BaseField {
  key: string;
  label: string;
  help?: string;
}

export type Field =
  | (BaseField & { type: "text" | "textarea"; max?: number; required?: boolean })
  | (BaseField & { type: "richtext" })
  | (BaseField & { type: "image" })
  | (BaseField & { type: "url"; required?: boolean })
  | (BaseField & { type: "select"; options: readonly { value: string; label: string }[] })
  | (BaseField & { type: "strings"; itemLabel?: string; max?: number; multiline?: boolean })
  | (BaseField & { type: "items"; itemLabel: string; fields: Field[]; max?: number; titleKey?: string });

export interface SectionSchema {
  key: string;
  label: string;
  help?: string;
  fields: Field[];
}

export type PageKey = "home" | "training" | "about" | "product";

export interface PageSchema {
  key: PageKey;
  label: string;
  path: string;
  sections: SectionSchema[];
  /** Секции, порядок которых можно менять (остальные стоят на своих местах) */
  orderable: string[];
}

const t = (key: string, label: string, max = 300, help?: string): Field => ({ type: "text", key, label, max, help });
const ta = (key: string, label: string, max = 3000, help?: string): Field => ({ type: "textarea", key, label, max, help });
const img = (key: string, label: string, help?: string): Field => ({ type: "image", key, label, help });
const url = (key: string, label: string, help?: string): Field => ({ type: "url", key, label, help });
const strs = (key: string, label: string, itemLabel = "Пункт", multiline = true): Field => ({ type: "strings", key, label, itemLabel, multiline, max: 60 });
const icon: Field = { type: "select", key: "icon", label: "Иконка", options: ICON_OPTIONS };
const titledLists = (key: string, label: string, itemLabel: string): Field => ({
  type: "items",
  key,
  label,
  itemLabel,
  titleKey: "title",
  fields: [t("title", "Заголовок"), strs("items", "Пункты")],
});

export const PAGE_SCHEMAS: Record<PageKey, PageSchema> = {
  home: {
    key: "home",
    label: "Главная",
    path: "/",
    orderable: ["products", "modules", "industries", "training", "news", "cases"],
    sections: [
      {
        key: "hero",
        label: "Первый экран",
        fields: [
          t("eyebrow", "Надзаголовок"),
          t("titleMain", "Заголовок — первая часть", 40),
          t("titleAccent", "Заголовок — выделенная часть", 40),
          t("tagline", "Слоган"),
          ta("lead", "Описание", 600),
          t("primaryLabel", "Текст основной кнопки (открывает письмо-заявку)", 60),
          t("secondaryLabel", "Текст второй кнопки", 60),
          url("secondaryHref", "Ссылка второй кнопки"),
          img("image", "Скриншот системы"),
          t("imageAlt", "Описание изображения (alt)"),
          strs("chips", "Плашки на скриншоте", "Плашка", false),
          {
            type: "items",
            key: "stats",
            label: "Цифры под первым экраном",
            itemLabel: "Показатель",
            titleKey: "value",
            max: 6,
            fields: [t("value", "Значение", 30), t("label", "Подпись", 200)],
          },
        ],
      },
      {
        key: "products",
        label: "Продукты и услуги",
        help: "Карточки продуктов редактируются в разделе «Продукты».",
        fields: [t("eyebrow", "Надзаголовок"), t("title", "Заголовок")],
      },
      {
        key: "modules",
        label: "Возможности системы",
        fields: [
          t("eyebrow", "Надзаголовок"),
          t("title", "Заголовок"),
          t("buttonLabel", "Текст кнопки", 60),
          url("buttonHref", "Ссылка кнопки"),
          { type: "items", key: "items", label: "Модули", itemLabel: "Модуль", titleKey: "title", max: 30, fields: [icon, t("title", "Название"), ta("text", "Описание", 1500)] },
        ],
      },
      {
        key: "industries",
        label: "Область применения",
        help: "Список отраслей берётся со страницы продукта (раздел «Область применения»).",
        fields: [t("eyebrow", "Надзаголовок"), t("title", "Заголовок")],
      },
      {
        key: "training",
        label: "Обучение (вкладки)",
        help: "Вкладки и их тексты берутся со страницы «Обучение».",
        fields: [t("eyebrow", "Надзаголовок"), t("title", "Заголовок"), t("moreLabel", "Текст кнопки «Подробнее»", 60), t("requestLabel", "Текст кнопки заявки", 60)],
      },
      {
        key: "news",
        label: "Новости",
        help: "Показывается, только если есть опубликованные новости: первые 3 новости и кнопка на страницу всех новостей. Новости редактируются в разделе «Новости».",
        fields: [t("eyebrow", "Надзаголовок"), t("title", "Заголовок"), t("allLabel", "Текст ссылки «Все новости»", 60)],
      },
      {
        key: "cases",
        label: "Кейсы и партнеры",
        help: "Кейсы и партнеры редактируются в одноимённых разделах.",
        fields: [
          t("eyebrow", "Надзаголовок"),
          t("title", "Заголовок кейсов"),
          t("allLabel", "Текст кнопки «Все кейсы»", 60, "На главной показываются первые 3 кейса, остальные — на странице /cases/."),
          t("partnersTitle", "Заголовок партнеров"),
        ],
      },
      {
        key: "cta",
        label: "Плашка «Остались вопросы?»",
        fields: [t("text", "Текст"), t("requestLabel", "Кнопка заявки", 60), t("telegramLabel", "Кнопка Телеграм", 60)],
      },
    ],
  },

  training: {
    key: "training",
    label: "Обучение",
    path: "/obuchen/",
    orderable: [],
    sections: [
      {
        key: "hero",
        label: "Первый экран",
        fields: [t("eyebrow", "Надзаголовок"), t("title", "Заголовок"), ta("lead", "Описание", 600), t("requestLabel", "Кнопка заявки", 60), t("telegramLabel", "Кнопка Телеграм", 60)],
      },
      {
        key: "directions",
        label: "Направления",
        help: "Эти же направления показываются вкладками на главной странице.",
        fields: [
          {
            type: "items",
            key: "items",
            label: "Направления",
            itemLabel: "Направление",
            titleKey: "title",
            max: 8,
            fields: [
              t("id", "Якорь в адресе (латиница)", 40, "Например: konsultacii → /obuchen/#konsultacii"),
              t("title", "Название"),
              ta("lead", "Описание", 1500),
              strs("items", "Пункты"),
              img("image", "Изображение (необязательно)"),
              t("imageCaption", "Подпись к изображению"),
            ],
          },
        ],
      },
    ],
  },

  about: {
    key: "about",
    label: "О нас",
    path: "/about/",
    orderable: ["principles", "team", "partners"],
    sections: [
      {
        key: "hero",
        label: "Первый экран",
        fields: [t("eyebrow", "Надзаголовок"), t("title", "Заголовок"), ta("lead", "Описание", 800), t("buttonLabel", "Текст кнопки", 60), url("buttonHref", "Ссылка кнопки")],
      },
      {
        key: "principles",
        label: "Принципы",
        fields: [
          t("eyebrow", "Надзаголовок"),
          t("title", "Заголовок"),
          { type: "items", key: "items", label: "Карточки", itemLabel: "Карточка", titleKey: "title", max: 12, fields: [icon, t("title", "Заголовок"), ta("text", "Текст", 1000)] },
          ta("quote", "Цитата под карточками", 1200),
          img("image", "Изображение (необязательно)"),
          t("imageCaption", "Подпись к изображению"),
        ],
      },
      {
        key: "team",
        label: "Команды",
        fields: [
          t("eyebrow", "Надзаголовок"),
          t("title", "Заголовок"),
          ta("lead", "Текст", 1500),
          img("image", "Фотография (необязательно)"),
          t("imageCaption", "Подпись к фотографии"),
          {
            type: "items",
            key: "buttons",
            label: "Кнопки",
            itemLabel: "Кнопка",
            titleKey: "label",
            max: 3,
            fields: [t("label", "Текст", 60), url("href", "Ссылка")],
          },
        ],
      },
      {
        key: "partners",
        label: "Кейсы и партнеры",
        help: "Списки берутся из разделов «Кейсы» и «Партнеры».",
        fields: [t("eyebrow", "Надзаголовок"), t("title", "Заголовок"), t("casesLabel", "Подпись списка кейсов", 60), t("partnersLabel", "Подпись списка партнеров", 60)],
      },
    ],
  },

  product: {
    key: "product",
    label: "Продукт CloudRepairs (внутреннее обучение)",
    path: "/vnutyankaya-training/",
    orderable: [],
    sections: [
      {
        key: "hero",
        label: "Первый экран",
        fields: [t("eyebrow", "Надзаголовок"), t("title", "Заголовок"), ta("lead", "Описание", 600), img("image", "Скриншот"), t("imageAlt", "Описание изображения (alt)")],
      },
      {
        key: "tabs",
        label: "Названия разделов (навигация)",
        fields: [t("funkcii", "Функции", 60), t("harakteristiki", "Характеристики", 60), t("primenenie", "Область применения", 60), t("vygody", "Выгоды пользователя", 60), t("ceny", "Цены, тарифы", 60)],
      },
      {
        key: "imagine",
        label: "Функции: «Представьте»",
        fields: [t("title", "Заголовок"), strs("cases", "Ситуации"), ta("needsTitle", "Заголовок списка требований", 400), strs("needs", "Требования"), ta("field", "Примечание", 600), ta("result", "Итог", 1200)],
      },
      {
        key: "solution",
        label: "Функции: решение",
        fields: [strs("paragraphs", "Абзацы (первый — крупный)", "Абзац"), ta("note", "Сноска", 600)],
      },
      {
        key: "functions",
        label: "Функции: список",
        fields: [
          {
            type: "items",
            key: "items",
            label: "Функции",
            itemLabel: "Функция",
            titleKey: "title",
            max: 20,
            fields: [
              t("title", "Название"),
              strs("text", "Абзацы", "Абзац"),
              {
                type: "items",
                key: "images",
                label: "Скриншоты (карусель)",
                itemLabel: "Скриншот",
                titleKey: "alt",
                max: 12,
                help: "Один скриншот показывается картинкой, несколько — каруселью.",
                fields: [img("image", "Изображение"), t("alt", "Описание изображения")],
              },
            ],
          },
        ],
      },
      {
        key: "potential",
        label: "Функции: потенциал развития",
        fields: [t("title", "Заголовок"), ta("intro", "Вступление", 1200), strs("notes", "Примечания"), titledLists("directions", "Направления", "Направление")],
      },
      {
        key: "specs",
        label: "Характеристики",
        fields: [
          t("title", "Заголовок"),
          t("componentsTitle", "Заголовок списка компонентов"),
          strs("components", "Компоненты платформы"),
          t("specsTitle", "Заголовок таблицы"),
          { type: "items", key: "specs", label: "Строки таблицы", itemLabel: "Строка", titleKey: "label", max: 30, fields: [t("label", "Параметр"), ta("value", "Значение", 600)] },
          t("stackTitle", "Заголовок технологического стека"),
          titledLists("stack", "Технологический стек", "Группа"),
          t("extraTitle", "Заголовок доп. функций"),
          strs("extra", "Дополнительные функции", "Функция", false),
        ],
      },
      {
        key: "application",
        label: "Область применения",
        fields: [
          t("title", "Заголовок"),
          { type: "items", key: "areas", label: "Направления применения", itemLabel: "Направление", titleKey: "label", max: 30, fields: [t("label", "Название"), url("href", "Ссылка (необязательно)")] },
          titledLists("industries", "Отрасли", "Отрасль"),
        ],
      },
      {
        key: "benefits",
        label: "Выгоды пользователя",
        fields: [
          t("title", "Заголовок"),
          ta("intro", "Вступление", 1200),
          { type: "items", key: "pillars", label: "Основные эффекты", itemLabel: "Эффект", titleKey: "title", max: 6, fields: [t("title", "Заголовок"), ta("text", "Текст", 1200)] },
          t("econTitle", "Заголовок экономических выгод"),
          { type: "items", key: "econ", label: "Экономические выгоды", itemLabel: "Показатель", titleKey: "value", max: 6, fields: [t("value", "Значение", 30), t("label", "Подпись")] },
          t("orgTitle", "Заголовок организационных выгод"),
          strs("org", "Организационные выгоды"),
          ta("keyTool", "Ключевая фраза", 600),
          titledLists("lists", "Списки преимуществ", "Список"),
        ],
      },
      {
        key: "pricing",
        label: "Цены, тарифы",
        fields: [
          t("title", "Заголовок"),
          t("buttonLabel", "Текст кнопки заявки", 60),
          {
            type: "items",
            key: "blocks",
            label: "Тарифные блоки",
            itemLabel: "Блок",
            titleKey: "title",
            max: 8,
            fields: [
              t("title", "Название"),
              ta("lead", "Описание", 1500),
              {
                type: "items",
                key: "plans",
                label: "Тарифы",
                itemLabel: "Тариф",
                titleKey: "name",
                max: 8,
                fields: [t("name", "Название"), t("price", "Цена", 60), ta("note", "Примечание", 600)],
              },
            ],
          },
        ],
      },
    ],
  },
};

export const PAGE_KEYS = Object.keys(PAGE_SCHEMAS) as PageKey[];
