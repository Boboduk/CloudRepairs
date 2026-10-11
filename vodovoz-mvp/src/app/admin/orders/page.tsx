"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { OrderDrawer } from "@/components/admin/OrderDrawer";
import { Segmented, StatusBadge } from "@/components/ui";
import { useDb } from "@/hooks/useDb";
import { getDriver, getUser, isActive, isToday } from "@/lib/selectors";
import { STATUS_META, STATUS_ORDER } from "@/data/catalog";
import { formatPrice, formatShortDate, formatTime, formatVolume } from "@/lib/format";
import type { OrderStatus } from "@/types";

type Period = "all" | "today";

export default function AdminOrdersPage() {
  const db = useDb();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | OrderStatus>("all");
  const [period, setPeriod] = useState<Period>("all");
  const [openId, setOpenId] = useState<number | null>(null);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return db.orders
      .filter((o) => (status === "all" ? true : status === "active" ? isActive(o) : o.status === status))
      .filter((o) => (period === "today" ? isToday(o.createdAt) : true))
      .map((o) => ({ o, client: getUser(db, o.clientId), driver: getDriver(db, o.driverId) }))
      .filter(({ o, client, driver }) =>
        !query
          ? true
          : String(o.id).includes(query) ||
            o.address.toLowerCase().includes(query) ||
            client?.name.toLowerCase().includes(query) ||
            client?.phone.includes(query) ||
            driver?.name.toLowerCase().includes(query),
      )
      .sort((a, b) => Date.parse(b.o.createdAt) - Date.parse(a.o.createdAt));
  }, [db, q, status, period]);

  const total = rows.filter((r) => r.o.status === "completed").reduce((s, r) => s + (r.o.finalPrice ?? r.o.clientPrice), 0);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight">Заказы</h1>
          <p className="text-ink-500">
            Найдено {rows.length} · сумма завершённых {formatPrice(total)}
          </p>
        </div>
        <Segmented
          className="w-full sm:w-auto"
          value={period}
          onChange={setPeriod}
          options={[
            { value: "all", label: "Все даты" },
            { value: "today", label: "Сегодня" },
          ]}
        />
      </div>

      <div className="card mb-4 flex flex-col gap-2 p-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input className="input pl-10" placeholder="Поиск: №, клиент, телефон, адрес, водитель" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input sm:w-64" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="all">Все статусы</option>
          <option value="active">Только активные</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].title}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-ink-100 text-[12px] font-bold uppercase tracking-wide text-ink-400">
              {["ID", "Клиент", "Объём", "Адрес", "Водитель", "Цена", "Статус", "Дата"].map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ o, client, driver }) => (
              <tr key={o.id} onClick={() => setOpenId(o.id)} className="cursor-pointer border-b border-ink-50 transition last:border-0 hover:bg-aqua-50/50">
                <td className="px-4 py-3 font-extrabold">№{o.id}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold">{client?.name ?? "—"}</div>
                  <div className="text-[12px] text-ink-400">{client?.phone}</div>
                </td>
                <td className="px-4 py-3 font-semibold">{formatVolume(o.volume)}</td>
                <td className="max-w-[240px] truncate px-4 py-3 text-ink-600">{o.address}</td>
                <td className="px-4 py-3">{driver?.name ?? <span className="text-ink-400">—</span>}</td>
                <td className="px-4 py-3 font-bold tabular">{formatPrice(o.finalPrice ?? o.clientPrice)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-500">
                  {formatShortDate(o.createdAt)} <span className="text-ink-400">{formatTime(o.createdAt)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="py-12 text-center text-ink-400">Ничего не найдено</div>}
      </div>

      <OrderDrawer db={db} orderId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
