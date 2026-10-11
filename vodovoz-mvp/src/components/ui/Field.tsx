import type { ReactNode } from "react";
import { cn } from "./cn";

export function Field({ label, hint, children, className }: { label?: ReactNode; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      {label && <span className="mb-1.5 block text-sm font-semibold text-ink-600">{label}</span>}
      {children}
      {hint && <span className="mt-1.5 block text-[13px] text-ink-400">{hint}</span>}
    </label>
  );
}
