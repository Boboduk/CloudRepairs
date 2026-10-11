import type { PendingContent } from "./types";

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

export const INTERNAL_HERO = {
  eyebrow: "Внутреннее обучение",
  title: "Внутреннее обучение",
  lead: undefined as string | undefined,
};

/**
 * Материалы страницы (презентации, фотографии). Добавьте сюда оригинальные
 * изображения из https://cloudrepairs.ru/vnutyankaya-training/, положив файлы
 * в public/images/training/ — галерея с увеличением включится автоматически.
 */
export const INTERNAL_GALLERY: GalleryImage[] = [];

export const INTERNAL_PENDING: PendingContent[] = [
  {
    what: "Содержание страницы «Внутреннее обучение»: тексты, разделы, обучающие материалы",
    source: "https://cloudrepairs.ru/vnutyankaya-training/",
  },
  {
    what: "Изображения, презентации и галереи страницы",
    source: "https://cloudrepairs.ru/vnutyankaya-training/",
  },
];
