/**
 * Слой бизнес-операций («API»). Все изменения данных проходят здесь.
 *
 * Сейчас операции выполняются над локальной базой (lib/db.ts).
 * При подключении Supabase каждая функция превращается в вызов
 * RPC / Edge Function с той же сигнатурой — компоненты не меняются.
 */
import type {
  AppNotification,
  DbState,
  Driver,
  NewOrderInput,
  NotificationKind,
  Offer,
  Order,
  OrderStatus,
  Role,
  Settings,
  User,
} from "@/types";
import { mutate, replaceDb, getDb } from "./db";
import { createSeed } from "@/data/seed";
import { getCity } from "@/data/cities";
import { DRIVER_SEEDS } from "@/data/drivers";
import { STATUS_META } from "@/data/catalog";
import { etaMinutes, roadDistanceKm } from "./geo";
import { roundPrice } from "./pricing";
import { uid } from "./random";
import { DEMO_MS_PER_MIN } from "./timing";
import { formatPrice, formatVolume } from "./format";

// ---------- helpers ----------

export function pushStatus(order: Order, status: OrderStatus, at = new Date().toISOString(), note?: string) {
  order.status = status;
  order.updatedAt = at;
  order.timeline.push({ status, at, note });
}

export function notify(
  db: DbState,
  userId: string | undefined,
  title: string,
  body: string,
  kind: NotificationKind = "info",
  orderId?: number,
) {
  if (!userId) return;
  const n: AppNotification = {
    id: uid("n"),
    userId,
    title,
    body,
    kind,
    orderId,
    at: new Date().toISOString(),
    read: false,
  };
  db.notifications.push(n);
  // ограничиваем размер истории уведомлений
  if (db.notifications.length > 300) db.notifications.splice(0, db.notifications.length - 300);
}

function findOrder(db: DbState, id: number): Order {
  const o = db.orders.find((x) => x.id === id);
  if (!o) throw new Error(`Заказ №${id} не найден`);
  return o;
}

function driverUserId(db: DbState, driverId?: string) {
  return db.drivers.find((d) => d.id === driverId)?.userId;
}

export function driverBusy(db: DbState, driverId: string): boolean {
  return db.orders.some((o) => o.driverId === driverId && ["accepted", "en_route", "arrived", "delivering"].includes(o.status));
}

/** Доступные для предложений водители-боты, ближайшие к точке */
export function candidateBots(db: DbState, order: Pick<Order, "location" | "volume">, exclude: string[] = [], allowBusy = false): Driver[] {
  return db.drivers
    .filter((d) => d.isBot && d.online && d.verified && !d.blocked && !exclude.includes(d.id) && (allowBusy || !driverBusy(db, d.id)))
    .sort((a, b) => roadDistanceKm(a.location, order.location) - roadDistanceKm(b.location, order.location));
}

export function buildBotOffer(
  driver: Driver,
  order: Pick<Order, "location" | "volume" | "clientPrice">,
  revealAt: number,
  exact = false,
  busy = false,
): Offer {
  const km = roadDistanceKm(driver.location, order.location);
  const noise = ((driver.id.charCodeAt(1) * 7 + order.volume * 13) % 9) / 100 - 0.04;
  const price = exact ? order.clientPrice : roundPrice(order.clientPrice * (1 + driver.priceBias + noise));
  const trips = Math.ceil(order.volume / driver.car.tankVolume);
  return {
    id: uid("o"),
    driverId: driver.id,
    price: trips > 1 ? roundPrice(price * 1.1) : price,
    etaMin: etaMinutes(km) + (busy ? 10 : 0),
    distanceKm: km,
    createdAt: new Date(revealAt).toISOString(),
    message: busy
      ? "Завершаю заказ рядом, освобожусь через ~10 мин"
      : trips > 1
        ? `Привезу за ${trips} рейса`
        : exact
          ? "Готов приехать за вашу цену"
          : price > order.clientPrice
            ? "Длинный шланг 30 м, помогу с подключением"
            : "Свободен, могу выехать сразу",
  };
}

// ---------- клиент: заказы ----------

export function createOrder(input: NewOrderInput): Order {
  return mutate((db) => {
    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    const speed = db.settings.demoSpeed || 1;
    const order: Order = {
      id: db.nextOrderId++,
      clientId: input.clientId,
      address: input.address,
      location: input.location,
      volume: input.volume,
      waterType: input.waterType,
      schedule: input.schedule.type === "recurring" ? { ...input.schedule, active: true } : input.schedule,
      clientPrice: input.clientPrice,
      comment: input.comment,
      status: "new",
      offers: [],
      commissionRate: db.settings.commissionRate,
      createdAt: nowIso,
      updatedAt: nowIso,
      timeline: [{ status: "new", at: nowIso }],
      chat: [],
      simMsPerMin: DEMO_MS_PER_MIN,
    };
    pushStatus(order, "searching", new Date(now + 300).toISOString());

    // Боты-водители «увидят» заявку и пришлют предложения через несколько секунд
    // Сначала свободные машины с подходящей цистерной, затем остальные
    const fits = candidateBots(db, order).filter((d) => d.car.tankVolume >= order.volume);
    const rest = candidateBots(db, order, fits.map((d) => d.id));
    const chosen = [...fits, ...rest].slice(0, 4);
    if (chosen.length < 3) {
      const busy = candidateBots(db, order, chosen.map((d) => d.id), true)
        .filter((d) => d.car.tankVolume >= order.volume)
        .slice(0, 3 - chosen.length);
      chosen.push(...busy);
    }
    const step = 1400 / speed;
    order.offers = chosen.map((d, i) => buildBotOffer(d, order, now + 2600 / speed + i * step, i === 1, driverBusy(db, d.id)));

    db.orders.unshift(order);

    // Живому водителю (демо-аккаунт), если он на линии — уведомление о заявке рядом
    for (const d of db.drivers) {
      if (d.isBot || !d.online || d.blocked || !d.userId) continue;
      const km = roadDistanceKm(d.location, order.location);
      if (km > db.settings.searchRadiusKm) continue;
      notify(
        db,
        d.userId,
        `Новая заявка №${order.id}`,
        `${formatVolume(order.volume)} · ${order.address} · ${formatPrice(order.clientPrice)}`,
        "offer",
        order.id,
      );
    }
    return order;
  });
}

export function cancelOrder(orderId: number, by: Role | "system", reason = "Отменён"): void {
  mutate((db) => {
    const o = findOrder(db, orderId);
    if (o.status === "completed" || o.status === "cancelled") return;
    pushStatus(o, "cancelled", undefined, reason);
    o.cancelReason = reason;
    o.cancelledBy = by;
    if (by !== "client") {
      notify(db, o.clientId, `Заказ №${o.id} отменён`, reason, "warning", o.id);
    }
    const uidDriver = driverUserId(db, o.driverId);
    if (uidDriver && by !== "driver") {
      notify(db, uidDriver, `Заказ №${o.id} отменён`, by === "client" ? "Клиент отменил заказ" : reason, "warning", o.id);
    }
    // водители, отправившие предложения
    for (const off of o.offers) {
      const u = driverUserId(db, off.driverId);
      if (u && off.driverId !== o.driverId && by !== "driver") {
        notify(db, u, `Заявка №${o.id} отменена`, "Клиент отменил заявку", "warning", o.id);
      }
    }
  });
}

export function selectOffer(orderId: number, offerId: string): void {
  mutate((db) => selectOfferIn(db, orderId, offerId));
}

export function selectOfferIn(db: DbState, orderId: number, offerId: string) {
  const o = findOrder(db, orderId);
  if (!["searching", "offers"].includes(o.status)) return;
  const offer = o.offers.find((x) => x.id === offerId);
  if (!offer) return;
  const driver = db.drivers.find((d) => d.id === offer.driverId);
  if (!driver) return;
  o.driverId = driver.id;
  o.selectedOfferId = offer.id;
  o.finalPrice = offer.price;
  o.etaMin = offer.etaMin;
  o.routeFrom = { ...driver.location };
  if (o.status === "searching") pushStatus(o, "offers");
  pushStatus(o, "accepted");

  notify(
    db,
    o.clientId,
    `${driver.name} подтвердил заказ`,
    `${driver.car.brand} · ${formatVolume(driver.car.tankVolume)} · ${formatPrice(offer.price)}. Скоро выезжает.`,
    "success",
    o.id,
  );
  if (driver.userId) {
    notify(db, driver.userId, `Клиент выбрал вас! Заказ №${o.id}`, `${o.address} · ${formatPrice(offer.price)}. Можно выезжать.`, "success", o.id);
  }
  for (const other of o.offers) {
    if (other.driverId === driver.id) continue;
    const u = driverUserId(db, other.driverId);
    if (u) notify(db, u, `Заявка №${o.id}`, "Клиент выбрал другого водителя", "info", o.id);
  }
}

export function rateOrder(orderId: number, stars: number, text: string): void {
  mutate((db) => {
    const o = findOrder(db, orderId);
    if (o.status !== "completed" || o.rating) return;
    const at = new Date().toISOString();
    o.rating = { stars, text, at };
    const d = db.drivers.find((x) => x.id === o.driverId);
    const client = db.users.find((u) => u.id === o.clientId);
    if (d) {
      d.rating = Math.round(((d.rating * d.ratingCount + stars) / (d.ratingCount + 1)) * 100) / 100;
      d.ratingCount += 1;
      d.reviews.unshift({ id: uid("r"), author: client?.name ?? "Клиент", stars, text: text || "Без комментария", at });
      if (d.userId) notify(db, d.userId, `Новая оценка: ${"★".repeat(stars)}`, text || `Клиент оценил заказ №${o.id}`, "success", o.id);
    }
  });
}

export function toggleRecurring(orderId: number): void {
  mutate((db) => {
    const o = findOrder(db, orderId);
    if (o.schedule.type !== "recurring") return;
    o.schedule.active = !o.schedule.active;
  });
}

export function sendChat(orderId: number, from: "client" | "driver", text: string): void {
  mutate((db) => {
    const o = findOrder(db, orderId);
    o.chat.push({ id: uid("m"), from, text, at: new Date().toISOString() });
    const target = from === "client" ? driverUserId(db, o.driverId) : o.clientId;
    if (target) notify(db, target, from === "client" ? "Сообщение от клиента" : "Сообщение от водителя", text, "info", o.id);
  });
}

// ---------- водитель ----------

export function setDriverOnline(driverId: string, online: boolean): void {
  mutate((db) => {
    const d = db.drivers.find((x) => x.id === driverId);
    if (d) d.online = online;
  });
}

export function submitOffer(orderId: number, driverId: string, price: number, etaMin: number, message?: string): void {
  mutate((db) => {
    const o = findOrder(db, orderId);
    if (!["searching", "offers"].includes(o.status)) throw new Error("Заявка уже неактуальна");
    const d = db.drivers.find((x) => x.id === driverId);
    if (!d) return;
    const now = new Date().toISOString();
    o.offers = o.offers.filter((x) => x.driverId !== driverId);
    o.offers.push({
      id: uid("o"),
      driverId,
      price,
      etaMin,
      distanceKm: roadDistanceKm(d.location, o.location),
      createdAt: now,
      message,
    });
    if (o.status === "searching") pushStatus(o, "offers", now);
  });
}

export function withdrawOffer(orderId: number, driverId: string): void {
  mutate((db) => {
    const o = findOrder(db, orderId);
    if (!["searching", "offers"].includes(o.status)) return;
    o.offers = o.offers.filter((x) => x.driverId !== driverId);
  });
}

/** Ручная смена статуса (водитель / админ) с побочными эффектами */
export function setOrderStatus(orderId: number, status: OrderStatus, by: Role | "system" = "system"): void {
  mutate((db) => setOrderStatusIn(db, orderId, status, by));
}

export function setOrderStatusIn(db: DbState, orderId: number, status: OrderStatus, by: Role | "system" = "system") {
  const o = findOrder(db, orderId);
  if (o.status === status) return;
  if (status === "cancelled") {
    pushStatus(o, "cancelled", undefined, by === "admin" ? "Отменён администратором" : undefined);
    o.cancelledBy = by;
    o.cancelReason = by === "admin" ? "Отменён администратором" : "Отменён";
    notify(db, o.clientId, `Заказ №${o.id} отменён`, o.cancelReason, "warning", o.id);
    return;
  }
  // Выбор водителя вручную (админ) — берём лучшее предложение
  if (status === "accepted" && !o.driverId) {
    const visible = o.offers.filter((x) => Date.parse(x.createdAt) <= Date.now());
    const best = (visible.length ? visible : o.offers).sort((a, b) => a.price - b.price)[0];
    if (best) {
      best.createdAt = new Date(Math.min(Date.now(), Date.parse(best.createdAt))).toISOString();
      selectOfferIn(db, o.id, best.id);
    }
    return;
  }
  pushStatus(o, status, undefined, by === "admin" ? "Изменено администратором" : undefined);
  const d = db.drivers.find((x) => x.id === o.driverId);
  const name = d?.name ?? "Водитель";
  switch (status) {
    case "en_route":
      if (d) o.routeFrom = { ...d.location };
      notify(db, o.clientId, "Водовоз едет к вам", `${name} выехал. Прибытие ≈ через ${o.etaMin ?? 10} мин.`, "status", o.id);
      break;
    case "arrived":
      if (d) d.location = { ...o.location };
      notify(db, o.clientId, "Водовоз прибыл", `${name} на месте. Подготовьте ёмкость для воды.`, "status", o.id);
      break;
    case "delivering":
      if (d) d.location = { ...o.location };
      notify(db, o.clientId, "Идёт слив воды", `${formatVolume(o.volume)} — это займёт несколько минут.`, "status", o.id);
      break;
    case "completed":
      if (d) {
        d.location = { ...o.location };
        d.ordersCompleted += 1;
        if (d.userId) {
          const income = Math.round((o.finalPrice ?? o.clientPrice) * (1 - o.commissionRate));
          notify(db, d.userId, `Заказ №${o.id} завершён`, `Ваш доход: ${formatPrice(income)}`, "success", o.id);
        }
      }
      notify(db, o.clientId, "Заказ завершён", `${formatVolume(o.volume)} доставлено. Оцените водителя ${name}.`, "success", o.id);
      break;
    default:
      if (by === "admin") notify(db, o.clientId, `Статус заказа №${o.id}`, STATUS_META[status].title, "status", o.id);
  }
}

/** Следующий этап заказа — кнопка демо-режима «Пропустить этап» */
export function advanceOrder(orderId: number): void {
  mutate((db) => {
    const o = findOrder(db, orderId);
    const now = Date.now();
    switch (o.status) {
      case "new":
        pushStatus(o, "searching");
        break;
      case "searching":
      case "offers": {
        // Показать все предложения сразу; если клиент уже видит их — выбрать лучшее
        const hidden = o.offers.filter((x) => Date.parse(x.createdAt) > now);
        if (hidden.length || o.status === "searching") {
          o.offers.forEach((x) => {
            if (Date.parse(x.createdAt) > now) x.createdAt = new Date(now).toISOString();
          });
          if (!o.offers.length) {
            const bots = candidateBots(db, o).slice(0, 3);
            o.offers = bots.map((b) => buildBotOffer(b, o, now));
          }
          if (o.status === "searching") pushStatus(o, "offers");
        } else {
          setOrderStatusIn(db, o.id, "accepted", "system");
        }
        break;
      }
      case "accepted":
        setOrderStatusIn(db, o.id, "en_route");
        break;
      case "en_route":
        setOrderStatusIn(db, o.id, "arrived");
        break;
      case "arrived":
        setOrderStatusIn(db, o.id, "delivering");
        break;
      case "delivering":
        setOrderStatusIn(db, o.id, "completed");
        break;
    }
  });
}

export function updateDriver(driverId: string, patch: Partial<Omit<Driver, "car">> & { car?: Partial<Driver["car"]> }): void {
  mutate((db) => {
    const d = db.drivers.find((x) => x.id === driverId);
    if (!d) return;
    const { car, ...rest } = patch;
    Object.assign(d, rest);
    if (car) d.car = { ...d.car, ...car };
    if (d.userId && (patch.name || patch.phone)) {
      const u = db.users.find((x) => x.id === d.userId);
      if (u) {
        if (patch.name) u.name = patch.name;
        if (patch.phone) u.phone = patch.phone;
      }
    }
  });
}

export function setDriverBlocked(driverId: string, blocked: boolean): void {
  mutate((db) => {
    const d = db.drivers.find((x) => x.id === driverId);
    if (!d) return;
    d.blocked = blocked;
    if (blocked) d.online = false;
    if (d.userId) {
      notify(db, d.userId, blocked ? "Аккаунт заблокирован" : "Аккаунт разблокирован", blocked ? "Обратитесь в поддержку сервиса." : "Вы снова можете выходить на линию.", blocked ? "warning" : "success");
    }
  });
}

export function setDriverVerified(driverId: string, verified: boolean): void {
  mutate((db) => {
    const d = db.drivers.find((x) => x.id === driverId);
    if (!d) return;
    d.verified = verified;
    d.documents = d.documents.map((doc) => ({ ...doc, status: verified ? "verified" : doc.status === "verified" ? "pending" : doc.status }));
    if (d.userId) notify(db, d.userId, verified ? "Профиль проверен" : "Требуется повторная проверка", verified ? "Документы подтверждены администратором." : "Администратор снял отметку о проверке.", verified ? "success" : "warning");
  });
}

export function updateUser(userId: string, patch: Partial<Pick<User, "name" | "phone" | "email" | "blocked">>): void {
  mutate((db) => {
    const u = db.users.find((x) => x.id === userId);
    if (!u) return;
    Object.assign(u, patch);
    if (u.driverId) {
      const d = db.drivers.find((x) => x.id === u.driverId);
      if (d) {
        if (patch.name) d.name = patch.name;
        if (patch.phone) d.phone = patch.phone;
      }
    }
  });
}

export function updateOrder(orderId: number, patch: Partial<Pick<Order, "address" | "volume" | "clientPrice" | "comment" | "finalPrice">>): void {
  mutate((db) => {
    const o = findOrder(db, orderId);
    Object.assign(o, patch);
    o.updatedAt = new Date().toISOString();
  });
}

export function deleteOrder(orderId: number): void {
  mutate((db) => {
    db.orders = db.orders.filter((o) => o.id !== orderId);
  });
}

export function markNotificationsRead(userId: string): void {
  mutate((db) => {
    db.notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
  });
}

export function clearNotifications(userId: string): void {
  mutate((db) => {
    db.notifications = db.notifications.filter((n) => n.userId !== userId);
  });
}

export function updateSettings(patch: Partial<Settings>): void {
  mutate((db) => {
    db.settings = { ...db.settings, ...patch };
  });
}

/** Сброс демо-данных; при смене города все водители и заказы переносятся в новый город */
export function resetDemo(cityId?: string): void {
  const prev = getDb();
  const fresh = createSeed(cityId ?? prev.settings.cityId);
  fresh.settings.demoSpeed = prev.settings.demoSpeed;
  fresh.settings.commissionRate = prev.settings.commissionRate;
  // Сохраняем зарегистрированных в демо пользователей
  const extraUsers = prev.users.filter((u) => !fresh.users.some((f) => f.id === u.id));
  fresh.users.push(...extraUsers);
  const city = getCity(fresh.settings.cityId);
  const extraDrivers = prev.drivers
    .filter((d) => !DRIVER_SEEDS.some((s) => s.id === d.id))
    .map((d) => ({ ...d, online: false, location: { lat: city.center.lat + 0.006, lng: city.center.lng - 0.01 } }));
  fresh.drivers.push(...extraDrivers);
  replaceDb(fresh);
}
