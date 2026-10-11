"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { PageContainer, PageTitle } from "@/components/layout/AppShell";
import { OrderCard } from "@/components/order/OrderCard";
import { Button, EmptyState, Segmented } from "@/components/ui";
import { useDb } from "@/hooks/useDb";
import { useSession } from "@/hooks/useSession";
import { clientOrders, getDriver, isActive } from "@/lib/selectors";
import { formatPrice } from "@/lib/format";

type Filter = "all" | "active" | "completed" | "cancelled";

export default function ClientOrdersPage() {
  const db = useDb();
  const { user } = useSession("client");
  const [filter, setFilter] = useState<Filter>("all");
  const all = useMemo(() => (user ? clientOrders(db, user.id) : []), [db, user]);
  const groups = {
    all,
    active: all.filter(isActive),
    completed: all.filter((o) => o.status === "completed"),
    cancelled: all.filter((o) => o.status === "cancelled"),
  };
  const list = groups[filter];
  const spent = groups.completed.reduce((s, o) => s + (o.finalPrice ?? o.clientPrice), 0);
  const liters = groups.completed.reduce((s, o) => s + o.volume, 0);

  return (
    <PageContainer>
      <PageTitle title="Мои заказы" subtitle={`Доставлено ${liters} м³ воды · ${formatPrice(spent)}`} />
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: "Все", count: groups.all.length },
          { value: "active", label: "Активные", count: groups.active.length },
          { value: "completed", label: "Завершённые", count: groups.completed.length },
          { value: "cancelled", label: "Отменённые", count: groups.cancelled.length },
        ]}
      />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {list.map((o) => (
          <OrderCard key={o.id} order={o} driver={getDriver(db, o.driverId)} href={`/client/order/${o.id}`} />
        ))}
      </div>
      {list.length === 0 && (
        <EmptyState
          icon={<ClipboardList className="h-8 w-8" />}
          title="Здесь пока пусто"
          text="Закажите воду — история появится здесь."
          action={
            <Link href="/client">
              <Button>Заказать воду</Button>
            </Link>
          }
        />
      )}
    </PageContainer>
  );
}
