"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, FastForward, FlaskConical, Gauge, MapPin, MonitorSmartphone, RotateCcw, Shield, Truck, User } from "lucide-react";
import { useDb } from "@/hooks/useDb";
import { advanceOrder, resetDemo, updateSettings } from "@/lib/api";
import { login } from "@/lib/auth";
import { ACTIVE_STATUSES, DEMO_ACCOUNTS, DEMO_PASSWORD, STATUS_META } from "@/data/catalog";
import { CITIES } from "@/data/cities";
import { Button, Segmented, Sheet, cn } from "@/components/ui";
import { formatVolume } from "@/lib/format";
import type { Role } from "@/types";

const ROLE_ICONS = { client: User, driver: Truck, admin: Shield };
const ROLE_HOME: Record<Role, string> = { client: "/client", driver: "/driver", admin: "/admin" };

/**
 * Плавающая панель демо-режима: быстрый вход под любой ролью,
 * перемотка этапов заказа, скорость симуляции, смена города, сброс.
 */
export function DemoPanel({ className, focusUserId }: { className?: string; focusUserId?: string }) {
  const [open, setOpen] = useState(false);
  const db = useDb();
  const router = useRouter();

  // В режиме «два экрана» панель показывается только в родительском окне
  const embedded = typeof window !== "undefined" && window.self !== window.top;

  const active = useMemo(() => {
    const list = db.orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
    const mine = focusUserId ? list.filter((o) => o.clientId === focusUserId || db.drivers.find((d) => d.id === o.driverId)?.userId === focusUserId) : [];
    const demo = list.filter((o) => !o.botClient || db.drivers.find((d) => d.id === o.driverId && !d.isBot));
    const merged = [...mine, ...demo.filter((o) => !mine.includes(o))];
    return merged.slice(0, 4);
  }, [db, focusUserId]);

  if (embedded) return null;

  const switchRole = (role: Role) => {
    const acc = DEMO_ACCOUNTS.find((a) => a.role === role)!;
    login(acc.email, DEMO_PASSWORD);
    setOpen(false);
    router.push(ROLE_HOME[role]);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed z-[900] flex items-center gap-1.5 rounded-full bg-ink-900 py-2 pl-2.5 pr-3.5 text-[13px] font-bold text-white shadow-lift transition hover:bg-ink-800 active:scale-95",
          className ?? "bottom-[calc(5.5rem+var(--safe-bottom))] right-3 lg:bottom-6 lg:right-6",
        )}
      >
        <FlaskConical className="h-4 w-4 text-aqua-300" />
        Демо
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Демо-режим">
        <p className="-mt-1 mb-4 text-sm text-ink-500">Без SMS, банковских карт и GPS — всё имитируется. Данные хранятся в этом браузере.</p>

        <div className="label">Войти как</div>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map((a) => {
            const Icon = ROLE_ICONS[a.role];
            return (
              <button
                key={a.role}
                onClick={() => switchRole(a.role)}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-ink-200 px-2 py-3 text-[13px] font-bold text-ink-700 transition hover:border-aqua-400 hover:bg-aqua-50"
              >
                <Icon className="h-5 w-5 text-aqua-500" />
                {a.title}
              </button>
            );
          })}
        </div>
        <Link
          href="/demo"
          onClick={() => setOpen(false)}
          className="mt-2 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-aqua-500 to-aqua-700 p-3.5 text-white"
        >
          <MonitorSmartphone className="h-6 w-6 shrink-0" />
          <div className="flex-1">
            <div className="text-[15px] font-extrabold">Два экрана рядом</div>
            <div className="text-[13px] text-aqua-100">Клиент и водитель одновременно — для показа инвестору</div>
          </div>
          <ChevronRight className="h-5 w-5" />
        </Link>

        <div className="label mt-6">Активные заказы</div>
        {active.length === 0 && <div className="rounded-2xl bg-ink-50 p-3 text-sm text-ink-500">Нет активных демо-заказов. Создайте заказ от имени клиента.</div>}
        <div className="space-y-2">
          {active.map((o) => (
            <div key={o.id} className="flex items-center gap-3 rounded-2xl border border-ink-100 p-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-extrabold">
                  №{o.id} · {formatVolume(o.volume)}
                </div>
                <div className="truncate text-[13px] text-ink-500">{STATUS_META[o.status].title}</div>
              </div>
              <Button size="sm" variant="secondary" icon={<FastForward className="h-4 w-4" />} onClick={() => advanceOrder(o.id)}>
                Далее
              </Button>
            </div>
          ))}
        </div>

        <div className="label mt-6 flex items-center gap-1.5">
          <Gauge className="h-4 w-4" /> Скорость симуляции
        </div>
        <Segmented
          value={String(db.settings.demoSpeed)}
          onChange={(v) => updateSettings({ demoSpeed: Number(v) })}
          options={[
            { value: "0.5", label: "0.5×" },
            { value: "1", label: "1×" },
            { value: "2", label: "2×" },
            { value: "4", label: "4×" },
          ]}
        />

        <div className="label mt-6 flex items-center gap-1.5">
          <MapPin className="h-4 w-4" /> Тестовый город
        </div>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {CITIES.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                if (c.id === db.settings.cityId) return;
                if (confirm(`Перенести демо в город «${c.name}»? Демо-данные будут пересозданы.`)) resetDemo(c.id);
              }}
              className={cn("chip shrink-0", c.id === db.settings.cityId && "chip-active")}
            >
              {c.name}
            </button>
          ))}
        </div>

        <Button
          variant="danger"
          full
          className="mt-6"
          icon={<RotateCcw className="h-4 w-4" />}
          onClick={() => {
            if (confirm("Сбросить все демо-данные к исходному состоянию?")) {
              resetDemo();
              setOpen(false);
            }
          }}
        >
          Сбросить демо-данные
        </Button>
      </Sheet>
    </>
  );
}
