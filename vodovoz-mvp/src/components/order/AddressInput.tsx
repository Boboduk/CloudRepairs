"use client";
import { useMemo, useRef, useState } from "react";
import { History, MapPin, Search, X } from "lucide-react";
import type { LatLng } from "@/types";
import { cn } from "@/components/ui";

export interface AddressOption {
  title: string;
  location: LatLng;
  recent?: boolean;
}

export function AddressInput({
  value,
  onChange,
  options,
  placeholder = "Куда доставить воду?",
}: {
  value: string;
  onChange: (title: string, location?: LatLng) => void;
  options: AddressOption[];
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout>>();

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    const list = q ? options.filter((o) => o.title.toLowerCase().includes(q.replace(/^г\.\s*\S+,\s*/, ""))) : options;
    return list.slice(0, 6);
  }, [options, value]);

  return (
    <div className="relative">
      <div
        className={cn(
          "flex items-center gap-3 rounded-[20px] border bg-white px-4 transition",
          focused ? "border-aqua-500 ring-4 ring-aqua-500/15" : "border-ink-200",
        )}
      >
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-ink-900 text-white">
          <MapPin className="h-4 w-4" />
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            clearTimeout(blurTimer.current);
            setFocused(true);
          }}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setFocused(false), 150);
          }}
          placeholder={placeholder}
          className="h-14 min-w-0 flex-1 bg-transparent text-[16px] font-semibold text-ink-900 outline-none placeholder:font-medium placeholder:text-ink-300"
        />
        {value && (
          <button type="button" onClick={() => onChange("")} className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-ink-100" aria-label="Очистить">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {focused && suggestions.length > 0 && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl bg-white p-1.5 shadow-lift ring-1 ring-ink-100">
          {suggestions.map((s) => (
            <button
              key={s.title}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(s.title, s.location);
                setFocused(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-ink-50"
            >
              {s.recent ? <History className="h-4 w-4 shrink-0 text-aqua-500" /> : <Search className="h-4 w-4 shrink-0 text-ink-300" />}
              <span className="truncate text-[15px] font-medium text-ink-800">{s.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
