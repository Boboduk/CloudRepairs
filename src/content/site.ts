/**
 * Общие данные сайта CloudRepairs.
 *
 * ВАЖНО: всё содержимое сайта хранится в папке src/content и взято только
 * из проверенных источников (см. AUDIT.md). Там, где оригинальный текст
 * получить не удалось, стоят блоки `pending` — их нужно заполнить
 * материалами с https://cloudrepairs.ru, ничего не придумывая.
 */

export const SITE_URL = "https://cloudrepairs.ru";
export const SITE_NAME = "CloudRepairs";

/** Вход в систему (ссылка с оригинального сайта) */
export const LOGIN_URL = "https://cloudrepairs.ru/Account/Login?ReturnUrl=/";

export interface NavItem {
  label: string;
  to: string;
  external?: boolean;
}

/** Основная навигация. Пункты оригинального меню не удалось проверить —
 *  здесь перечислены известные страницы сайта. Сверьте с оригиналом. */
export const NAV: NavItem[] = [
  { label: "Главная", to: "/" },
  { label: "Обучение", to: "/obuchen/" },
  { label: "О нас", to: "/about/" },
  { label: "Внутреннее обучение", to: "/vnutyankaya-training/" },
];

export interface Contact {
  kind: "email" | "phone" | "telegram";
  label: string;
  value: string;
  href: string;
  note?: string;
}

/** Контакты, опубликованные на cloudrepairs.ru (главная и страница входа) */
export const CONTACTS: Contact[] = [
  {
    kind: "email",
    label: "E-mail",
    value: "vladimir.slepov.cr@yandex.ru",
    href: "mailto:vladimir.slepov.cr@yandex.ru",
  },
  {
    kind: "phone",
    label: "Телефон",
    value: "8 (929) 220-02-45",
    href: "tel:+79292200245",
    note: "по вопросам приобретения сервиса",
  },
  { kind: "telegram", label: "Telegram", value: "@cloudrepairs", href: "https://t.me/cloudrepairs" },
  { kind: "telegram", label: "Telegram", value: "@VVS_cr", href: "https://t.me/VVS_cr" },
];
