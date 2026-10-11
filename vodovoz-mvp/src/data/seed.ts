import type { DbState, Order, OrderStatus, TimelineEntry, User, WaterType } from "@/types";
import { DEMO_PASSWORD, WATER_TYPES } from "./catalog";
import { cityAddresses, DEFAULT_CITY_ID, getCity } from "./cities";
import { buildDriver, DRIVER_SEEDS } from "./drivers";
import { createRng } from "@/lib/random";
import { recommendedPrice, roundPrice } from "@/lib/pricing";
import { etaMinutes, roadDistanceKm } from "@/lib/geo";

export const DB_VERSION = 3;
export const DEFAULT_COMMISSION = 0.1;

// Вымышленные клиенты (без реальных персональных данных)
const CLIENT_SEEDS = [
  { id: "u-client-demo", name: "Мария (демо)", phone: "+7 900 000-00-01", email: "demo@client.ru", daysAgo: 64 },
  { id: "u-c2", name: "Елена К.", phone: "+7 900 000-00-02", email: "elena@example.ru", daysAgo: 41 },
  { id: "u-c3", name: "Тимур А.", phone: "+7 900 000-00-03", email: "timur@example.ru", daysAgo: 37 },
  { id: "u-c4", name: "Ольга С.", phone: "+7 900 000-00-04", email: "olga@example.ru", daysAgo: 29 },
  { id: "u-c5", name: "Руслан Б.", phone: "+7 900 000-00-05", email: "ruslan@example.ru", daysAgo: 22 },
  { id: "u-c6", name: "Наталья В.", phone: "+7 900 000-00-06", email: "natalia@example.ru", daysAgo: 17 },
  { id: "u-c7", name: "Игорь Д.", phone: "+7 900 000-00-07", email: "igor@example.ru", daysAgo: 12 },
  { id: "u-c8", name: "СНТ «Берёзка»", phone: "+7 900 000-00-08", email: "snt@example.ru", daysAgo: 8 },
  { id: "u-c9", name: "Кафе «Север»", phone: "+7 900 000-00-09", email: "cafe@example.ru", daysAgo: 3 },
];

const COMMENTS = [
  "Нужен длинный шланг, подъезд к дому возможен",
  "Позвоните за 10 минут до приезда",
  "Ёмкость во дворе, ворота открыты",
  "",
  "Заезд с улицы, шлагбаум — наберу охрану",
  "",
  "Бак на 5 кубов за баней",
];

const BOT_DRIVERS = ["d2", "d3", "d4", "d5", "d6", "d7", "d9", "d10"];

function buildTimeline(createdAt: number, final: OrderStatus, etaMin: number): TimelineEntry[] {
  const path: [OrderStatus, number][] = [
    ["new", 0],
    ["searching", 0.05],
    ["offers", 0.6],
    ["accepted", 2.5],
    ["en_route", 3],
    ["arrived", 3 + etaMin],
    ["delivering", 5 + etaMin],
    ["completed", 15 + etaMin],
  ];
  if (final === "cancelled") {
    return [
      { status: "new", at: new Date(createdAt).toISOString() },
      { status: "searching", at: new Date(createdAt + 3000).toISOString() },
      { status: "offers", at: new Date(createdAt + 40000).toISOString() },
      { status: "cancelled", at: new Date(createdAt + 4 * 60000).toISOString() },
    ];
  }
  const out: TimelineEntry[] = [];
  for (const [status, min] of path) {
    out.push({ status, at: new Date(createdAt + min * 60000).toISOString() });
    if (status === final) break;
  }
  return out;
}

interface OrderSpec {
  id: number;
  clientId: string;
  minutesAgo: number;
  status: OrderStatus;
  driverId?: string;
  volume: number;
  waterType: WaterType;
  addressIdx: number;
  priceDelta?: number;
  rating?: number;
  recurring?: boolean;
  scheduled?: boolean;
}

export function createSeed(cityId: string = DEFAULT_CITY_ID, now = Date.now()): DbState {
  const city = getCity(cityId);
  const nowIso = new Date(now).toISOString();
  const rng = createRng(20241006);
  const addresses = cityAddresses(city);

  const drivers = DRIVER_SEEDS.map((s) => buildDriver(s, city.center, nowIso));

  const users: User[] = [
    ...CLIENT_SEEDS.map((c) => ({
      id: c.id,
      role: "client" as const,
      name: c.name,
      phone: c.phone,
      email: c.email,
      password: DEMO_PASSWORD,
      createdAt: new Date(now - c.daysAgo * 86400000).toISOString(),
      isDemo: c.id === "u-client-demo",
    })),
    {
      id: "u-driver-demo",
      role: "driver",
      name: "Алексей",
      phone: "+7 900 100-00-01",
      email: "demo@driver.ru",
      password: DEMO_PASSWORD,
      createdAt: drivers[0].createdAt,
      driverId: "d1",
      isDemo: true,
    },
    {
      id: "u-admin-demo",
      role: "admin",
      name: "Администратор",
      phone: "+7 900 999-99-99",
      email: "demo@admin.ru",
      password: DEMO_PASSWORD,
      createdAt: new Date(now - 90 * 86400000).toISOString(),
      isDemo: true,
    },
  ];

  // ---- Заказы ----
  const specs: OrderSpec[] = [
    // История демо-клиента
    { id: 1031, clientId: "u-client-demo", minutesAgo: 3 * 1440 + 200, status: "completed", driverId: "d4", volume: 5, waterType: "drinking", addressIdx: 0, priceDelta: 200, rating: 5 },
    { id: 1036, clientId: "u-client-demo", minutesAgo: 8 * 1440 + 90, status: "completed", driverId: "d2", volume: 3, waterType: "technical", addressIdx: 0, rating: 4 },
    { id: 1040, clientId: "u-client-demo", minutesAgo: 5 * 1440 + 400, status: "cancelled", volume: 2, waterType: "drinking", addressIdx: 0 },
    { id: 1044, clientId: "u-client-demo", minutesAgo: 1440 + 300, status: "completed", driverId: "d6", volume: 5, waterType: "household", addressIdx: 0, rating: 5, recurring: true },
    // Активные заказы других клиентов (для админки и карты)
    { id: 1101, clientId: "u-c2", minutesAgo: 6, status: "en_route", driverId: "d2", volume: 8, waterType: "technical", addressIdx: 3 },
    { id: 1102, clientId: "u-c3", minutesAgo: 14, status: "delivering", driverId: "d4", volume: 10, waterType: "drinking", addressIdx: 5 },
    { id: 1103, clientId: "u-c5", minutesAgo: 2, status: "searching", volume: 3, waterType: "household", addressIdx: 7 },
    { id: 1104, clientId: "u-c8", minutesAgo: 120, status: "accepted", driverId: "d6", volume: 10, waterType: "technical", addressIdx: 9, scheduled: true },
    { id: 1105, clientId: "u-c9", minutesAgo: 9, status: "arrived", driverId: "d7", volume: 3, waterType: "drinking", addressIdx: 1 },
  ];

  // Завершённые заказы сегодня (для статистики)
  const minutesToday = Math.max(60, Math.floor((now - new Date(now).setHours(6, 0, 0, 0)) / 60000));
  const todayCount = 22;
  for (let i = 0; i < todayCount; i++) {
    specs.push({
      id: 1060 + i,
      clientId: rng.pick(CLIENT_SEEDS.slice(1)).id,
      minutesAgo: Math.round(30 + (minutesToday - 30) * (i / todayCount) * rng.range(0.85, 1)),
      status: i % 11 === 5 ? "cancelled" : "completed",
      driverId: rng.pick(BOT_DRIVERS),
      volume: rng.pick([2, 3, 5, 5, 5, 8, 10]),
      waterType: rng.pick(["drinking", "drinking", "technical", "household"] as WaterType[]),
      addressIdx: rng.int(0, addresses.length - 1),
      priceDelta: rng.pick([-200, 0, 0, 100, 200, 300]),
      rating: rng.pick([5, 5, 5, 4, 5]),
    });
  }
  // Прошлые дни
  for (let i = 0; i < 12; i++) {
    specs.push({
      id: 1046 + i,
      clientId: rng.pick(CLIENT_SEEDS.slice(1)).id,
      minutesAgo: 1440 * rng.int(1, 9) + rng.int(0, 600),
      status: "completed",
      driverId: rng.pick(BOT_DRIVERS),
      volume: rng.pick([3, 5, 8, 10]),
      waterType: rng.pick(["drinking", "technical", "household"] as WaterType[]),
      addressIdx: rng.int(0, addresses.length - 1),
      priceDelta: rng.pick([-100, 0, 200]),
      rating: rng.pick([5, 4, 5]),
    });
  }

  const orders: Order[] = specs.map((s) => {
    const addr = addresses[s.addressIdx % addresses.length];
    const createdAt = now - s.minutesAgo * 60000;
    const clientPrice = recommendedPrice(s.volume, s.waterType);
    const driver = drivers.find((d) => d.id === s.driverId);
    const km = driver ? roadDistanceKm(driver.location, addr.location) : 0;
    const eta = driver ? etaMinutes(km) : 0;
    const finalPrice = driver ? roundPrice(clientPrice + (s.priceDelta ?? 0)) : undefined;
    const offerId = `o-${s.id}-${s.driverId}`;
    const timeline = buildTimeline(createdAt, s.status, eta);
    const last = timeline[timeline.length - 1];
    const water = WATER_TYPES.find((w) => w.id === s.waterType)!;

    const order: Order = {
      id: s.id,
      clientId: s.clientId,
      address: addr.title,
      location: addr.location,
      volume: s.volume,
      waterType: water.id,
      schedule: s.recurring
        ? { type: "recurring", interval: "weekly", weekday: 5, time: "10:00", active: true }
        : s.scheduled
          ? { type: "scheduled", date: new Date(now + 86400000).toISOString().slice(0, 10), time: "09:00" }
          : { type: "now" },
      clientPrice,
      comment: COMMENTS[s.id % COMMENTS.length],
      status: s.status,
      offers: driver
        ? [{ id: offerId, driverId: driver.id, price: finalPrice!, etaMin: eta, distanceKm: km, createdAt: new Date(createdAt + 40000).toISOString() }]
        : [],
      driverId: driver?.id,
      selectedOfferId: driver ? offerId : undefined,
      finalPrice,
      etaMin: driver ? eta : undefined,
      commissionRate: DEFAULT_COMMISSION,
      createdAt: new Date(createdAt).toISOString(),
      updatedAt: last.at,
      timeline,
      chat: [],
      routeFrom: driver?.location,
      botClient: s.clientId !== "u-client-demo",
      // Сид-заказы живут в «реальном времени», чтобы карта админки оставалась живой
      simMsPerMin: 60000,
    };
    if (s.status === "completed" && s.rating) {
      order.rating = { stars: s.rating, text: s.rating === 5 ? "Всё отлично, спасибо!" : "Хорошо", at: last.at };
    }
    if (s.status === "cancelled") {
      order.cancelReason = "Планы изменились";
      order.cancelledBy = "client";
    }
    // Для активных демо-заказов: «живая» имитация в реальном времени
    if (s.status === "en_route") {
      order.timeline[order.timeline.length - 1].at = new Date(now - 4 * 60000).toISOString();
    }
    return order;
  });

  // Водители с активными заказами — на маршруте / у клиента
  for (const o of orders) {
    if (!o.driverId || !["arrived", "delivering"].includes(o.status)) continue;
    const d = drivers.find((x) => x.id === o.driverId);
    if (d) d.location = { ...o.location };
  }

  orders.sort((a, b) => b.id - a.id);

  return {
    version: DB_VERSION,
    users,
    drivers,
    orders,
    notifications: [
      {
        id: "n-seed-1",
        userId: "u-client-demo",
        title: "Добро пожаловать в «Водовоз»",
        body: "Укажите адрес и объём — водители рядом предложат свою цену.",
        kind: "info",
        at: new Date(now - 64 * 86400000).toISOString(),
        read: true,
      },
      {
        id: "n-seed-2",
        userId: "u-client-demo",
        title: "Заказ №1044 завершён",
        body: "Дмитрий доставил 5 м³ воды. Следующая регулярная доставка — в пятницу в 10:00.",
        kind: "success",
        at: orders.find((o) => o.id === 1044)?.updatedAt ?? nowIso,
        read: false,
        orderId: 1044,
      },
      {
        id: "n-seed-3",
        userId: "u-driver-demo",
        title: "Документы проверены",
        body: "Ваш профиль подтверждён. Включите «Я на линии», чтобы получать заявки.",
        kind: "success",
        at: new Date(now - 2 * 86400000).toISOString(),
        read: false,
      },
    ],
    settings: {
      commissionRate: DEFAULT_COMMISSION,
      cityId: city.id,
      demoSpeed: 1,
      searchRadiusKm: 15,
    },
    nextOrderId: 1201,
    seededAt: nowIso,
  };
}
