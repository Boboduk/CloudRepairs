"use client";
import Link from "next/link";
import { Bell, CheckCircle2, Info, Tag, Truck } from "lucide-react";
import type { AppNotification } from "@/types";
import { EmptyState, cn } from "@/components/ui";
import { relativeTime } from "@/lib/format";

const ICONS = { info: Info, offer: Tag, status: Truck, success: CheckCircle2, warning: Bell };

export function NotificationList({ items, hrefFor }: { items: AppNotification[]; hrefFor?: (n: AppNotification) => string | undefined }) {
  if (!items.length) return <EmptyState icon={<Bell className="h-8 w-8" />} title="Уведомлений нет" text="Здесь появятся предложения водителей и статусы заказов." />;
  return (
    <div className="space-y-2">
      {items.map((n) => {
        const Icon = ICONS[n.kind] ?? Info;
        const href = hrefFor?.(n);
        const content = (
          <div className={cn("flex gap-3 rounded-2xl p-3.5 transition", n.read ? "bg-white" : "bg-aqua-50/70 ring-1 ring-aqua-100", href && "hover:bg-ink-50")}>
            <div
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                n.kind === "success" ? "bg-mint-50 text-mint-600" : n.kind === "warning" ? "bg-sun-50 text-sun-600" : "bg-white text-aqua-600 ring-1 ring-aqua-100",
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="text-[15px] font-extrabold leading-snug">{n.title}</div>
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-aqua-500" />}
              </div>
              <div className="mt-0.5 text-[14px] text-ink-500">{n.body}</div>
              <div className="mt-1 text-[12px] font-semibold text-ink-400">{relativeTime(n.at)}</div>
            </div>
          </div>
        );
        return href ? (
          <Link key={n.id} href={href} className="block">
            {content}
          </Link>
        ) : (
          <div key={n.id}>{content}</div>
        );
      })}
    </div>
  );
}
