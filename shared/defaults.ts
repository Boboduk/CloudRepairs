/**
 * Начальное содержимое CMS — текущий контент сайта (из макета Figma).
 * Используется при первичном заполнении базы данных и как запасные значения
 * для полей, которые появятся в схемах в будущем.
 */
import { HOME_HERO, HOME_STATS, MODULES, PRODUCTS, CASES, PARTNERS } from "../src/content/home";
import { TRAINING_DIRECTIONS, TRAINING_HERO } from "../src/content/training";
import { ABOUT_HERO, ABOUT_PRINCIPLES, ABOUT_TEAM } from "../src/content/about";
import * as P from "../src/content/product";
import { SEO } from "../src/content/seo";
import type { PageKey } from "./schema";

const SCREENSHOT = "/img/ui-equipment-catalog.png";
const SCREENSHOT_ALT = "Интерфейс CloudRepairs: иерархический каталог оборудования";

export const DEFAULT_HOME = {
  hero: {
    eyebrow: HOME_HERO.eyebrow,
    titleMain: "Cloud",
    titleAccent: "Repairs",
    tagline: HOME_HERO.tagline,
    lead: HOME_HERO.lead,
    primaryLabel: "Попробовать",
    secondaryLabel: "О продукте",
    secondaryHref: "/vnutyankaya-training/",
    image: SCREENSHOT,
    imageAlt: SCREENSHOT_ALT,
    chips: ["Реестр российского ПО", "Веб-браузер · Android · iOS"],
    stats: HOME_STATS.map((s) => ({ ...s })),
  },
  products: { eyebrow: "Продукты и услуги", title: "Всё для управления ТОиР — в одном месте" },
  modules: {
    eyebrow: "Облачные ремонты",
    title: "Возможности системы",
    buttonLabel: "Все функции",
    buttonHref: "/vnutyankaya-training/#funkcii",
    items: MODULES.map((m) => ({ icon: m.icon as string, title: m.title, text: m.text })),
  },
  industries: { eyebrow: "Область применения", title: "Мульти-отраслевое решение" },
  training: { eyebrow: "Обучение и консультация", title: "Курсы, обучения, консультация, сопровождение", moreLabel: "Подробнее", requestLabel: "Оставить заявку" },
  news: { eyebrow: "Новости", title: "Все о мире управления основными фондами", allLabel: "Все новости" },
  cases: { eyebrow: "Кейсы", title: "Нам доверяют", partnersTitle: "Партнеры" },
  cta: { text: "Остались вопросы? Просто задайте их нам", requestLabel: "Оставить заявку", telegramLabel: "Написать в Телеграм" },
};

export const DEFAULT_TRAINING = {
  hero: { ...TRAINING_HERO, requestLabel: "Оставить заявку", telegramLabel: "Написать в Телеграм" },
  directions: {
    items: TRAINING_DIRECTIONS.map((d) => ({ id: d.id, title: d.title, lead: d.lead, items: [...d.items], image: "", imageCaption: "" })),
  },
};

export const DEFAULT_ABOUT = {
  hero: { ...ABOUT_HERO, buttonLabel: "О продукте", buttonHref: "/vnutyankaya-training/" },
  principles: {
    eyebrow: "Принципы",
    title: "Как устроен CloudRepairs",
    items: ABOUT_PRINCIPLES.map((p, i) => ({ icon: ["users", "spark", "layers", "shield"][i] ?? "spark", title: p.title, text: p.text })),
    quote: P.SOLUTION[3],
    image: "",
    imageCaption: "",
  },
  team: {
    eyebrow: ABOUT_TEAM.title,
    title: ABOUT_TEAM.text,
    lead: ABOUT_TEAM.support,
    image: "",
    imageCaption: "",
    buttons: [
      { label: "Обучение и консультация", href: "/obuchen/" },
      { label: "Цены, тарифы", href: "/vnutyankaya-training/#ceny" },
    ],
  },
  partners: { eyebrow: "Кейсы и партнеры", title: "С кем мы работаем", casesLabel: "Кейсы", partnersLabel: "Партнеры" },
};

export const DEFAULT_PRODUCT = {
  hero: { ...P.PRODUCT_HERO, image: SCREENSHOT, imageAlt: SCREENSHOT_ALT },
  tabs: Object.fromEntries(P.PRODUCT_TABS.map((t) => [t.id, t.label])) as Record<string, string>,
  imagine: {
    title: P.IMAGINE.title,
    cases: [...P.IMAGINE.cases],
    needsTitle: P.IMAGINE.needsTitle,
    needs: [...P.IMAGINE.needs],
    field: P.IMAGINE.field,
    result: P.IMAGINE.result,
  },
  solution: { paragraphs: [...P.SOLUTION], note: P.FSM_NOTE },
  functions: {
    items: P.FUNCTIONS.map((f) => ({
      title: f.title,
      text: [...f.text],
      image: "image" in f && f.image ? f.image.src : "",
      imageAlt: "image" in f && f.image ? f.image.alt : "",
    })),
  },
  potential: {
    title: P.POTENTIAL.title,
    intro: P.POTENTIAL.intro,
    notes: [...P.POTENTIAL.notes],
    directions: P.POTENTIAL.directions.map((d) => ({ title: d.title, items: [...d.items] })),
  },
  specs: {
    title: "Платформа и технологии",
    componentsTitle: "Компоненты платформы CloudRepairs включают:",
    components: [...P.PLATFORM_COMPONENTS],
    specsTitle: "Основное",
    specs: P.SPECS.map((s) => ({ ...s })),
    stackTitle: "Технологический стек",
    stack: P.TECH_STACK.map((s) => ({ title: s.title, items: [...s.items] })),
    extraTitle: "Дополнительные функции",
    extra: [...P.EXTRA_FUNCTIONS],
  },
  application: {
    title: P.APPLICATION_AREAS.title,
    areas: P.APPLICATION_AREAS.items.map((a) => ({ label: a.label, href: a.href ?? "" })),
    industries: P.INDUSTRIES.map((i) => ({ title: i.title, items: [...i.items] })),
  },
  benefits: {
    title: "Эффект для бизнеса",
    intro: P.BENEFITS_INTRO,
    pillars: P.BENEFIT_PILLARS.map((p) => ({ ...p })),
    econTitle: "Система позволяет получить экономические выгоды:",
    econ: P.ECONOMIC_BENEFITS.map((e) => ({ ...e })),
    orgTitle: "Система позволяет получить организационные выгоды:",
    org: [...P.ORG_BENEFITS],
    keyTool: P.KEY_TOOL,
    lists: [
      { title: "Преимущества перед другими поставщиками", items: [...P.ADVANTAGES_VS_SUPPLIERS] },
      { title: "Плюсы ИС «Облачные ремонты»", items: [...P.PLUSES] },
      { title: "Применение CloudRepairs позволит", items: [...P.ALLOWS] },
      { title: "Преимущества перед конкурентами", items: [...P.VS_COMPETITORS] },
    ],
  },
  pricing: {
    title: "Тарифы и условия",
    buttonLabel: "Оставить заявку",
    blocks: P.PRICING.map((b) => ({
      title: b.title,
      lead: b.lead ?? "",
      plans: b.plans.map((pl) => ({ name: pl.name, price: pl.price ?? "", note: pl.note ?? "" })),
    })),
  },
};

export type HomeContent = typeof DEFAULT_HOME;
export type TrainingContent = typeof DEFAULT_TRAINING;
export type AboutContent = typeof DEFAULT_ABOUT;
export type ProductContent = typeof DEFAULT_PRODUCT;

export const DEFAULT_PAGES: Record<PageKey, { sections: Record<string, Record<string, unknown>>; seoTitle: string; seoDescription: string }> = {
  home: { sections: DEFAULT_HOME, seoTitle: SEO["/"].title, seoDescription: SEO["/"].description },
  training: { sections: DEFAULT_TRAINING, seoTitle: SEO["/obuchen/"].title, seoDescription: SEO["/obuchen/"].description },
  about: { sections: DEFAULT_ABOUT, seoTitle: SEO["/about/"].title, seoDescription: SEO["/about/"].description },
  product: {
    sections: DEFAULT_PRODUCT,
    seoTitle: SEO["/vnutyankaya-training/"].title,
    seoDescription: SEO["/vnutyankaya-training/"].description,
  },
};

export const DEFAULT_SETTINGS = {
  email: "Vladimir.slepov.cr@yandex.ru",
  phone: "8 (929) 220-02-45",
  phoneNote: "по вопросам приобретения сервиса",
  telegramMain: "cloudrepairs",
  telegramPersonal: "VVS_cr",
  footerTitle: "Остались вопросы? — задайте их нам на почту.",
  footerButton: "Связаться",
  copyright: "©2026 Cloudrepairs",
  headerCta: "Связаться",
};
export type SiteSettings = typeof DEFAULT_SETTINGS;

/** Начальные записи разделов (ровно то, что уже было на сайте) */
export const DEFAULT_PRODUCTS = PRODUCTS.map((p, i) => ({
  title: p.title,
  slug: ["cloudrepairs", "obuchenie-i-konsultaciya", "novosti", "komandy"][i],
  excerpt: p.text,
  linkUrl: p.num === "03" ? "/news/" : (p.to ?? ""),
  linkLabel: "",
  sortOrder: i,
}));
export const DEFAULT_CASES = CASES.map((title, i) => ({ title, slug: ["alrosa", "yatek", "aeb"][i], sortOrder: i }));
export const DEFAULT_PARTNERS = PARTNERS.map((name, i) => ({ name, sortOrder: i }));
