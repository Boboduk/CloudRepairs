import Link from "next/link";
import { ChevronRight, Droplets, Repeat } from "lucide-react";
import type { Driver, Order } from "@/types";
import { StatusBadge } from "@/components/ui";
import { formatDateTime, formatPrice, formatVolume } from "@/lib/format";
import { waterLabel } from "@/lib/selectors";

/** Карточка заказа в истории */
export function OrderCard({ order, driver, href }: { order: Order; driver?: Driver; href: string }) {
  return (
    <Link href={href} className="block rounded-3xl bg-white p-4 shadow-soft ring-1 ring-ink-100 transition hover:ring-aqua-200 active:scale-[.995]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-aqua-50 text-aqua-600">
            <Droplets className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[17px] font-extrabold">{formatVolume(order.volume)} воды</div>
            <div className="text-[13px] text-ink-500">{waterLabel(order.waterType)}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[17px] font-extrabold tabular">{formatPrice(order.finalPrice ?? order.clientPrice)}</div>
          <div className="text-[12px] text-ink-400">№{order.id}</div>
        </div>
      </div>
      <div className="mt-3 text-[14px] font-semibold text-ink-700">{order.address}</div>
      <div className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ink-400">
        {formatDateTime(order.createdAt)}
        {order.schedule.type === "recurring" && (
          <span className="inline-flex items-center gap-1 rounded-md bg-aqua-50 px-1.5 py-0.5 text-[11px] font-bold text-aqua-700">
            <Repeat className="h-3 w-3" /> регулярно
          </span>
        )}
        {driver && <span>· {driver.name}</span>}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
        <StatusBadge status={order.status} />
        <span className="inline-flex items-center gap-0.5 text-[14px] font-bold text-aqua-600">
          Подробнее <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
