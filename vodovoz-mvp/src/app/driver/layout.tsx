"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { History, ListChecks, Navigation, PartyPopper, UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "@/components/layout/Toaster";
import { DemoPanel } from "@/components/layout/DemoPanel";
import { Avatar, Button, Sheet, Splash } from "@/components/ui";
import { useRequireSession } from "@/hooks/useSession";
import { useDb } from "@/hooks/useDb";
import { driverActiveOrder } from "@/lib/selectors";
import { setOrderStatus } from "@/lib/api";
import { formatPrice, formatVolume } from "@/lib/format";
import { OrderEconomics } from "@/components/order/OrderSummary";

export default function DriverLayout({ children }: { children: ReactNode }) {
  const { user, driver } = useRequireSession("driver");
  const db = useDb();
  const router = useRouter();
  const active = driver ? driverActiveOrder(db, driver.id) : undefined;

  // «Получает подтверждение»: клиент выбрал предложение водителя
  const prevActive = useRef<number | undefined>(active?.id);
  const [confirmed, setConfirmed] = useState<number | null>(null);
  useEffect(() => {
    if (active?.id && active.id !== prevActive.current && active.status === "accepted") setConfirmed(active.id);
    prevActive.current = active?.id;
  }, [active?.id, active?.status]);

  if (!user || !driver) return <Splash />;
  const confirmedOrder = db.orders.find((o) => o.id === confirmed);

  return (
    <AppShell
      tag="Водитель"
      nav={[
        { href: "/driver", label: "Заявки", icon: ListChecks, exact: true },
        { href: "/driver/active", label: "В работе", icon: Navigation, badge: active ? 1 : 0 },
        { href: "/driver/history", label: "История", icon: History },
        { href: "/driver/profile", label: "Профиль", icon: UserRound },
      ]}
      right={
        <Link href="/driver/profile" className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-3 hover:bg-ink-50">
          <Avatar name={driver.name} src={driver.avatar} size={34} online={driver.online} />
          <span className="text-sm font-bold">{driver.name}</span>
        </Link>
      }
    >
      <Toaster userId={user.id} hrefFor={(n) => (n.orderId ? (active?.id === n.orderId ? "/driver/active" : "/driver") : undefined)} />
      {children}
      <DemoPanel focusUserId={user.id} />

      <Sheet
        open={!!confirmedOrder && confirmedOrder.status === "accepted"}
        onClose={() => setConfirmed(null)}
        footer={
          <Button
            size="xl"
            variant="success"
            full
            icon={<Navigation className="h-5 w-5" />}
            onClick={() => {
              if (confirmedOrder) setOrderStatus(confirmedOrder.id, "en_route", "driver");
              setConfirmed(null);
              router.push("/driver/active");
            }}
          >
            Начать поездку
          </Button>
        }
      >
        {confirmedOrder && (
          <div className="pb-2 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-mint-50 text-mint-500">
              <PartyPopper className="h-8 w-8" />
            </div>
            <h2 className="mt-3 text-2xl font-extrabold">Клиент выбрал вас!</h2>
            <p className="mt-1 text-ink-500">
              Заказ №{confirmedOrder.id} · {formatVolume(confirmedOrder.volume)} · {formatPrice(confirmedOrder.finalPrice)}
            </p>
            <p className="mt-1 text-[15px] font-semibold">{confirmedOrder.address}</p>
            <div className="mt-4 text-left">
              <OrderEconomics order={confirmedOrder} perspective="driver" />
            </div>
          </div>
        )}
      </Sheet>
    </AppShell>
  );
}
