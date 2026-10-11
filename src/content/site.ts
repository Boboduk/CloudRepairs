/**
 * Общие данные сайта CloudRepairs.
 * Содержимое взято из макета Figma «CloudRepairs» и с cloudrepairs.ru (см. AUDIT.md).
 */

export const SITE_URL = "https://cloudrepairs.ru";
export const SITE_NAME = "CloudRepairs";

/** Вход в систему (существующая страница на cloudrepairs.ru) */
export const LOGIN_URL = "https://cloudrepairs.ru/Account/Login?ReturnUrl=/";

export const EMAIL = "Vladimir.slepov.cr@yandex.ru";

/** Ссылка «Оставить заявку»: без сервера формы — письмо с заполненной темой */
export function requestHref(subject = "Заявка с сайта CloudRepairs") {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export interface NavItem {
  label: string;
  to: string;
}

/** Навигация (пункты из макета; «Новости» скрыты — в макете нет реальных материалов) */
export const NAV: NavItem[] = [
  { label: "Продукт", to: "/vnutyankaya-training/" },
  { label: "Обучение", to: "/obuchen/" },
  { label: "Кейсы", to: "/#cases" },
  { label: "О нас", to: "/about/" },
  { label: "Партнеры", to: "/#partners" },
  { label: "Контакты", to: "#contacts" },
];

export interface Contact {
  kind: "email" | "phone" | "telegram";
  label: string;
  value: string;
  href: string;
  note?: string;
}

export const CONTACTS: Contact[] = [
  { kind: "email", label: "Почта", value: EMAIL, href: `mailto:${EMAIL}` },
  { kind: "telegram", label: "Телеграм", value: "@VVS_cr", href: "https://t.me/VVS_cr" },
  { kind: "telegram", label: "Телеграм", value: "@cloudrepairs", href: "https://t.me/cloudrepairs" },
  {
    kind: "phone",
    label: "Телефон",
    value: "8 (929) 220-02-45",
    href: "tel:+79292200245",
    note: "по вопросам приобретения сервиса",
  },
];

export const TELEGRAM_URL = "https://t.me/cloudrepairs";
