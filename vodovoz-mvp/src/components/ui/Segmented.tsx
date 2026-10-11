"use client";
import type { ReactNode } from "react";
import { cn } from "./cn";

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; count?: number }[];
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div className={cn("no-scrollbar flex gap-1 overflow-x-auto rounded-2xl bg-ink-100 p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 font-bold transition",
            size === "sm" ? "h-8 text-[13px]" : "h-10 text-sm",
            value === o.value ? "bg-white text-ink-900 shadow-soft" : "text-ink-500 hover:text-ink-700",
          )}
        >
          {o.label}
          {o.count !== undefined && (
            <span className={cn("rounded-md px-1.5 text-[11px]", value === o.value ? "bg-aqua-50 text-aqua-700" : "bg-ink-200/70 text-ink-500")}>
              {o.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
