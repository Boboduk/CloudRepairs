"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, ClipboardList, Coins, Percent, Star, Truck, Wallet } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { HourChart } from "@/components/admin/HourChart";
import { AdminMap } from "@/components/admin/AdminMap";
import { OrderDrawer } from "@/components/admin/OrderDrawer";
import { Avatar, RatingPill, StatusBadge } from "@/components/ui";
import { useDb } from "@/hooks/useDb";
import { useNow } from "@/hooks/useNow";
import { adminStats, getDriver, getUser, isActive } from "@/lib/selectors";
import { formatNumber, formatPrice, formatTime, formatVolume } from "@/lib/format";

export default function AdminDashboard() {
  const db = useDb();
  const now = useNow(5000);
  const stats = useMemo(() => adminStats(db, now), [db, now]);
  const [openId, setOpenId] = useState<number | null>(null);
  const active = db.orders.filter(isActive).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const topDrivers = [...db.drivers].sort((a, b) => b.ordersCompleted - a.ordersCompleted).slice(0, 5);
  const pct = Math.round(db.settings.commissionRate * 1000) / 10;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight">Статистика</h1>
          <p className="text-ink-500">Сегодня, {new Date(now).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })} · обновляется в реальном времени</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl bg-mint-50 px-3 py-1.5 text-[13px] font-bold text-mint-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-mint-500" /> Live
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={ClipboardList} label="Заказов сегодня" value={stats.ordersToday} hint={`${stats.completedToday} завершено · ${stats.cancelledToday} отменено`} />
        <StatCard icon={Activity} label="Активных заказов" value={stats.activeOrders} hint="поиск + в работе" />
        <StatCard icon={Truck} label="Водителей онлайн" value={stats.driversOnline} hint={`из ${stats.driversTotal} в базе`} />
        <StatCard icon={Wallet} label="Выручка сегодня" value={formatPrice(stats.revenueToday)} hint={`средний чек ${formatPrice(stats.avgCheck)}`} accent />
        <StatCard icon={Percent} label={`Комиссия сервиса (${pct}%)`} value={formatPrice(stats.commissionToday)} hint={`за всё время ${formatPrice(stats.commissionTotal)}`} />
        <StatCard icon={Star} label="Средний рейтинг" value={stats.avgRating.toFixed(2).replace(".", ",")} hint="по всем водителям" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="card overflow-hidden p-0">
          <div className="flex items-center justify-between px-5 pt-4">
            <h2 className="text-lg font-extrabold">Карта: водители и заказы</h2>
            <div className="flex items-center gap-3 text-[12px] font-semibold text-ink-500">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-sun-500" /> поиск
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-aqua-500" /> в работе
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-ink-300" /> офлайн
              </span>
            </div>
          </div>
          <div className="relative isolate z-0 mt-3 h-[420px]">
            <AdminMap db={db} onOrder={(o) => setOpenId(o.id)} className="h-full w-full" />
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Активные заказы</h2>
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-[13px] font-bold text-aqua-600">
              Все <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="max-h-[400px] space-y-2 overflow-y-auto">
            {active.length === 0 && <div className="py-8 text-center text-sm text-ink-400">Нет активных заказов</div>}
            {active.map((o) => (
              <button key={o.id} onClick={() => setOpenId(o.id)} className="flex w-full items-center gap-3 rounded-2xl border border-ink-100 p-3 text-left hover:bg-ink-50">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[14px] font-extrabold">
                    №{o.id} · {formatVolume(o.volume)} · {formatPrice(o.finalPrice ?? o.clientPrice)}
                  </div>
                  <div className="truncate text-[12px] text-ink-500">
                    {getUser(db, o.clientId)?.name} → {getDriver(db, o.driverId)?.name ?? "ищем водителя"}
                  </div>
                </div>
                <StatusBadge status={o.status} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Заказы по часам, сегодня</h2>
            <span className="text-[13px] text-ink-400">всего {stats.ordersToday}</span>
          </div>
          <div className="mt-4">
            <HourChart data={stats.byHour} nowHour={new Date(now).getHours()} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-ink-100 pt-4 text-center">
            <div>
              <div className="text-[12px] font-semibold text-ink-400">Оборот за всё время</div>
              <div className="font-extrabold">{formatPrice(stats.revenueTotal)}</div>
            </div>
            <div>
              <div className="text-[12px] font-semibold text-ink-400">Доход водителей</div>
              <div className="font-extrabold">{formatPrice(stats.revenueTotal - stats.commissionTotal)}</div>
            </div>
            <div>
              <div className="text-[12px] font-semibold text-ink-400">Доход сервиса</div>
              <div className="font-extrabold text-aqua-700">{formatPrice(stats.commissionTotal)}</div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Топ водителей</h2>
            <Coins className="h-5 w-5 text-ink-300" />
          </div>
          <div className="space-y-2">
            {topDrivers.map((d, i) => (
              <div key={d.id} className="flex items-center gap-3">
                <span className="w-4 text-[13px] font-bold text-ink-400">{i + 1}</span>
                <Avatar name={d.name} src={d.avatar} size={36} online={d.online} />
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-bold">{d.name}</div>
                  <div className="text-[12px] text-ink-400">
                    {d.car.brand} · {formatNumber(d.ordersCompleted)} заказов
                  </div>
                </div>
                <RatingPill value={d.rating} />
              </div>
            ))}
          </div>
          <div className="mt-4 text-[12px] text-ink-400">Последнее обновление: {formatTime(new Date(now).toISOString())}</div>
        </div>
      </div>

      <OrderDrawer db={db} orderId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
