"use client";
import { Clock, MapPin, MessageCircle, Truck } from "lucide-react";
import type { Driver, Offer } from "@/types";
import { Avatar, Button, RatingPill, TruckPhoto, cn } from "@/components/ui";
import { formatKm, formatNumber, formatPrice, formatVolume, plural } from "@/lib/format";

export function OfferCard({
  offer,
  driver,
  clientPrice,
  best,
  onSelect,
  onView,
  disabled,
}: {
  offer: Offer;
  driver: Driver;
  clientPrice: number;
  best?: "price" | "time" | null;
  onSelect: () => void;
  onView: () => void;
  disabled?: boolean;
}) {
  const diff = offer.price - clientPrice;
  return (
    <div className="animate-slide-up overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-ink-100">
      <div className="flex gap-3 p-4">
        <button onClick={onView} className="relative shrink-0" aria-label="Посмотреть водителя">
          <Avatar name={driver.name} src={driver.avatar} size={60} />
          <TruckPhoto color={driver.car.color} photo={driver.car.photo} className="absolute -bottom-1.5 -right-2.5 h-7 w-10 rounded-lg ring-2 ring-white" />
        </button>
        <div className="min-w-0 flex-1 pl-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-[17px] font-extrabold">{driver.name}</span>
                <RatingPill value={driver.rating} />
              </div>
              <div className="text-[13px] text-ink-500">
                {formatNumber(driver.ordersCompleted)} {plural(driver.ordersCompleted, "заказ", "заказа", "заказов")}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[22px] font-extrabold leading-none tracking-tight tabular">{formatPrice(offer.price)}</div>
              <div
                className={cn(
                  "mt-1 inline-block rounded-md px-1.5 py-0.5 text-[11px] font-bold",
                  diff === 0 ? "bg-mint-50 text-mint-600" : diff > 0 ? "bg-sun-50 text-sun-600" : "bg-aqua-50 text-aqua-700",
                )}
              >
                {diff === 0 ? "Ваша цена" : `${diff > 0 ? "+" : "−"}${formatPrice(Math.abs(diff))}`}
              </div>
            </div>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[13px] font-semibold text-ink-600">
            <span className="inline-flex items-center gap-1">
              <Truck className="h-3.5 w-3.5 text-ink-400" />
              {driver.car.brand} · {formatVolume(driver.car.tankVolume)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-ink-400" />≈ {offer.etaMin} мин
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-ink-400" />
              {formatKm(offer.distanceKm)}
            </span>
          </div>
        </div>
      </div>
      {(offer.message || best) && (
        <div className="flex flex-wrap items-center gap-2 px-4 pb-1">
          {best === "price" && <span className="rounded-lg bg-mint-50 px-2 py-1 text-[11px] font-extrabold uppercase tracking-wide text-mint-600">Лучшая цена</span>}
          {best === "time" && <span className="rounded-lg bg-aqua-50 px-2 py-1 text-[11px] font-extrabold uppercase tracking-wide text-aqua-700">Быстрее всех</span>}
          {offer.message && (
            <span className="inline-flex items-center gap-1 text-[13px] text-ink-500">
              <MessageCircle className="h-3.5 w-3.5" />«{offer.message}»
            </span>
          )}
        </div>
      )}
      <div className="grid grid-cols-[1fr_auto] gap-2 p-4 pt-3">
        <Button onClick={onSelect} disabled={disabled} size="lg">
          Выбрать за {formatPrice(offer.price)}
        </Button>
        <Button variant="outline" size="lg" onClick={onView}>
          Посмотреть
        </Button>
      </div>
    </div>
  );
}
