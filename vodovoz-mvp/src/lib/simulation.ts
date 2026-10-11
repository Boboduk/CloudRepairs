/**
 * Движок демо-симуляции. Вместо реальных водителей и GPS:
 *  • боты-водители присылают предложения и сами меняют статусы;
 *  • симулированные клиенты создают заявки для ленты демо-водителя
 *    и выбирают его предложение;
 *  • водители-боты «отвечают» в чате.
 *
 * Тик выполняется только в одной вкладке (лидер), см. hooks/useSimulation.
 * Все переходы рассчитываются от временных меток, поэтому повторный тик
 * не создаёт дублей. В продакшене этот файл не нужен — статусы меняют
 * живые водители, а события приходят через Realtime.
 */
import type { DbState, Order } from "@/types";
import { mutateIf } from "./db";
import { buildBotOffer, candidateBots, notify, pushStatus, selectOfferIn, setOrderStatusIn } from "./api";
import { cityAddresses, getCity } from "@/data/cities";
import { formatPrice, plural } from "./format";
import { isFutureScheduled, simMinute, stageStartedAt, travelDurationMs, deliveryDurationMs } from "./timing";
import { recommendedPrice, roundPrice } from "./pricing";
import { uid } from "./random";
import { DEMO_MS_PER_MIN } from "./timing";
import type { WaterType } from "@/types";
import { roadDistanceKm } from "./geo";

const BOT_CLIENT_IDS = ["u-c2", "u-c3", "u-c4", "u-c5", "u-c6", "u-c7", "u-c8", "u-c9"];
const BOT_REPLIES = [
  "Здравствуйте! Уже выезжаю 👍",
  "Принял, буду вовремя.",
  "Хорошо, шланг 30 метров с собой.",
  "Понял вас, спасибо!",
];
/** Сколько ждёт симулированный клиент, прежде чем выбрать бота */
const BOT_CLIENT_WAIT_MS = 90_000;

let lastSpawn = 0;

export function simulationTick(now = Date.now()) {
  mutateIf((db) => {
    let changed = false;
    const speed = db.settings.demoSpeed || 1;
    for (const o of db.orders) {
      if (o.status === "completed" || o.status === "cancelled") continue;
      changed = tickOrder(db, o, now, speed) || changed;
    }
    changed = maybeSpawnBotOrder(db, now) || changed;
    return changed;
  });
}

function tickOrder(db: DbState, o: Order, now: number, speed: number): boolean {
  const driver = db.drivers.find((d) => d.id === o.driverId);
  const botDriver = !!driver?.isBot;
  const since = now - stageStartedAt(o);
  const min = simMinute(o, speed);
  let changed = false;

  // Уведомления о новых предложениях
  if (!o.botClient && ["searching", "offers"].includes(o.status)) {
    const fresh = o.offers.filter((x) => !x.notified && Date.parse(x.createdAt) <= now);
    for (const off of fresh) {
      off.notified = true;
      const d = db.drivers.find((x) => x.id === off.driverId);
      notify(
        db,
        o.clientId,
        off.price === o.clientPrice ? `${d?.name ?? "Водитель"} готов приехать за вашу цену` : `${d?.name ?? "Водитель"} предложил цену ${formatPrice(off.price)}`,
        `Прибытие ≈ ${off.etaMin} мин · ${d?.car.brand ?? ""} ${d?.car.tankVolume ?? ""} м³`,
        "offer",
        o.id,
      );
      changed = true;
    }
  }

  switch (o.status) {
    case "new":
      pushStatus(o, "searching");
      return true;

    case "searching": {
      const visible = o.offers.filter((x) => Date.parse(x.createdAt) <= now);
      if (visible.length) {
        pushStatus(o, "offers", visible[0].createdAt);
        if (!o.botClient) {
          const total = o.offers.length;
          notify(db, o.clientId, `Найдено ${total} ${plural(total, "водовоз", "водовоза", "водовозов")}`, "Водители рядом рассматривают вашу заявку", "info", o.id);
        }
        return true;
      }
      return changed;
    }

    case "offers": {
      if (!o.botClient) return changed;
      // Симулированный клиент выбирает живого водителя (демо-аккаунт) сразу,
      // а ботов — после ожидания.
      const human = o.offers.find((x) => {
        const d = db.drivers.find((dd) => dd.id === x.driverId);
        return d && !d.isBot && now - Date.parse(x.createdAt) > 3000 / speed;
      });
      if (human) {
        selectOfferIn(db, o.id, human.id);
        return true;
      }
      const age = now - Date.parse(o.createdAt);
      const hasHumanPending = o.offers.some((x) => !db.drivers.find((d) => d.id === x.driverId)?.isBot);
      if (age > BOT_CLIENT_WAIT_MS && !hasHumanPending) {
        const visible = o.offers.filter((x) => Date.parse(x.createdAt) <= now && !driverBusyIn(db, x.driverId));
        const best = visible.sort((a, b) => a.price - b.price)[0];
        if (best) {
          selectOfferIn(db, o.id, best.id);
          return true;
        }
      }
      return changed;
    }

    case "accepted":
      if (botDriver && since > min && !isFutureScheduled(o, now)) {
        setOrderStatusIn(db, o.id, "en_route");
        return true;
      }
      return changed;

    case "en_route":
      if (botDriver && since >= travelDurationMs(o, speed)) {
        setOrderStatusIn(db, o.id, "arrived");
        return true;
      }
      return changed;

    case "arrived":
      if (botDriver && since > 1.5 * min) {
        setOrderStatusIn(db, o.id, "delivering");
        return true;
      }
      return changed;

    case "delivering":
      if (botDriver && since >= deliveryDurationMs(o, speed)) {
        setOrderStatusIn(db, o.id, "completed");
        return true;
      }
      break;
  }

  // Ответ водителя-бота в чате
  const last = o.chat[o.chat.length - 1];
  if (botDriver && last?.from === "client" && now - Date.parse(last.at) > 1800) {
    o.chat.push({ id: uid("m"), from: "driver", text: BOT_REPLIES[o.chat.length % BOT_REPLIES.length], at: new Date(now).toISOString() });
    notify(db, o.clientId, `Сообщение от ${driver?.name}`, o.chat[o.chat.length - 1].text, "info", o.id);
    return true;
  }
  return changed;
}

function driverBusyIn(db: DbState, driverId: string) {
  return db.orders.some((o) => o.driverId === driverId && ["accepted", "en_route", "arrived", "delivering"].includes(o.status));
}

/**
 * Пока демо-водитель на линии, в ленте всегда есть 2–3 свежие заявки
 * от симулированных клиентов.
 */
function maybeSpawnBotOrder(db: DbState, now: number): boolean {
  const humanOnline = db.drivers.some((d) => !d.isBot && d.online && !d.blocked);
  if (!humanOnline) return false;
  if (now - lastSpawn < 12_000) return false;
  const open = db.orders.filter((o) => o.botClient && ["searching", "offers"].includes(o.status));
  if (open.length >= 3) return false;
  lastSpawn = now;

  const city = getCity(db.settings.cityId);
  const addrs = cityAddresses(city);
  const human = db.drivers.find((d) => !d.isBot && d.online)!;
  const near = addrs
    .filter((a) => !open.some((o) => o.address === a.title))
    .sort((a, b) => roadDistanceKm(a.location, human.location) - roadDistanceKm(b.location, human.location))
    .slice(0, 6);
  const addr = near[Math.floor(Math.random() * near.length)] ?? addrs[0];
  const volume = [2, 3, 5, 5, 8, 10][Math.floor(Math.random() * 6)];
  const waterType: WaterType = (["drinking", "technical", "household"] as WaterType[])[Math.floor(Math.random() * 3)];
  const nowIso = new Date(now).toISOString();
  const clientPrice = roundPrice(recommendedPrice(volume, waterType) * (0.88 + Math.random() * 0.15), 100);

  const order: Order = {
    id: db.nextOrderId++,
    clientId: BOT_CLIENT_IDS[Math.floor(Math.random() * BOT_CLIENT_IDS.length)],
    address: addr.title,
    location: addr.location,
    volume,
    waterType,
    schedule: Math.random() < 0.75 ? { type: "now" } : { type: "scheduled", date: new Date(now + 86400000).toISOString().slice(0, 10), time: "11:00" },
    clientPrice,
    comment: ["Нужен длинный шланг", "Позвоните за 10 минут", "", "Ворота открыты, заезд со двора", ""][Math.floor(Math.random() * 5)],
    status: "searching",
    offers: [],
    commissionRate: db.settings.commissionRate,
    createdAt: nowIso,
    updatedAt: nowIso,
    timeline: [
      { status: "new", at: nowIso },
      { status: "searching", at: nowIso },
    ],
    chat: [],
    botClient: true,
    simMsPerMin: DEMO_MS_PER_MIN,
  };
  // 1–2 конкурирующих предложения от ботов появятся позже
  const bots = candidateBots(db, order).filter((d) => d.car.tankVolume >= volume).slice(0, 2);
  order.offers = bots.map((b, i) => buildBotOffer(b, order, now + 20_000 + i * 15_000));
  db.orders.unshift(order);
  notify(db, human.userId, `Новая заявка №${order.id}`, `${volume} м³ · ${addr.short} · ${formatPrice(clientPrice)}`, "offer", order.id);
  return true;
}
