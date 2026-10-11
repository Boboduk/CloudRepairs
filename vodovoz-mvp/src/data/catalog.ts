import type { OrderStatus, RecurringInterval, WaterType } from "@/types";

export const VOLUME_PRESETS = [1, 2, 3, 5, 10];

export const WATER_TYPES: { id: WaterType; title: string; short: string; hint: string; pricePerM3: number }[] = [
  { id: "drinking", title: "Питьевая", short: "Питьевая вода", hint: "Для питья и приготовления пищи", pricePerM3: 480 },
  { id: "technical", title: "Техническая", short: "Техническая вода", hint: "Полив, стройка, бассейн", pricePerM3: 320 },
  { id: "household", title: "Хоз. нужды", short: "Вода для хоз. нужд", hint: "Стирка, баня, уборка", pricePerM3: 390 },
];

export const DELIVERY_BASE_PRICE = 300;

export const RECURRING_INTERVALS: { id: RecurringInterval; title: string }[] = [
  { id: "weekly", title: "Каждую неделю" },
  { id: "biweekly", title: "Раз в 2 недели" },
  { id: "monthly", title: "Раз в месяц" },
];

export const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
export const WEEKDAYS_FULL = ["понедельник", "вторник", "среду", "четверг", "пятницу", "субботу", "воскресенье"];

export interface StatusMeta {
  title: string;
  /** Заголовок для клиента */
  clientTitle: string;
  tone: "neutral" | "info" | "progress" | "success" | "danger" | "warning";
  step: number;
}

export const STATUS_META: Record<OrderStatus, StatusMeta> = {
  new: { title: "Новый заказ", clientTitle: "Заказ создан", tone: "neutral", step: 1 },
  searching: { title: "Поиск водовоза", clientTitle: "Ищем водовозы поблизости", tone: "info", step: 2 },
  offers: { title: "Получение предложений", clientTitle: "Выберите водителя", tone: "warning", step: 3 },
  accepted: { title: "Водитель выбран", clientTitle: "Водитель подтвердил заказ", tone: "progress", step: 4 },
  en_route: { title: "Водовоз едет к клиенту", clientTitle: "Водовоз едет к вам", tone: "progress", step: 5 },
  arrived: { title: "Водовоз прибыл", clientTitle: "Водовоз прибыл", tone: "progress", step: 6 },
  delivering: { title: "Доставка воды", clientTitle: "Идёт слив воды", tone: "progress", step: 7 },
  completed: { title: "Заказ завершён", clientTitle: "Заказ завершён", tone: "success", step: 8 },
  cancelled: { title: "Отменён", clientTitle: "Заказ отменён", tone: "danger", step: 9 },
};

export const STATUS_ORDER: OrderStatus[] = [
  "new",
  "searching",
  "offers",
  "accepted",
  "en_route",
  "arrived",
  "delivering",
  "completed",
  "cancelled",
];

export const ACTIVE_STATUSES: OrderStatus[] = ["new", "searching", "offers", "accepted", "en_route", "arrived", "delivering"];
export const IN_PROGRESS_STATUSES: OrderStatus[] = ["accepted", "en_route", "arrived", "delivering"];

export const CANCEL_REASONS = [
  "Планы изменились",
  "Долго ждать",
  "Слишком высокая цена",
  "Заказал(а) в другом месте",
  "Другое",
];

export const DEMO_PASSWORD = "demo123";

export const DEMO_ACCOUNTS = [
  { role: "client" as const, email: "demo@client.ru", title: "Клиент", desc: "Заказ воды, выбор водителя, оценка" },
  { role: "driver" as const, email: "demo@driver.ru", title: "Водитель", desc: "Лента заявок, торг, доставка" },
  { role: "admin" as const, email: "demo@admin.ru", title: "Администратор", desc: "Dashboard, заказы, водители" },
];
