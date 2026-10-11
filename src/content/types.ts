/** Блок, оригинальное содержание которого не удалось получить */
export interface PendingContent {
  /** Что должно быть на этом месте */
  what: string;
  /** Где взять оригинал */
  source: string;
}

export interface Feature {
  title: string;
  /** Оригинальный текст. Если не получен — undefined, и карточка показывает отметку */
  text?: string;
  list?: string[];
  icon: "catalog" | "planning" | "auto" | "cabinet" | "notify" | "staff" | "techcard" | "gantt";
}

export interface PageSeo {
  path: string;
  title: string;
  description: string;
}
