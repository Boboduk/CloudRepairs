"use client";
import { Minus, Plus, Sparkles } from "lucide-react";
import { formatNumber, formatPrice } from "@/lib/format";
import { priceLevel } from "@/lib/pricing";
import { cn } from "@/components/ui";

const LEVELS = {
  low: { text: "Низкая цена — водители могут предложить свою", cls: "text-sun-600 bg-sun-50" },
  fair: { text: "Хорошая цена — быстро найдём водовоз", cls: "text-mint-600 bg-mint-50" },
  high: { text: "Высокая цена — водители откликнутся первыми", cls: "text-aqua-700 bg-aqua-50" },
};

export function PriceInput({
  value,
  onChange,
  recommended,
  hint = "Водители смогут принять вашу цену или предложить свою.",
  showLevel = true,
  recommendLabel = "Рекомендуем",
}: {
  value: number;
  onChange: (v: number) => void;
  recommended: number;
  hint?: string | null;
  showLevel?: boolean;
  recommendLabel?: string;
}) {
  const level = LEVELS[priceLevel(value, recommended)];
  return (
    <div>
      <div className="flex items-center gap-2 rounded-[20px] border border-ink-200 bg-white p-2 focus-within:border-aqua-500 focus-within:ring-4 focus-within:ring-aqua-500/15">
        <button type="button" className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-50 text-ink-700 hover:bg-ink-100" onClick={() => onChange(Math.max(100, value - 100))} aria-label="Уменьшить">
          <Minus className="h-5 w-5" />
        </button>
        <div className="flex flex-1 items-baseline justify-center gap-1">
          <input
            inputMode="numeric"
            value={value ? formatNumber(value) : ""}
            onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "")) || 0)}
            placeholder="2 500"
            className="w-36 bg-transparent text-center text-[32px] font-extrabold tracking-tight text-ink-900 outline-none tabular"
          />
          <span className="text-2xl font-extrabold text-ink-300">₽</span>
        </div>
        <button type="button" className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-50 text-ink-700 hover:bg-ink-100" onClick={() => onChange(value + 100)} aria-label="Увеличить">
          <Plus className="h-5 w-5" />
        </button>
      </div>
      {hint && <p className="mt-2 text-[14px] text-ink-500">{hint}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {showLevel && value > 0 && <span className={cn("rounded-lg px-2 py-1 text-[12px] font-bold", level.cls)}>{level.text}</span>}
        {value !== recommended && (
          <button type="button" onClick={() => onChange(recommended)} className="inline-flex items-center gap-1 rounded-lg bg-ink-50 px-2 py-1 text-[12px] font-bold text-ink-600 hover:bg-ink-100">
            <Sparkles className="h-3.5 w-3.5 text-aqua-500" /> {recommendLabel} {formatPrice(recommended)}
          </button>
        )}
      </div>
    </div>
  );
}
