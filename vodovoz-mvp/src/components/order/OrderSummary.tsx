import { CalendarClock, Droplets, MapPin, MessageSquareText, Repeat } from "lucide-react";
import type { Order } from "@/types";
import { orderEconomics } from "@/lib/pricing";
import { scheduleLabel, waterLabel } from "@/lib/selectors";
import { formatPrice, formatVolume } from "@/lib/format";

export function OrderDetails({ order }: { order: Order }) {
  const rows = [
    { icon: MapPin, label: "Адрес", value: order.address },
    { icon: Droplets, label: "Вода", value: `${formatVolume(order.volume)} · ${waterLabel(order.waterType)}` },
    { icon: order.schedule.type === "recurring" ? Repeat : CalendarClock, label: "Когда", value: scheduleLabel(order.schedule) },
    ...(order.comment ? [{ icon: MessageSquareText, label: "Комментарий", value: order.comment }] : []),
  ];
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label} className="flex gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-500">
            <r.icon className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-ink-400">{r.label}</div>
            <div className="text-[15px] font-semibold text-ink-800">{r.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Экономика заказа: стоимость, доход водителя, комиссия сервиса */
export function OrderEconomics({ order, perspective = "client" }: { order: Order; perspective?: "client" | "driver" | "admin" }) {
  const e = orderEconomics(order);
  const pct = `${Math.round(e.rate * 1000) / 10}%`;
  return (
    <div className="rounded-2xl bg-ink-50 p-4">
      <div className="flex justify-between text-[15px]">
        <span className="text-ink-500">Стоимость заказа</span>
        <span className="font-extrabold">{formatPrice(e.total)}</span>
      </div>
      {order.finalPrice !== undefined && order.finalPrice !== order.clientPrice && perspective !== "driver" && (
        <div className="mt-1 flex justify-between text-[13px] text-ink-400">
          <span>Цена клиента</span>
          <span className="line-through">{formatPrice(order.clientPrice)}</span>
        </div>
      )}
      {perspective !== "client" && (
        <>
          <div className="mt-2 flex justify-between text-[15px]">
            <span className="text-ink-500">Доход водителя</span>
            <span className="font-bold text-mint-600">{formatPrice(e.driverIncome)}</span>
          </div>
          <div className="mt-2 flex justify-between text-[15px]">
            <span className="text-ink-500">Комиссия сервиса ({pct})</span>
            <span className="font-bold text-aqua-700">{formatPrice(e.commission)}</span>
          </div>
        </>
      )}
      {perspective === "client" && <div className="mt-1 text-[13px] text-ink-400">Оплата водителю наличными или переводом после доставки</div>}
    </div>
  );
}
