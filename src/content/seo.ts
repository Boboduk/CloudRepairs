import type { PageSeo } from "./types";

/**
 * Title и description страниц. Для главной title совпадает с оригиналом
 * (по данным поисковой выдачи). Для остальных страниц оригинальные
 * метаданные не получены — указаны нейтральные значения, сверьте их
 * с cloudrepairs.ru и замените при необходимости.
 */
export const SEO: Record<string, PageSeo> = {
  "/": {
    path: "/",
    title: "CloudRepairs: автоматизация ТОиР Планирование и управление",
    description: "Информационная система по планированию и управлению техническим обслуживанием и ремонтом оборудования.",
  },
  "/obuchen/": {
    path: "/obuchen/",
    title: "Обучение и консультация — CloudRepairs",
    description: "Курсы, обучения, консультация, сопровождение.",
  },
  "/about/": {
    path: "/about/",
    title: "О нас — CloudRepairs",
    description: "CloudRepairs — информационная система по планированию и управлению техническим обслуживанием и ремонтом оборудования.",
  },
  "/vnutyankaya-training/": {
    path: "/vnutyankaya-training/",
    title: "Внутреннее обучение — CloudRepairs",
    description: "Внутреннее обучение CloudRepairs.",
  },
};

export const NOT_FOUND_SEO: PageSeo = {
  path: "/404",
  title: "Страница не найдена — CloudRepairs",
  description: "Запрошенная страница не найдена.",
};
