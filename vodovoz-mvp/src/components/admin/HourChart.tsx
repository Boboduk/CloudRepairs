"use client";
import { useState } from "react";
import { plural } from "@/lib/format";

/** Заказы по часам за сегодня: один ряд, тонкие столбцы, подсказка при наведении */
export function HourChart({ data, nowHour }: { data: number[]; nowHour: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const hours = data.slice(6, Math.max(nowHour + 1, 12));
  const max = Math.max(1, ...hours);
  const ticks = [0, Math.ceil(max / 2), max];
  return (
    <div>
      <div className="relative flex h-44 gap-2">
        {/* ось Y */}
        <div className="flex w-5 flex-col-reverse justify-between pb-6 text-right text-[11px] font-semibold text-ink-400 tabular">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-x-0 bottom-6 top-0 flex flex-col-reverse justify-between">
            {ticks.map((t) => (
              <div key={t} className="border-t border-dashed border-ink-100" />
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 top-0 flex items-end gap-[2px]">
            {hours.map((v, i) => {
              const h = i + 6;
              return (
                <div
                  key={h}
                  className="relative flex h-full flex-1 flex-col items-center justify-end pb-6"
                  onMouseEnter={() => setHover(h)}
                  onMouseLeave={() => setHover(null)}
                >
                  <div
                    className="relative w-full max-w-[22px] rounded-t-[4px] bg-aqua-500 transition-opacity"
                    style={{ height: `${(v / max) * 100}%`, minHeight: v ? 3 : 0, opacity: hover !== null && hover !== h ? 0.45 : 1 }}
                  >
                    {hover === h && (
                      <div className="absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink-900 px-2 py-1 text-[12px] font-bold text-white shadow-lift">
                        {String(h).padStart(2, "0")}:00 — {v} {plural(v, "заказ", "заказа", "заказов")}
                      </div>
                    )}
                  </div>
                  <span className="absolute bottom-0 text-[10px] font-semibold text-ink-400">{h % 2 === 0 ? h : ""}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
