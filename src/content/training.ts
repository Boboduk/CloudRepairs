import type { PendingContent } from "./types";

// Дословные фрагменты раздела «Обучение и консультация» (из поисковой выдачи)

export const TRAINING_HERO = {
  eyebrow: "Обучение и консультация",
  title: "Обучение и консультация",
  lead: "Курсы, обучения, консультация, сопровождение.",
};

export const TRAINING_SECTIONS = [
  {
    id: "obuchenie",
    title: "Обучение",
    items: ["Персональные и групповые консультации руководителей ремонтных служб различного уровня"],
    pending: {
      what: "Полное описание программ обучения (в т. ч. для линейных специалистов и инженеров), формат и условия",
      source: "https://cloudrepairs.ru/obuchen/",
    } as PendingContent,
  },
  {
    id: "konsultaciya",
    title: "Консультация и сопровождение",
    items: [
      "Сопровождение качества и эффективности внедрения программ развития ТОиР",
      "Консультации на этапе обследования предприятия и разработки стратегий ТОиР",
      "Внедрение ИТ проектов",
      "Реинжиниринг процессов ТОиР и реорганизация",
    ],
    pending: undefined as PendingContent | undefined,
  },
];

export const TRAINING_PENDING: PendingContent[] = [
  {
    what: "Остальные блоки страницы «Обучение»: изображения, тексты, кнопки",
    source: "https://cloudrepairs.ru/obuchen/",
  },
];
