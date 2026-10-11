"use client";
import { Clock3, Droplets, Hourglass, MapPin, Ruler, Users, Wallet, Waves } from "lucide-react";
import type { Driver } from "@/types";
import type { FeedItem } from "@/lib/selectors";
import { scheduleLabel, waterLabel } from "@/lib/selectors";
import { Button, cn } from "@/components/ui";
import { formatKm, formatPrice, formatVolume, plural, relativeTime } from "@/lib/format";
import { etaMinutes } from "@/lib/geo";

export function FeedCard({
  item,
  driver,
  busy,
  onAccept,
  onOffer,
  onWithdraw,
  now,
}: {
  item: FeedItem;
  driver: Driver;
  busy: boolean;
  onAccept: () => void;
  onOffer: () => void;
  onWithdraw: () => void;
  now: number;
}) {
  const { order, distanceKm, myOffer, competitors } = item;
  const tooBig = order.volume > driver.car.tankVolume;
  const rows = [
    { icon: MapPin, label: "Адрес", value: order.address.replace(/^г\. [^,]+, /, "") },
    { icon: Droplets, label: "Объём", value: formatVolume(order.volume) },
    { icon: Waves, label: "Тип", value: waterLabel(order.waterType) },
    { icon: Clock3, label: "Время", value: scheduleLabel(order.schedule) },
    { icon: Wallet, label: "Цена клиента", value: formatPrice(order.clientPrice), strong: true },
    { icon: Ruler, label: "Расстояние", value: `${formatKm(distanceKm)} · ≈ ${etaMinutes(distanceKm)} мин` },
  ];
  return (
    <div className={cn("animate-slide-up rounded-3xl bg-white shadow-soft ring-1", myOffer ? "ring-aqua-300" : "ring-ink-100")}>
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="text-[17px] font-extrabold">Заказ №{order.id}</span>
          {Date.now() - Date.parse(order.createdAt) < 60000 && <span className="rounded-md bg-coral-500 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-white">new</span>}
        </div>
        <span className="text-[12px] font-semibold text-ink-400">{relativeTime(order.createdAt, now)}</span>
      </div>
      <div className="grid grid-cols-1 gap-x-4 gap-y-2 px-4 py-3 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-2.5">
            <r.icon className="mt-0.5 h-4 w-4 shrink-0 text-aqua-500" />
            <div className="min-w-0">
              <span className="text-[12px] font-semibold text-ink-400">{r.label}: </span>
              <span className={cn("text-[14px]", r.strong ? "font-extrabold text-ink-900" : "font-semibold text-ink-700")}>{r.value}</span>
            </div>
          </div>
        ))}
      </div>
      {order.comment && <div className="mx-4 mb-3 rounded-xl bg-ink-50 px-3 py-2 text-[13px] text-ink-600">«{order.comment}»</div>}
      {competitors > 0 && !myOffer && (
        <div className="mx-4 mb-3 flex items-center gap-1.5 text-[12px] font-semibold text-sun-600">
          <Users className="h-3.5 w-3.5" /> Ещё {competitors} {plural(competitors, "водитель откликнулся", "водителя откликнулись", "водителей откликнулись")}
        </div>
      )}
      {tooBig && !myOffer && <div className="mx-4 mb-3 text-[12px] font-semibold text-sun-600">Объём больше вашей цистерны ({formatVolume(driver.car.tankVolume)}) — потребуется несколько рейсов</div>}

      <div className="border-t border-ink-100 p-3">
        {myOffer ? (
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-aqua-50 text-aqua-600">
              <Hourglass className="h-5 w-5 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-extrabold">Предложение отправлено: {formatPrice(myOffer.price)}</div>
              <div className="text-[12px] text-ink-500">Прибытие ≈ {myOffer.etaMin} мин · ждём ответ клиента…</div>
            </div>
            <Button size="sm" variant="ghost" onClick={onWithdraw}>
              Отозвать
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="success" size="lg" onClick={onAccept} disabled={busy}>
              Принять за {formatPrice(order.clientPrice)}
            </Button>
            <Button variant="outline" size="lg" onClick={onOffer} disabled={busy}>
              Предложить цену
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
