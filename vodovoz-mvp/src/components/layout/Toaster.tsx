"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Info, Tag, Truck, X } from "lucide-react";
import { useDb } from "@/hooks/useDb";
import type { AppNotification } from "@/types";
import { cn } from "@/components/ui";

const ICONS = {
  info: Info,
  offer: Tag,
  status: Truck,
  success: CheckCircle2,
  warning: Bell,
};

/** Всплывающие уведомления внутри приложения (имитация push) */
export function Toaster({ userId, hrefFor }: { userId?: string; hrefFor?: (n: AppNotification) => string | undefined }) {
  const db = useDb();
  const seen = useRef<Set<string> | null>(null);
  const [toasts, setToasts] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!userId) return;
    const mine = db.notifications.filter((n) => n.userId === userId);
    if (!seen.current) {
      seen.current = new Set(mine.map((n) => n.id));
      return;
    }
    const fresh = mine.filter((n) => !seen.current!.has(n.id));
    if (!fresh.length) return;
    fresh.forEach((n) => seen.current!.add(n.id));
    setToasts((t) => [...fresh.reverse(), ...t].slice(0, 3));
    fresh.forEach((n) => {
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== n.id)), 5000);
    });
  }, [db.notifications, userId]);

  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[1100] flex flex-col items-center gap-2 px-3 pt-[calc(.75rem+env(safe-area-inset-top))] lg:items-end lg:pr-6">
      {toasts.map((n) => {
        const Icon = ICONS[n.kind] ?? Info;
        const href = hrefFor?.(n);
        const body = (
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                n.kind === "success" ? "bg-mint-50 text-mint-600" : n.kind === "warning" ? "bg-sun-50 text-sun-600" : "bg-aqua-50 text-aqua-600",
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-extrabold leading-snug text-ink-900">{n.title}</div>
              <div className="mt-0.5 line-clamp-2 text-[13px] text-ink-500">{n.body}</div>
            </div>
          </div>
        );
        return (
          <div key={n.id} className="pointer-events-auto relative w-full max-w-sm animate-slide-up rounded-2xl bg-white/95 p-3 pr-9 shadow-lift ring-1 ring-ink-100 backdrop-blur">
            {href ? <Link href={href}>{body}</Link> : body}
            <button
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-ink-400 hover:bg-ink-100"
              onClick={() => setToasts((t) => t.filter((x) => x.id !== n.id))}
              aria-label="Закрыть"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
