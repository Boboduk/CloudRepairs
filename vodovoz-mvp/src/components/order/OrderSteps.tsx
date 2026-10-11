import { Check } from "lucide-react";
import { cn } from "@/components/ui";

const STEPS = ["Адрес", "Объём", "Время", "Цена", "Водитель"];

/** Прогресс оформления: 1. Адрес → 2. Объём → 3. Время → 4. Цена → 5. Водитель */
export function OrderSteps({ done, current }: { done: boolean[]; current: number }) {
  return (
    <ol className="flex items-center gap-1">
      {STEPS.map((s, i) => {
        const isDone = done[i];
        const isCurrent = i === current;
        return (
          <li key={s} className="flex flex-1 items-center gap-1">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full text-xs font-extrabold transition",
                  isDone ? "bg-aqua-500 text-white" : isCurrent ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-400",
                )}
              >
                {isDone ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </div>
              <span className={cn("truncate text-[11px] font-bold", isDone || isCurrent ? "text-ink-800" : "text-ink-400")}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={cn("mb-5 h-0.5 w-full flex-1 rounded-full", isDone ? "bg-aqua-300" : "bg-ink-100")} />}
          </li>
        );
      })}
    </ol>
  );
}
