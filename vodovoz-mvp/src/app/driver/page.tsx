"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Lock, Navigation, Power, Radar, ShieldAlert, Wallet } from "lucide-react";
import { MapLayout } from "@/components/layout/AppShell";
import { Map, type MapMarker } from "@/components/map/Map";
import { FeedCard } from "@/components/driver/FeedCard";
import { OfferSheet } from "@/components/driver/OfferSheet";
import { Avatar, EmptyState, RatingPill, StatusBadge, cn } from "@/components/ui";
import { useDb } from "@/hooks/useDb";
import { useNow } from "@/hooks/useNow";
import { useSession } from "@/hooks/useSession";
import { setDriverOnline, submitOffer, withdrawOffer } from "@/lib/api";
import { driverActiveOrder, driverFeed, isToday } from "@/lib/selectors";
import { etaMinutes } from "@/lib/geo";
import { orderEconomics } from "@/lib/pricing";
import { formatPrice, formatVolume } from "@/lib/format";
import type { Order } from "@/types";

export default function DriverHome() {
  const db = useDb();
  const now = useNow(1000);
  const { driver } = useSession("driver");
  const [offerFor, setOfferFor] = useState<Order | null>(null);
  const [error, setError] = useState("");

  const feed = useMemo(() => (driver ? driverFeed(db, driver, now) : []), [db, driver, now]);
  const active = driver ? driverActiveOrder(db, driver.id) : undefined;
  const today = useMemo(
    () => (driver ? db.orders.filter((o) => o.driverId === driver.id && o.status === "completed" && isToday(o.updatedAt, now)) : []),
    [db, driver, now],
  );
  if (!driver) return null;

  const earned = today.reduce((s, o) => s + orderEconomics(o).driverIncome, 0);
  const online = driver.online && !driver.blocked;

  const markers: MapMarker[] = [
    { id: "me", kind: "truck", position: driver.location, color: driver.car.color, active: online, offline: !online, label: "Вы" },
    ...(online
      ? feed.map((f) => ({
          id: `o${f.order.id}`,
          kind: "order" as const,
          position: f.order.location,
          text: String(f.order.volume),
          color: f.myOffer ? "#14B890" : undefined,
          onClick: () => document.getElementById(`feed-${f.order.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
        }))
      : []),
  ];

  const act = (fn: () => void) => {
    try {
      setError("");
      fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  return (
    <MapLayout
      mapHeight="34dvh"
      map={
        <Map
          center={driver.location}
          zoom={13}
          markers={markers}
          fit={online ? [driver.location, ...feed.slice(0, 5).map((f) => f.order.location)] : [driver.location]}
          fitKey={`${online}-${feed.length}`}
          padding={[60, 50]}
          className="h-full w-full"
        />
      }
      overlay={
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] p-3 pt-[calc(.75rem+env(safe-area-inset-top))]">
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-2 shadow-soft backdrop-blur">
            <Avatar name={driver.name} src={driver.avatar} size={28} online={online} />
            <span className="text-[13px] font-bold">{driver.name}</span>
            <RatingPill value={driver.rating} />
          </div>
        </div>
      }
    >
      <div className="px-5 pb-8 lg:px-7 lg:pt-6">
        {/* Большой переключатель «На линии» */}
        <button
          disabled={driver.blocked}
          onClick={() => setDriverOnline(driver.id, !driver.online)}
          className={cn(
            "mt-2 flex w-full items-center gap-4 rounded-[26px] p-4 text-left transition active:scale-[.99]",
            online ? "bg-mint-500 text-white shadow-[0_14px_34px_-12px_rgba(20,184,144,.7)]" : "bg-ink-900 text-white",
            driver.blocked && "cursor-not-allowed bg-ink-300",
          )}
        >
          <div className={cn("relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl", online ? "bg-white/20" : "bg-white/10")}>
            {online && <span className="absolute inset-0 animate-ripple rounded-2xl bg-white/30" />}
            {driver.blocked ? <Lock className="h-7 w-7" /> : <Power className="h-7 w-7" />}
          </div>
          <div className="flex-1">
            <div className="text-[22px] font-extrabold leading-tight">{driver.blocked ? "Аккаунт заблокирован" : online ? "Я на линии" : "Я не на линии"}</div>
            <div className={cn("text-[14px]", online ? "text-mint-50" : "text-ink-300")}>
              {driver.blocked ? "Обратитесь в поддержку" : online ? "Получаете заявки поблизости · нажмите, чтобы уйти" : "Нажмите, чтобы начать получать заявки"}
            </div>
          </div>
          <div className={cn("relative h-8 w-14 shrink-0 rounded-full transition", online ? "bg-white/30" : "bg-white/15")}>
            <span className={cn("absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all", online ? "left-7" : "left-1")} />
          </div>
        </button>

        {!driver.verified && !driver.blocked && (
          <div className="mt-3 flex items-start gap-2 rounded-2xl bg-sun-50 p-3 text-[13px] font-semibold text-sun-600">
            <ShieldAlert className="h-4 w-4 shrink-0" /> Профиль на проверке. В демо-режиме вы уже можете принимать заявки.
          </div>
        )}

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-ink-50 p-3">
            <Wallet className="mb-1 h-4 w-4 text-mint-600" />
            <div className="text-[17px] font-extrabold">{formatPrice(earned)}</div>
            <div className="text-[12px] text-ink-400">доход сегодня</div>
          </div>
          <div className="rounded-2xl bg-ink-50 p-3">
            <div className="mb-1 h-4 text-[12px] font-bold text-aqua-600">№</div>
            <div className="text-[17px] font-extrabold">{today.length}</div>
            <div className="text-[12px] text-ink-400">заказов сегодня</div>
          </div>
          <div className="rounded-2xl bg-ink-50 p-3">
            <div className="mb-1 h-4 text-[12px] font-bold text-aqua-600">м³</div>
            <div className="text-[17px] font-extrabold">{formatVolume(driver.car.tankVolume)}</div>
            <div className="text-[12px] text-ink-400">{driver.car.brand}</div>
          </div>
        </div>

        {active && (
          <Link href="/driver/active" className="mt-4 flex items-center gap-3 rounded-2xl bg-aqua-500 p-3.5 text-white shadow-glow">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20">
              <Navigation className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] text-aqua-100">Заказ №{active.id} в работе</div>
              <div className="truncate font-extrabold">{active.address}</div>
            </div>
            <StatusBadge status={active.status} className="hidden bg-white/20 text-white sm:inline-flex" />
            <ChevronRight className="h-5 w-5" />
          </Link>
        )}

        <div className="mb-3 mt-6 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Заявки рядом</h2>
          {online && (
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-400">
              <Radar className="h-4 w-4 animate-pulse text-aqua-500" /> радиус {db.settings.searchRadiusKm} км
            </span>
          )}
        </div>
        {error && <div className="mb-3 rounded-xl bg-coral-50 px-3 py-2 text-sm font-semibold text-coral-600">{error}</div>}

        {!online ? (
          <EmptyState icon={<Power className="h-8 w-8" />} title="Вы не на линии" text="Включите «Я на линии», чтобы видеть заявки клиентов поблизости." />
        ) : feed.length === 0 ? (
          <EmptyState icon={<Radar className="h-8 w-8 animate-pulse" />} title="Ищем заявки…" text="Новые заказы появятся здесь автоматически. В демо они приходят каждые несколько секунд." />
        ) : (
          <div className="space-y-3">
            {active && <div className="rounded-2xl bg-ink-50 p-3 text-[13px] font-semibold text-ink-500">Завершите текущий заказ, чтобы откликаться на новые.</div>}
            {feed.map((item) => (
              <div key={item.order.id} id={`feed-${item.order.id}`}>
                <FeedCard
                  item={item}
                  driver={driver}
                  now={now}
                  busy={!!active}
                  onAccept={() => act(() => submitOffer(item.order.id, driver.id, item.order.clientPrice, etaMinutes(item.distanceKm), "Готов приехать за вашу цену"))}
                  onOffer={() => setOfferFor(item.order)}
                  onWithdraw={() => withdrawOffer(item.order.id, driver.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <OfferSheet
        order={offerFor}
        open={!!offerFor}
        commissionRate={db.settings.commissionRate}
        suggestedEta={offerFor ? etaMinutes(feed.find((f) => f.order.id === offerFor.id)?.distanceKm ?? 3) : 15}
        onClose={() => setOfferFor(null)}
        onSubmit={(price, eta, message) => {
          if (offerFor) act(() => submitOffer(offerFor.id, driver.id, price, eta, message || undefined));
          setOfferFor(null);
        }}
      />
    </MapLayout>
  );
}
