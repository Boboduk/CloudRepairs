// Доменная модель «Водовоз». Эти типы — контракт между UI и слоем данных.
// При переходе на Supabase/PostgreSQL каждая сущность соответствует таблице.

export type Role = "client" | "driver" | "admin";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface City {
  id: string;
  name: string;
  center: LatLng;
  zoom: number;
  /** Демо-адреса для подсказок (смещения относительно центра) */
  streets: { title: string; dLat: number; dLng: number }[];
}

export interface User {
  id: string;
  role: Role;
  name: string;
  phone: string;
  email: string;
  /** Только для демо. В продакшене пароль хранится на сервере в виде хэша. */
  password: string;
  createdAt: string;
  /** Для роли driver — ссылка на карточку водителя */
  driverId?: string;
  blocked?: boolean;
  isDemo?: boolean;
}

export type WaterType = "drinking" | "technical" | "household";

export type ScheduleType = "now" | "scheduled" | "recurring";

export type RecurringInterval = "weekly" | "biweekly" | "monthly";

export interface Schedule {
  type: ScheduleType;
  /** ISO-дата (YYYY-MM-DD) для scheduled / первой регулярной доставки */
  date?: string;
  /** HH:mm */
  time?: string;
  interval?: RecurringInterval;
  /** 0..6, 0 = понедельник */
  weekday?: number;
  /** Регулярная доставка активна */
  active?: boolean;
}

export type OrderStatus =
  | "new"
  | "searching"
  | "offers"
  | "accepted"
  | "en_route"
  | "arrived"
  | "delivering"
  | "completed"
  | "cancelled";

export interface Offer {
  id: string;
  driverId: string;
  price: number;
  etaMin: number;
  distanceKm: number;
  /** Время появления предложения (для имитации — может быть в будущем) */
  createdAt: string;
  message?: string;
  /** Клиент уже получил уведомление о предложении */
  notified?: boolean;
}

export interface TimelineEntry {
  status: OrderStatus;
  at: string;
  note?: string;
}

export interface ChatMessage {
  id: string;
  from: "client" | "driver" | "system";
  text: string;
  at: string;
}

export interface Rating {
  stars: number;
  text: string;
  at: string;
}

export interface Order {
  id: number;
  clientId: string;
  address: string;
  location: LatLng;
  volume: number;
  waterType: WaterType;
  schedule: Schedule;
  clientPrice: number;
  comment: string;
  status: OrderStatus;
  offers: Offer[];
  driverId?: string;
  selectedOfferId?: string;
  finalPrice?: number;
  etaMin?: number;
  /** Ставка комиссии, зафиксированная в момент создания заказа (0.1 = 10%) */
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEntry[];
  rating?: Rating;
  cancelReason?: string;
  cancelledBy?: Role | "system";
  chat: ChatMessage[];
  /** Позиция водителя в момент выезда — начало маршрута */
  routeFrom?: LatLng;
  /** Заказ создан симулированным клиентом (для ленты водителя в демо) */
  botClient?: boolean;
  /** Сколько миллисекунд длится «минута» симуляции для этого заказа */
  simMsPerMin: number;
}

export interface Review {
  id: string;
  author: string;
  stars: number;
  text: string;
  at: string;
}

export interface DriverDocument {
  id: string;
  title: string;
  number: string;
  status: "verified" | "pending" | "missing";
}

export interface Driver {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  car: {
    brand: string;
    model: string;
    plate: string;
    tankVolume: number;
    year: number;
    color: string;
    photo?: string;
  };
  avatar?: string;
  rating: number;
  ratingCount: number;
  ordersCompleted: number;
  experienceYears: number;
  location: LatLng;
  online: boolean;
  verified: boolean;
  blocked: boolean;
  /** Водитель управляется симуляцией (бот), а не живым пользователем */
  isBot: boolean;
  /** Насколько водитель склонен торговаться: -0.1 … +0.15 к цене клиента */
  priceBias: number;
  reviews: Review[];
  documents: DriverDocument[];
  createdAt: string;
}

export type NotificationKind = "info" | "offer" | "status" | "success" | "warning";

export interface AppNotification {
  id: string;
  /** Кому адресовано: userId */
  userId: string;
  title: string;
  body: string;
  kind: NotificationKind;
  at: string;
  read: boolean;
  orderId?: number;
}

export interface Settings {
  commissionRate: number;
  cityId: string;
  /** Множитель скорости демо-симуляции */
  demoSpeed: number;
  /** Радиус поиска заказов для водителя, км */
  searchRadiusKm: number;
}

export interface DbState {
  version: number;
  users: User[];
  drivers: Driver[];
  orders: Order[];
  notifications: AppNotification[];
  settings: Settings;
  nextOrderId: number;
  seededAt: string;
}

export interface Session {
  userId: string;
  role: Role;
  at: string;
}

export interface NewOrderInput {
  clientId: string;
  address: string;
  location: LatLng;
  volume: number;
  waterType: WaterType;
  schedule: Schedule;
  clientPrice: number;
  comment: string;
}
