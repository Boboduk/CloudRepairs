"use client";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { VOLUME_PRESETS } from "@/data/catalog";
import { cn } from "@/components/ui";

export function VolumePicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const isPreset = VOLUME_PRESETS.includes(value);
  const [custom, setCustom] = useState(!isPreset);
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {VOLUME_PRESETS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              setCustom(false);
              onChange(v);
            }}
            className={cn("chip h-14 flex-col gap-0 text-[17px]", !custom && value === v && "chip-active")}
          >
            {v} <span className="text-[11px] font-semibold opacity-60">м³</span>
          </button>
        ))}
        <button type="button" onClick={() => setCustom(true)} className={cn("chip h-14 text-[14px]", custom && "chip-active")}>
          Свой
        </button>
      </div>
      {custom && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-ink-50 p-2">
          <button type="button" className="grid h-11 w-11 place-items-center rounded-xl bg-white shadow-soft" onClick={() => onChange(Math.max(0.5, +(value - 0.5).toFixed(1)))} aria-label="Меньше">
            <Minus className="h-5 w-5" />
          </button>
          <div className="flex flex-1 items-baseline justify-center gap-1">
            <input
              type="number"
              inputMode="decimal"
              min={0.5}
              max={40}
              step={0.5}
              value={value}
              onChange={(e) => onChange(Math.min(40, Math.max(0, Number(e.target.value))))}
              className="w-20 bg-transparent text-center text-2xl font-extrabold text-ink-900 outline-none"
            />
            <span className="font-bold text-ink-400">м³</span>
          </div>
          <button type="button" className="grid h-11 w-11 place-items-center rounded-xl bg-white shadow-soft" onClick={() => onChange(Math.min(40, +(value + 0.5).toFixed(1)))} aria-label="Больше">
            <Plus className="h-5 w-5" />
          </button>
        </div>
      )}
      <p className="mt-2 text-[13px] text-ink-400">1 м³ = 1000 литров ≈ 5 бочек по 200 л</p>
    </div>
  );
}
