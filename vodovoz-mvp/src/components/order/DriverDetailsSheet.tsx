"use client";
import { BadgeCheck, Clock, MapPin, ShieldCheck, Wallet } from "lucide-react";
import type { Driver, Offer } from "@/types";
import { Avatar, Button, RatingPill, Sheet, Stars, TruckPhoto } from "@/components/ui";
import { experienceLabel, formatKm, formatNumber, formatPrice, formatVolume, maskPlate, relativeTime } from "@/lib/format";

export function DriverDetailsSheet({
  driver,
  offer,
  clientPrice,
  open,
  onClose,
  onOrder,
}: {
  driver: Driver | null;
  offer?: Offer | null;
  clientPrice?: number;
  open: boolean;
  onClose: () => void;
  onOrder?: () => void;
}) {
  if (!driver) return null;
  const verified = driver.documents.filter((d) => d.status === "verified").length;
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Водитель"
      footer={
        onOrder && offer ? (
          <Button size="xl" full onClick={onOrder}>
            Заказать этого водовоза · {formatPrice(offer.price)}
          </Button>
        ) : undefined
      }
    >
      <TruckPhoto color={driver.car.color} photo={driver.car.photo} className="h-40 w-full" label={`${driver.car.brand} ${driver.car.model}`} />
      <div className="-mt-8 flex items-end gap-3 px-2">
        <Avatar name={driver.name} src={driver.avatar} size={72} className="rounded-[26px] ring-4 ring-white" />
        <div className="pb-1">
          <div className="flex items-center gap-1.5 text-xl font-extrabold">
            {driver.name}
            {driver.verified && <BadgeCheck className="h-5 w-5 text-aqua-500" />}
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-500">
            <Stars value={driver.rating} size={14} /> <RatingPill value={driver.rating} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { v: formatNumber(driver.ordersCompleted), l: "заказов" },
          { v: experienceLabel(driver.experienceYears), l: "опыт работы" },
          { v: formatNumber(driver.ratingCount), l: "оценок" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl bg-ink-50 p-3 text-center">
            <div className="text-lg font-extrabold">{s.v}</div>
            <div className="text-[12px] font-semibold text-ink-400">{s.l}</div>
          </div>
        ))}
      </div>

      {offer && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-aqua-50 p-3">
            <MapPin className="mb-1 h-4 w-4 text-aqua-600" />
            <div className="font-extrabold">{formatKm(offer.distanceKm)}</div>
            <div className="text-[12px] text-ink-500">расстояние</div>
          </div>
          <div className="rounded-2xl bg-aqua-50 p-3">
            <Clock className="mb-1 h-4 w-4 text-aqua-600" />
            <div className="font-extrabold">≈ {offer.etaMin} мин</div>
            <div className="text-[12px] text-ink-500">прибытие</div>
          </div>
          <div className="rounded-2xl bg-aqua-50 p-3">
            <Wallet className="mb-1 h-4 w-4 text-aqua-600" />
            <div className="font-extrabold">{formatPrice(offer.price)}</div>
            <div className="text-[12px] text-ink-500">{clientPrice && clientPrice !== offer.price ? `ваша ${formatPrice(clientPrice)}` : "ваша цена"}</div>
          </div>
        </div>
      )}

      <div className="mt-5 label">Автомобиль</div>
      <div className="divide-y divide-ink-100 rounded-2xl border border-ink-100">
        {[
          ["Марка", `${driver.car.brand} — водовоз`],
          ["Модель", driver.car.model],
          ["Год выпуска", String(driver.car.year)],
          ["Объём цистерны", formatVolume(driver.car.tankVolume)],
          ["Госномер", maskPlate(driver.car.plate)],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between px-4 py-3 text-[15px]">
            <span className="text-ink-500">{k}</span>
            <span className="font-bold">{v}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-mint-50 p-3 text-[14px] text-mint-600">
        <ShieldCheck className="h-5 w-5 shrink-0" />
        <span className="font-semibold">
          {driver.verified ? `Документы проверены сервисом (${verified} из ${driver.documents.length})` : "Документы на проверке"}
        </span>
      </div>

      <div className="mt-5 label">Отзывы</div>
      <div className="space-y-2">
        {driver.reviews.length === 0 && <div className="text-sm text-ink-400">Пока нет отзывов</div>}
        {driver.reviews.slice(0, 5).map((r) => (
          <div key={r.id} className="rounded-2xl bg-ink-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">{r.author}</span>
              <Stars value={r.stars} size={13} />
            </div>
            <p className="mt-1 text-[14px] text-ink-600">{r.text}</p>
            <div className="mt-1 text-[12px] text-ink-400">{relativeTime(r.at)}</div>
          </div>
        ))}
      </div>
    </Sheet>
  );
}
