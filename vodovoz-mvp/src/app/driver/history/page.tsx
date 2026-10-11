"use client";
import { useMemo, useState } from "react";
import { History } from "lucide-react";
import { PageContainer, PageTitle } from "@/components/layout/AppShell";
import { EmptyState, Segmented, Stars, StatusBadge } from "@/components/ui";
import { useDb } from "@/hooks/useDb";
import { useSession } from "@/hooks/useSession";
import { orderEconomics } from "@/lib/pricing";
import { getUser, isToday } from "@/lib/selectors";
import { formatDateTime, formatPrice, formatVolume } from "@/lib/format";

type Filter = "all" | "today" | "week";

export default function DriverHistoryPage() {
  const db = useDb();
  const { driver } = useSession("driver");
  const [filter, setFilter] = useState<Filter>("all");
  const list = useMemo(() => {
    if (!driver) return [];
    const now = Date.now();
    return db.orders
      .filter((o) => o.driverId === driver.id && (o.status === "completed" || o.status === "cancelled"))
      .filter((o) => (filter === "today" ? isToday(o.updatedAt, now) : filter === "week" ? now - Date.parse(o.updatedAt) < 7 * 86400000 : true))
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }, [db, driver, filter]);
  if (!driver) return null;
  const completed = list.filter((o) => o.status === "completed");
  const income = completed.reduce((s, o) => s + orderEconomics(o).driverIncome, 0);
  const commission = completed.reduce((s, o) => s + orderEconomics(o).commission, 0);

  return (
    <PageContainer>
      <PageTitle title="История заказов" subtitle={`Всего выполнено: ${driver.ordersCompleted}`} />
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: "Всё время" },
          { value: "week", label: "Неделя" },
          { value: "today", label: "Сегодня" },
        ]}
      />
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="card p-3">
          <div className="text-[12px] font-semibold text-ink-400">Доход</div>
          <div className="text-lg font-extrabold text-mint-600">{formatPrice(income)}</div>
        </div>
        <div className="card p-3">
          <div className="text-[12px] font-semibold text-ink-400">Заказов</div>
          <div className="text-lg font-extrabold">{completed.length}</div>
        </div>
        <div className="card p-3">
          <div className="text-[12px] font-semibold text-ink-400">Комиссия</div>
          <div className="text-lg font-extrabold text-ink-500">{formatPrice(commission)}</div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {list.map((o) => {
          const e = orderEconomics(o);
          return (
            <div key={o.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-extrabold">
                    №{o.id} · {formatVolume(o.volume)}
                  </div>
                  <div className="truncate text-[14px] text-ink-600">{o.address}</div>
                  <div className="text-[12px] text-ink-400">
                    {formatDateTime(o.updatedAt)} · {getUser(db, o.clientId)?.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[17px] font-extrabold text-mint-600">{o.status === "completed" ? `+${formatPrice(e.driverIncome)}` : "—"}</div>
                  <div className="text-[12px] text-ink-400">из {formatPrice(e.total)}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
                <StatusBadge status={o.status} />
                {o.rating ? <Stars value={o.rating.stars} size={14} /> : <span className="text-[12px] text-ink-400">без оценки</span>}
              </div>
            </div>
          );
        })}
      </div>
      {list.length === 0 && <EmptyState icon={<History className="h-8 w-8" />} title="Пока нет выполненных заказов" text="Выйдите на линию и примите первую заявку." />}
    </PageContainer>
  );
}
