// Производные данные (чистые функции над DbState)
import type { DbState, Driver, Order, Schedule, User, WaterType } from "@/types";
import { ACTIVE_STATUSES, IN_PROGRESS_STATUSES, RECURRING_INTERVALS, WATER_TYPES, WEEKDAYS_FULL } from "@/data/catalog";
import { roadDistanceKm } from "./geo";
import { formatDateTime } from "./format";
import { orderEconomics } from "./pricing";

export const isActive = (o: Order) => ACTIVE_STATUSES.includes(o.status);
export const isInProgress = (o: Order) => IN_PROGRESS_STATUSES.includes(o.status);

export function getDriver(db: DbState, id?: string): Driver | undefined {
  return id ? db.drivers.find((d) => d.id === id) : undefined;
}

export function getUser(db: DbState, id?: string): User | undefined {
  return id ? db.users.find((u) => u.id === id) : undefined;
}

export function clientOrders(db: DbState, userId: string): Order[] {
  return db.orders.filter((o) => o.clientId === userId).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function activeClientOrder(db: DbState, userId: string): Order | undefined {
  return clientOrders(db, userId).find(isActive);
}

export function unreadCount(db: DbState, userId?: string): number {
  if (!userId) return 0;
  return db.notifications.filter((n) => n.userId === userId && !n.read).length;
}

export function visibleOffers(order: Order, now: number) {
  return order.offers.filter((o) => Date.parse(o.createdAt) <= now);
}

export function driverActiveOrder(db: DbState, driverId: string): Order | undefined {
  return db.orders.find((o) => o.driverId === driverId && isInProgress(o));
}

export interface FeedItem {
  order: Order;
  distanceKm: number;
  myOffer?: Order["offers"][number];
  competitors: number;
}

/** Лента заявок водителя: открытые заказы в радиусе поиска */
export function driverFeed(db: DbState, driver: Driver, now: number): FeedItem[] {
  return db.orders
    .filter((o) => ["searching", "offers"].includes(o.status))
    .map((o) => ({
      order: o,
      distanceKm: roadDistanceKm(driver.location, o.location),
      myOffer: o.offers.find((x) => x.driverId === driver.id),
      competitors: o.offers.filter((x) => x.driverId !== driver.id && Date.parse(x.createdAt) <= now).length,
    }))
    .filter((f) => f.distanceKm <= db.settings.searchRadiusKm)
    .sort((a, b) => Date.parse(b.order.createdAt) - Date.parse(a.order.createdAt));
}

export function waterLabel(t: WaterType): string {
  return WATER_TYPES.find((w) => w.id === t)?.short ?? t;
}

export function scheduleLabel(s: Schedule): string {
  if (s.type === "now") return "Как можно скорее";
  if (s.type === "scheduled" && s.date) return formatDateTime(`${s.date}T${s.time ?? "09:00"}:00`);
  if (s.type === "recurring") {
    const interval = RECURRING_INTERVALS.find((i) => i.id === s.interval)?.title ?? "Регулярно";
    const day = s.weekday !== undefined ? `, в ${WEEKDAYS_FULL[s.weekday]}` : "";
    return `${interval}${day}${s.time ? ` в ${s.time}` : ""}`;
  }
  return "—";
}

export function isToday(iso: string, now = Date.now()): boolean {
  const a = new Date(iso);
  const b = new Date(now);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export interface AdminStats {
  ordersToday: number;
  activeOrders: number;
  driversOnline: number;
  driversTotal: number;
  revenueToday: number;
  commissionToday: number;
  revenueTotal: number;
  commissionTotal: number;
  completedToday: number;
  cancelledToday: number;
  avgCheck: number;
  avgRating: number;
  byHour: number[];
}

export function adminStats(db: DbState, now = Date.now()): AdminStats {
  const today = db.orders.filter((o) => isToday(o.createdAt, now));
  const completed = db.orders.filter((o) => o.status === "completed");
  const completedToday = completed.filter((o) => isToday(o.updatedAt, now));
  const sum = (list: Order[], f: (o: Order) => number) => list.reduce((acc, o) => acc + f(o), 0);
  const byHour = Array.from({ length: 24 }, () => 0);
  today.forEach((o) => byHour[new Date(o.createdAt).getHours()]++);
  const rated = db.drivers.filter((d) => d.ratingCount > 0);
  return {
    ordersToday: today.length,
    activeOrders: db.orders.filter(isActive).length,
    driversOnline: db.drivers.filter((d) => d.online && !d.blocked).length,
    driversTotal: db.drivers.length,
    revenueToday: sum(completedToday, (o) => orderEconomics(o).total),
    commissionToday: sum(completedToday, (o) => orderEconomics(o).commission),
    revenueTotal: sum(completed, (o) => orderEconomics(o).total),
    commissionTotal: sum(completed, (o) => orderEconomics(o).commission),
    completedToday: completedToday.length,
    cancelledToday: today.filter((o) => o.status === "cancelled").length,
    avgCheck: completed.length ? Math.round(sum(completed, (o) => orderEconomics(o).total) / completed.length) : 0,
    avgRating: rated.length ? rated.reduce((a, d) => a + d.rating, 0) / rated.length : 0,
    byHour,
  };
}
