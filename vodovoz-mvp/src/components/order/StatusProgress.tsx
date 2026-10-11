import { Check } from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { STATUS_META } from "@/data/catalog";
import { formatTime } from "@/lib/format";
import { cn } from "@/components/ui";

const FLOW: OrderStatus[] = ["new", "searching", "offers", "accepted", "en_route", "arrived", "delivering", "completed"];

/** Вертикальная шкала статусов заказа (1–8, либо «Отменён») */
export function StatusProgress({ order, compact }: { order: Order; compact?: boolean }) {
  const current = order.status === "cancelled" ? -1 : FLOW.indexOf(order.status);
  const reached = (s: OrderStatus) => order.timeline.find((t) => t.status === s);
  const list: OrderStatus[] = order.status === "cancelled" ? [...FLOW.filter((s) => reached(s)), "cancelled"] : FLOW;
  return (
    <ol className="relative space-y-0">
      {list.map((s, i) => {
        const entry = [...order.timeline].reverse().find((t) => t.status === s);
        const idx = FLOW.indexOf(s);
        const done = s === "cancelled" || (current >= 0 && idx < current) || (current === idx && s === "completed");
        const isCurrent = s === order.status && s !== "completed";
        if (compact && !entry && !isCurrent) return null;
        return (
          <li key={s} className="relative flex gap-3 pb-3 last:pb-0">
            {i < list.length - 1 && <span className={cn("absolute left-[11px] top-6 h-[calc(100%-18px)] w-0.5", done ? "bg-aqua-300" : "bg-ink-100")} />}
            <span
              className={cn(
                "relative z-[1] grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-extrabold",
                s === "cancelled" ? "bg-coral-500 text-white" : done ? "bg-aqua-500 text-white" : isCurrent ? "bg-ink-900 text-white ring-4 ring-ink-900/10" : "bg-ink-100 text-ink-400",
              )}
            >
              {done && s !== "cancelled" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s === "cancelled" ? "×" : idx + 1}
            </span>
            <div className="flex flex-1 items-center justify-between gap-2 pt-0.5">
              <span className={cn("text-[14px]", isCurrent ? "font-extrabold text-ink-900" : done ? "font-semibold text-ink-700" : "text-ink-400")}>
                {STATUS_META[s].title}
              </span>
              {entry && <span className="text-[12px] font-semibold text-ink-400 tabular">{formatTime(entry.at)}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
