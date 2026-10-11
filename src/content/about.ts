import type { PendingContent } from "./types";

export const ABOUT_HERO = {
  eyebrow: "О нас",
  title: "О нас",
  // Оригинальный текст страницы не получен; ниже — описание продукта с главной страницы
  lead: "Информационная система по планированию и управлению тех. обслуживанием и ремонтом оборудования.",
};

export const ABOUT_PENDING: PendingContent[] = [
  {
    what: "Текст страницы «О нас»: информация о компании, её деятельности и сотрудниках",
    source: "https://cloudrepairs.ru/about/",
  },
  {
    what: "Фотографии и иллюстрации страницы «О нас»",
    source: "https://cloudrepairs.ru/about/",
  },
];
