"use client";
import { Star } from "lucide-react";
import { cn } from "./cn";

export function Stars({ value, size = 16, className }: { value: number; size?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= Math.round(value) ? "fill-sun-500 text-sun-500" : "fill-ink-100 text-ink-200"}
        />
      ))}
    </div>
  );
}

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const labels = ["", "Плохо", "Так себе", "Нормально", "Хорошо", "Отлично!"];
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className="transition active:scale-90"
            aria-label={`${i} из 5`}
          >
            <Star
              className={cn(
                "h-11 w-11 transition",
                i <= value ? "fill-sun-500 text-sun-500 drop-shadow-[0_4px_10px_rgba(245,165,36,.45)]" : "fill-ink-100 text-ink-200",
              )}
            />
          </button>
        ))}
      </div>
      <div className="h-5 text-sm font-semibold text-ink-500">{labels[value]}</div>
    </div>
  );
}

export function RatingPill({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-lg bg-sun-50 px-1.5 py-0.5 text-[13px] font-bold text-ink-800", className)}>
      <Star className="h-3.5 w-3.5 fill-sun-500 text-sun-500" />
      {value.toFixed(value * 10 === Math.round(value * 10) ? 1 : 2).replace(".", ",")}
    </span>
  );
}
