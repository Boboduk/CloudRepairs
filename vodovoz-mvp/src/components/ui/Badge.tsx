import type { ReactNode } from "react";
import type { OrderStatus } from "@/types";
import { STATUS_META, type StatusMeta } from "@/data/catalog";
import { cn } from "./cn";

const tones: Record<StatusMeta["tone"], string> = {
  neutral: "bg-ink-100 text-ink-600",
  info: "bg-aqua-50 text-aqua-700",
  progress: "bg-aqua-500 text-white",
  success: "bg-mint-50 text-mint-600",
  danger: "bg-coral-50 text-coral-600",
  warning: "bg-sun-50 text-sun-600",
};

export function Badge({
  tone = "neutral",
  children,
  className,
  dot,
}: {
  tone?: StatusMeta["tone"];
  children: ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold", tones[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const m = STATUS_META[status];
  return (
    <Badge tone={m.tone} className={className} dot>
      {m.title}
    </Badge>
  );
}
