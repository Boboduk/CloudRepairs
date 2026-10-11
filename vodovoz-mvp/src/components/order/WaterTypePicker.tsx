"use client";
import { Droplet, Droplets, Wrench } from "lucide-react";
import { WATER_TYPES } from "@/data/catalog";
import type { WaterType } from "@/types";
import { cn } from "@/components/ui";

const ICONS: Record<WaterType, typeof Droplet> = { drinking: Droplet, technical: Wrench, household: Droplets };

export function WaterTypePicker({ value, onChange }: { value: WaterType; onChange: (v: WaterType) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {WATER_TYPES.map((w) => {
        const Icon = ICONS[w.id];
        const active = value === w.id;
        return (
          <button
            key={w.id}
            type="button"
            onClick={() => onChange(w.id)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-2xl border p-3 text-left transition active:scale-[.98]",
              active ? "border-aqua-500 bg-aqua-50 ring-2 ring-aqua-500/20" : "border-ink-200 bg-white hover:border-ink-300",
            )}
          >
            <Icon className={cn("h-5 w-5", active ? "text-aqua-600" : "text-ink-400")} />
            <div>
              <div className={cn("text-[14px] font-extrabold leading-tight", active ? "text-aqua-800" : "text-ink-800")}>{w.title}</div>
              <div className="mt-0.5 text-[11px] leading-tight text-ink-400">{w.hint}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
