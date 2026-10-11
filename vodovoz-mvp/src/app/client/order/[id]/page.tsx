"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, MessageCircle, Phone, RotateCcw, Truck, XCircle } from "lucide-react";
import { MapLayout } from "@/components/layout/AppShell";
import { Map, type MapMarker } from "@/components/map/Map";
import { Avatar, Button, EmptyState, RatingPill, Segmented, StarInput, Stars, StatusBadge, TruckPhoto, cn } from "@/components/ui";
import { OfferCard } from "@/components/order/OfferCard";
import { DriverDetailsSheet } from "@/components/order/DriverDetailsSheet";
import { DriverInfo } from "@/components/order/DriverInfo";
import { StatusProgress } from "@/components/order/StatusProgress";
import { ChatSheet } from "@/components/order/ChatSheet";
import { CallSheet } from "@/components/order/CallSheet";
import { CancelSheet } from "@/components/order/CancelSheet";
import { OrderDetails, OrderEconomics } from "@/components/order/OrderSummary";
import { useDb } from "@/hooks/useDb";
import { useNow } from "@/hooks/useNow";
import { useSession } from "@/hooks/useSession";
import { useTracking } from "@/hooks/useTracking";
import { cancelOrder, createOrder, rateOrder, selectOffer } from "@/lib/api";
import { getDriver, visibleOffers } from "@/lib/selectors";
import { STATUS_META } from "@/data/catalog";
import { formatDateTime, formatKm, formatPrice, formatVolume, plural } from "@/lib/format";
import { roadDistanceKm, etaMinutes } from "@/lib/geo";
import { isFutureScheduled } from "@/lib/timing";
import type { Driver, Offer, Order } from "@/types";

type SortKey = "price" | "time" | "rating";

/** Бортовой номер машины в автопарке (для демо) */
const fleetNo = (driverId: string) => (parseInt(driverId.replace(/\D/g, ""), 10) || 1) * 3 + 9;

export default function ClientOrderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const db = useDb();
  const { user } = useSession("client");
  const now = useNow(500);
  const order = db.orders.find((o) => o.id === Number(params.id));
  const driver = getDriver(db, order?.driverId);
  const tracking = useTracking(order, driver, db.settings.demoSpeed);

  const [sort, setSort] = useState<SortKey>("price");
  const [viewing, setViewing] = useState<{ driver: Driver; offer?: Offer } | null>(null);
  const [chat, setChat] = useState(false);
  const [call, setCall] = useState(false);
  const [cancel, setCancel] = useState(false);

  const offers = useMemo(() => {
    if (!order) return [];
    const list = visibleOffers(order, now)
      .map((o) => ({ offer: o, driver: getDriver(db, o.driverId)! }))
      .filter((x) => x.driver);
    return list.sort((a, b) =>
      sort === "price" ? a.offer.price - b.offer.price : sort === "time" ? a.offer.etaMin - b.offer.etaMin : b.driver.rating - a.driver.rating,
    );
  }, [order, now, db, sort]);

  if (!order || (user && order.clientId !== user.id)) {
    return (
      <EmptyState
        icon={<XCircle className="h-8 w-8" />}
        title="Заказ не найден"
        text="Возможно, демо-данные были сброшены."
        action={
          <Link href="/client">
            <Button>На главную</Button>
          </Link>
        }
      />
    );
  }

  const pending = order.offers.filter((o) => Date.parse(o.createdAt) > now).length;
  const isSearch = order.status === "searching" || order.status === "new";
  const isOffers = order.status === "offers";
  const inProgress = ["accepted", "en_route", "arrived", "delivering"].includes(order.status);
  const bestPrice = offers.length ? Math.min(...offers.map((o) => o.offer.price)) : 0;
  const bestTime = offers.length ? Math.min(...offers.map((o) => o.offer.etaMin)) : 0;

  // ---------- Карта ----------
  const markers: MapMarker[] = [];
  let fit = [order.location];
  let fitKey: string = order.status;
  if (isSearch || isOffers) {
    const offerDrivers = new Set(offers.map((o) => o.driver.id));
    const around = db.drivers
      .filter((d) => d.online && !d.blocked)
      .map((d) => ({ d, km: roadDistanceKm(d.location, order.location) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 7);
    around.forEach(({ d }) => {
      const off = offers.find((o) => o.driver.id === d.id);
      markers.push({
        id: d.id,
        kind: "truck",
        position: d.location,
        color: offerDrivers.has(d.id) || isSearch ? d.car.color : "#AEBBD0",
        label: off ? formatPrice(off.offer.price) : undefined,
        active: !!off,
        onClick: off ? () => setViewing({ driver: d, offer: off.offer }) : undefined,
      });
    });
    fit = [order.location, ...around.slice(0, 4).map((a) => a.d.location)];
    fitKey = `${order.status}-${offers.length > 0}`;
  } else if (driver) {
    const pos = tracking.position ?? driver.location;
    markers.push({ id: driver.id, kind: "truck", position: pos, color: driver.car.color, active: order.status === "en_route", label: order.status === "en_route" ? `${tracking.etaLeft} мин` : undefined });
    if (tracking.route) fit = tracking.route;
    else fit = [order.location];
  }
  markers.push({ id: "client", kind: "client", position: order.location, pulse: isSearch });

  const mapEl = (
    <Map
      center={order.location}
      zoom={14}
      markers={markers}
      route={tracking.route}
      routeActive={tracking.remaining}
      fit={fit}
      fitKey={`${fitKey}-${tracking.route ? tracking.route.length : 0}`}
      padding={[80, 60]}
      className="h-full w-full"
    />
  );

  const overlay = (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex items-center gap-2 p-3 pt-[calc(.75rem+env(safe-area-inset-top))]">
      <button onClick={() => router.push("/client")} className="pointer-events-auto grid h-10 w-10 place-items-center rounded-2xl bg-white/95 shadow-soft backdrop-blur lg:hidden" aria-label="Назад">
        <ArrowLeft className="h-5 w-5" />
      </button>
      {order.status === "en_route" && (
        <div className="pointer-events-auto ml-auto rounded-2xl bg-ink-900 px-3.5 py-2 text-white shadow-lift">
          <div className="text-[11px] font-semibold text-ink-300">Прибытие через</div>
          <div className="text-lg font-extrabold leading-tight tabular">{tracking.etaLeft} мин</div>
        </div>
      )}
    </div>
  );

  return (
    <MapLayout map={mapEl} overlay={overlay} mapHeight={isOffers ? "34dvh" : "48dvh"}>
      <div className="px-5 pb-8 lg:px-7 lg:pt-5">
        <div className="mb-1 mt-1 flex items-center justify-between gap-2 text-[13px] font-semibold text-ink-400">
          <Link href="/client/orders" className="hidden items-center gap-1 hover:text-ink-700 lg:inline-flex">
            <ArrowLeft className="h-4 w-4" /> Мои заказы
          </Link>
          <span>
            Заказ №{order.id} · {formatDateTime(order.createdAt)}
          </span>
          <StatusBadge status={order.status} />
        </div>

        {/* ---------- 1. Поиск ---------- */}
        {isSearch && (
          <SearchingBlock order={order} db={db} onCancel={() => setCancel(true)} />
        )}

        {/* ---------- 2. Предложения ---------- */}
        {isOffers && (
          <div>
            <h1 className="mt-3 text-[26px] font-extrabold leading-tight tracking-tight">
              Получено {offers.length} {plural(offers.length, "предложение", "предложения", "предложений")}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[14px] text-ink-500">
              <span>
                Ваша цена: <b className="text-ink-900">{formatPrice(order.clientPrice)}</b>
              </span>
              <span>·</span>
              <span>
                {formatVolume(order.volume)} · {order.address.replace(/^г\. [^,]+, /, "")}
              </span>
            </div>
            {pending > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-2xl bg-aqua-50 px-3 py-2 text-[13px] font-semibold text-aqua-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-aqua-500" />
                Ещё {pending} {plural(pending, "водитель рассматривает", "водителя рассматривают", "водителей рассматривают")} заявку…
              </div>
            )}
            <Segmented
              className="mt-4"
              size="sm"
              value={sort}
              onChange={setSort}
              options={[
                { value: "price", label: "Дешевле" },
                { value: "time", label: "Быстрее" },
                { value: "rating", label: "Рейтинг" },
              ]}
            />
            <div className="mt-4 space-y-3">
              {offers.map(({ offer, driver: d }) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  driver={d}
                  clientPrice={order.clientPrice}
                  best={offers.length > 1 ? (offer.price === bestPrice ? "price" : offer.etaMin === bestTime ? "time" : null) : null}
                  onSelect={() => selectOffer(order.id, offer.id)}
                  onView={() => setViewing({ driver: d, offer })}
                />
              ))}
            </div>
            <Button variant="ghost" full className="mt-4 text-coral-600" onClick={() => setCancel(true)}>
              Отменить заявку
            </Button>
          </div>
        )}

        {/* ---------- 3. Выполнение ---------- */}
        {inProgress && driver && (
          <div>
            <h1 className="mt-3 text-[26px] font-extrabold leading-tight tracking-tight">{STATUS_META[order.status].clientTitle}</h1>
            <p className="mt-1 text-[15px] text-ink-500">
              {order.status === "accepted" &&
                (isFutureScheduled(order, now)
                  ? `Запланировано: водитель приедет к ${order.schedule.time}`
                  : `${driver.name} готовится к выезду`)}
              {order.status === "en_route" && `Прибытие через ${tracking.etaLeft} ${plural(tracking.etaLeft, "минуту", "минуты", "минут")}`}
              {order.status === "arrived" && "Водовоз на месте — подготовьте ёмкость"}
              {order.status === "delivering" && `Сливаем ${formatVolume(order.volume)} воды`}
            </p>

            {order.status === "en_route" && (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-gradient-to-r from-aqua-400 to-aqua-600 transition-all duration-300" style={{ width: `${Math.round(tracking.progress * 100)}%` }} />
              </div>
            )}
            {order.status === "delivering" && <WaterFill progress={tracking.delivery} volume={order.volume} />}

            <div className="mt-5 rounded-3xl bg-white p-4 shadow-soft ring-1 ring-ink-100">
              <DriverInfo
                driver={driver}
                right={
                  <div className="text-right">
                    <div className="text-lg font-extrabold">{formatPrice(order.finalPrice)}</div>
                    <div className="text-[12px] text-ink-400">{formatVolume(order.volume)}</div>
                  </div>
                }
              />
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Button variant="secondary" onClick={() => setCall(true)} icon={<Phone className="h-4 w-4" />}>
                  Позвонить
                </Button>
                <Button variant="secondary" onClick={() => setChat(true)} icon={<MessageCircle className="h-4 w-4" />}>
                  Написать
                  {order.chat.filter((m) => m.from === "driver").length > 0 && <span className="h-2 w-2 rounded-full bg-coral-500" />}
                </Button>
                <Button variant="danger" onClick={() => setCancel(true)} icon={<XCircle className="h-4 w-4" />} disabled={order.status === "delivering"}>
                  Отменить
                </Button>
              </div>
              <button onClick={() => setViewing({ driver })} className="mt-3 w-full text-center text-[13px] font-bold text-aqua-600">
                Подробнее о водителе
              </button>
            </div>

            {!driver.isBot && (
              <div className="mt-3 rounded-2xl bg-sun-50 p-3 text-[13px] font-semibold text-sun-600">
                Демо: этим заказом управляет живой водитель (demo@driver.ru). Меняйте статусы в его интерфейсе или кнопкой «Демо → Далее».
              </div>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-1">
              <div>
                <div className="label">Статус заказа</div>
                <StatusProgress order={order} />
              </div>
              <div>
                <div className="label">Детали</div>
                <OrderDetails order={order} />
                <div className="mt-4">
                  <OrderEconomics order={order} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------- 4. Завершён ---------- */}
        {order.status === "completed" && <CompletedBlock order={order} driver={driver} />}

        {/* ---------- 5. Отменён ---------- */}
        {order.status === "cancelled" && (
          <div className="py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-coral-50 text-coral-500">
                <XCircle className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold">Заказ отменён</h1>
                <p className="text-ink-500">{order.cancelReason ?? "Отменён"}</p>
              </div>
            </div>
            <div className="mt-6">
              <OrderDetails order={order} />
            </div>
            <RepeatButton order={order} />
          </div>
        )}
      </div>

      <DriverDetailsSheet
        open={!!viewing}
        driver={viewing?.driver ?? null}
        offer={viewing?.offer}
        clientPrice={order.clientPrice}
        onClose={() => setViewing(null)}
        onOrder={
          isOffers && viewing?.offer
            ? () => {
                selectOffer(order.id, viewing.offer!.id);
                setViewing(null);
              }
            : undefined
        }
      />
      {driver && <ChatSheet order={order} me="client" peerName={driver.name} open={chat} onClose={() => setChat(false)} />}
      {driver && <CallSheet name={driver.name} phone={driver.phone} open={call} onClose={() => setCall(false)} />}
      <CancelSheet
        open={cancel}
        onClose={() => setCancel(false)}
        warning={inProgress ? "Водитель уже выехал. В реальном сервисе может взиматься плата за отмену." : undefined}
        onConfirm={(reason) => {
          cancelOrder(order.id, "client", reason);
          setCancel(false);
        }}
      />
    </MapLayout>
  );
}

// ---------------------------------------------------------------------------

function SearchingBlock({ order, db, onCancel }: { order: Order; db: ReturnType<typeof useDb>; onCancel: () => void }) {
  const near = db.drivers
    .filter((d) => d.online && !d.blocked)
    .map((d) => ({ d, km: roadDistanceKm(d.location, order.location) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, 4);
  return (
    <div className="pt-3">
      <div className="flex items-center gap-4">
        <div className="relative grid h-16 w-16 shrink-0 place-items-center">
          <span className="absolute inset-0 animate-ripple rounded-full bg-aqua-400/50" />
          <span className="absolute inset-0 animate-ripple rounded-full bg-aqua-400/40 [animation-delay:.8s]" />
          <span className="relative grid h-12 w-12 place-items-center rounded-full bg-aqua-500 text-white shadow-glow">
            <Truck className="h-6 w-6" />
          </span>
        </div>
        <div>
          <h1 className="text-[24px] font-extrabold leading-tight tracking-tight">Ищем водовозы поблизости</h1>
          <p className="text-[14px] text-ink-500">Отправили заявку {near.length} {plural(near.length, "водителю", "водителям", "водителям")} рядом</p>
        </div>
      </div>
      <div className="mt-5 space-y-2">
        {near.map(({ d, km }, i) => (
          <div key={d.id} className="flex animate-slide-up items-center gap-3 rounded-2xl border border-ink-100 p-3" style={{ animationDelay: `${i * 120}ms` }}>
            <TruckPhoto color={d.car.color} photo={d.car.photo} className="h-12 w-16 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[15px] font-extrabold">
                Водовоз №{fleetNo(d.id)}
                <RatingPill value={d.rating} />
              </div>
              <div className="text-[13px] text-ink-500">
                {formatKm(km)} · ≈ {etaMinutes(km)} мин · {formatVolume(d.car.tankVolume)}
              </div>
            </div>
            <span className="h-2 w-2 animate-pulse rounded-full bg-aqua-500" />
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl bg-ink-50 p-4 text-[14px]">
        <div className="flex justify-between">
          <span className="text-ink-500">Ваша цена</span>
          <b>{formatPrice(order.clientPrice)}</b>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-ink-500">Объём</span>
          <b>{formatVolume(order.volume)}</b>
        </div>
      </div>
      <Button variant="ghost" full className="mt-3 text-coral-600" onClick={onCancel}>
        Отменить поиск
      </Button>
    </div>
  );
}

function WaterFill({ progress, volume }: { progress: number; volume: number }) {
  const pct = Math.round(progress * 100);
  return (
    <div className="relative mt-4 h-20 overflow-hidden rounded-3xl bg-aqua-50 ring-1 ring-aqua-100">
      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-aqua-300 to-aqua-500 transition-all duration-300" style={{ width: `${pct}%` }}>
        <svg className="absolute -right-3 top-0 h-full w-6 text-aqua-500" viewBox="0 0 20 80" preserveAspectRatio="none">
          <path d="M0 0 Q10 10 0 20 Q10 30 0 40 Q10 50 0 60 Q10 70 0 80 L0 80 L0 0Z" fill="currentColor" />
        </svg>
      </div>
      <div className="relative flex h-full items-center justify-between px-5">
        <span className="text-[15px] font-extrabold text-ink-900">
          {(volume * progress).toFixed(1).replace(".", ",")} из {formatVolume(volume)}
        </span>
        <span className="text-2xl font-extrabold text-ink-900 tabular">{pct}%</span>
      </div>
    </div>
  );
}

function RepeatButton({ order }: { order: Order }) {
  const router = useRouter();
  return (
    <Button
      variant="secondary"
      size="lg"
      full
      className="mt-6"
      icon={<RotateCcw className="h-5 w-5" />}
      onClick={() => {
        const o = createOrder({
          clientId: order.clientId,
          address: order.address,
          location: order.location,
          volume: order.volume,
          waterType: order.waterType,
          schedule: { type: "now" },
          clientPrice: order.finalPrice ?? order.clientPrice,
          comment: order.comment,
        });
        router.push(`/client/order/${o.id}`);
      }}
    >
      Повторить заказ
    </Button>
  );
}

function CompletedBlock({ order, driver }: { order: Order; driver?: Driver }) {
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  return (
    <div className="pt-3">
      <div className="flex flex-col items-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-3xl bg-mint-50 text-mint-500">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-3 text-[26px] font-extrabold">Заказ завершён</h1>
        <p className="text-ink-500">Спасибо, что выбрали «Водовоз»!</p>
      </div>
      <div className="mt-5 divide-y divide-ink-100 rounded-2xl border border-ink-100">
        {[
          ["Объём", formatVolume(order.volume)],
          ["Цена", formatPrice(order.finalPrice ?? order.clientPrice)],
          ["Водитель", driver?.name ?? "—"],
          ["Автомобиль", driver ? `${driver.car.brand} ${driver.car.model}` : "—"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between px-4 py-3 text-[15px]">
            <span className="text-ink-500">{k}</span>
            <span className="font-bold">{v}</span>
          </div>
        ))}
      </div>

      {order.rating ? (
        <div className="mt-5 rounded-3xl bg-ink-50 p-5 text-center">
          <div className="text-sm font-semibold text-ink-500">Ваша оценка</div>
          <Stars value={order.rating.stars} size={28} className="mt-2 justify-center" />
          {order.rating.text && <p className="mt-2 text-ink-700">«{order.rating.text}»</p>}
        </div>
      ) : (
        <div className="mt-5 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-ink-100">
          {driver && (
            <div className="mb-3 flex items-center justify-center gap-2">
              <Avatar name={driver.name} size={40} />
              <div className="text-left">
                <div className="font-extrabold">Оцените водителя</div>
                <div className="text-[13px] text-ink-500">{driver.name}</div>
              </div>
            </div>
          )}
          <StarInput value={stars} onChange={setStars} />
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Оставьте отзыв" className="input mt-3 h-auto resize-none py-3" />
          <div className="mt-2 flex flex-wrap gap-2">
            {["Быстро приехал", "Вежливый", "Чистая вода", "Длинный шланг"].map((t) => (
              <button key={t} onClick={() => setText((v) => (v ? `${v}, ${t.toLowerCase()}` : t))} className={cn("rounded-xl bg-ink-50 px-3 py-1.5 text-[13px] font-semibold text-ink-600 hover:bg-ink-100")}>
                {t}
              </button>
            ))}
          </div>
          <Button size="lg" full className="mt-4" onClick={() => rateOrder(order.id, stars, text.trim())}>
            Оценить
          </Button>
        </div>
      )}
      <div className="mt-5">
        <OrderEconomics order={order} />
      </div>
      <div className="mt-5">
        <div className="label">История статусов</div>
        <StatusProgress order={order} compact />
      </div>
      <RepeatButton order={order} />
      <div className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-ink-400">
        <Clock className="h-4 w-4" /> Завершён {formatDateTime(order.updatedAt)}
      </div>
    </div>
  );
}
