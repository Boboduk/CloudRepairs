import type { ComponentType, ReactNode } from "react";
import { cn } from "@/components/ui";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className={cn("rounded-3xl p-4 lg:p-5", accent ? "bg-gradient-to-br from-aqua-500 to-aqua-800 text-white shadow-glow" : "card")}>
      <div className="flex items-center justify-between">
        <span className={cn("text-[13px] font-semibold", accent ? "text-aqua-100" : "text-ink-500")}>{label}</span>
        <span className={cn("grid h-8 w-8 place-items-center rounded-xl", accent ? "bg-white/15" : "bg-aqua-50 text-aqua-600")}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-2 text-[26px] font-extrabold leading-tight tracking-tight tabular lg:text-[30px]">{value}</div>
      {hint && <div className={cn("mt-1 text-[12px] font-semibold", accent ? "text-aqua-100" : "text-ink-400")}>{hint}</div>}
    </div>
  );
}
