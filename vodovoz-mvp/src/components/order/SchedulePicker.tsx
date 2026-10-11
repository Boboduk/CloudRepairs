"use client";
import { CalendarClock, Repeat, Zap } from "lucide-react";
import type { RecurringInterval, Schedule, ScheduleType } from "@/types";
import { RECURRING_INTERVALS, WEEKDAYS } from "@/data/catalog";
import { cn } from "@/components/ui";

const TYPES: { id: ScheduleType; title: string; hint: string; icon: typeof Zap }[] = [
  { id: "now", title: "Как можно скорее", hint: "Приедет ближайший", icon: Zap },
  { id: "scheduled", title: "Запланировать", hint: "Дата и время", icon: CalendarClock },
  { id: "recurring", title: "Регулярно", hint: "Например, раз в неделю", icon: Repeat },
];

export function todayIso(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function SchedulePicker({ value, onChange }: { value: Schedule; onChange: (s: Schedule) => void }) {
  const set = (patch: Partial<Schedule>) => onChange({ ...value, ...patch });
  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {TYPES.map((t) => {
          const Icon = t.icon;
          const active = value.type === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                onChange(
                  t.id === "now"
                    ? { type: "now" }
                    : t.id === "scheduled"
                      ? { type: "scheduled", date: value.date ?? todayIso(1), time: value.time ?? "10:00" }
                      : { type: "recurring", interval: "weekly", weekday: value.weekday ?? 5, time: value.time ?? "10:00", date: todayIso(1) },
                )
              }
              className={cn(
                "flex flex-col items-start gap-2 rounded-2xl border p-3 text-left transition active:scale-[.98]",
                active ? "border-aqua-500 bg-aqua-50 ring-2 ring-aqua-500/20" : "border-ink-200 bg-white hover:border-ink-300",
              )}
            >
              <Icon className={cn("h-5 w-5", active ? "text-aqua-600" : "text-ink-400")} />
              <div>
                <div className={cn("text-[14px] font-extrabold leading-tight", active ? "text-aqua-800" : "text-ink-800")}>{t.title}</div>
                <div className="mt-0.5 text-[11px] leading-tight text-ink-400">{t.hint}</div>
              </div>
            </button>
          );
        })}
      </div>

      {value.type === "scheduled" && (
        <div className="mt-3 grid animate-slide-up grid-cols-2 gap-2">
          <input type="date" className="input" min={todayIso()} value={value.date ?? ""} onChange={(e) => set({ date: e.target.value })} />
          <input type="time" className="input" value={value.time ?? ""} onChange={(e) => set({ time: e.target.value })} />
        </div>
      )}

      {value.type === "recurring" && (
        <div className="mt-3 animate-slide-up space-y-3 rounded-2xl bg-ink-50 p-3">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {RECURRING_INTERVALS.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => set({ interval: i.id as RecurringInterval })}
                className={cn("chip h-10 shrink-0 text-sm", value.interval === i.id && "chip-active")}
              >
                {i.title}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d, i) => (
              <button
                key={d}
                type="button"
                onClick={() => set({ weekday: i })}
                className={cn(
                  "h-10 rounded-xl text-sm font-bold transition",
                  value.weekday === i ? "bg-ink-900 text-white" : "bg-white text-ink-600 hover:bg-ink-100",
                )}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-ink-500">Время</span>
            <input type="time" className="input h-10 flex-1" value={value.time ?? ""} onChange={(e) => set({ time: e.target.value })} />
          </div>
          <p className="text-[13px] text-ink-500">Первая доставка — по выбранному предложению, следующие будут создаваться автоматически. Отключить можно в профиле.</p>
        </div>
      )}
    </div>
  );
}
