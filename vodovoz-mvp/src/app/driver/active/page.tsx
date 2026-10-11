"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Droplets, MapPinned, MessageCircle, Navigation, Phone, Play, Truck, XCircle } from "lucide-react";
import { MapLayout } from "@/components/layout/AppShell";
import { Map, type MapMarker } from "@/components/map/Map";
import { Avatar, Button, EmptyState, StatusBadge } from "@/components/ui";
import { StatusProgress } from "@/components/order/StatusProgress";
import { OrderDetails, OrderEconomics } from "@/components/order/OrderSummary";
import { ChatSheet } from "@/components/order/ChatSheet";
import { CallSheet } from "@/components/order/CallSheet";
import { CancelSheet } from "@/components/order/CancelSheet";
import { useDb } from "@/hooks/useDb";
import { useSession } from "@/hooks/useSession";
import { useTracking } from "@/hooks/useTracking";
import { cancelOrder, setOrderStatus } from "@/lib/api";
import { driverActiveOrder, getUser } from "@/lib/selectors";
import { orderEconomics } from "@/lib/pricing";
import { STATUS_META } from "@/data/catalog";
import { formatPrice, formatVolume, plural } from "@/lib/format";
import type { OrderStatus } from "@/types";

const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string; icon: typeof Play; variant: "primary" | "success" }>> = {
  accepted: { to: "en_route", label: "Начать поездку", icon: Navigation, variant: "primary" },
  en_route: { to: "arrived", label: "Я прибыл", icon: MapPinned, variant: "primary" },
  arrived: { to: "delivering", label: "Начать слив воды", icon: Droplets, variant: "primary" },
  delivering: { to: "completed", label: "Завершить доставку", icon: CheckCircle2, variant: "success" },
};

export default function DriverActivePage() {
  const db = useDb();
  const { driver } = useSession("driver");
  const [chat, setChat] = useState(false);
  const [call, setCall] = useState(false);
  const [cancel, setCancel] = useState(false);

  const active = driver ? driverActiveOrder(db, driver.id) : undefined;
  // Только что завершённый заказ — показываем итог
  const recent = useMemo(() => {
    if (!driver || active) return undefined;
    return db.orders
      .filter((o) => o.driverId === driver.id && o.status === "completed" && Date.now() - Date.parse(o.updatedAt) < 10 * 60000)
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0];
  }, [db, driver, active]);
  const order = active ?? recent;
  const tracking = useTracking(order, driver ?? undefined, db.settings.demoSpeed);

  if (!driver) return null;
  if (!order) {
    return (
      <EmptyState
        icon={<Truck className="h-8 w-8" />}
        title="Нет заказа в работе"
        text="Примите заявку в ленте — после подтверждения клиентом заказ появится здесь."
        action={
          <Link href="/driver">
            <Button>К заявкам</Button>
          </Link>
        }
      />
    );
  }

  const client = getUser(db, order.clientId);
  const next = NEXT[order.status];
  const econ = orderEconomics(order);

  const markers: MapMarker[] = [
    { id: "me", kind: "truck", position: tracking.position ?? driver.location, color: driver.car.color, active: order.status === "en_route", label: "Вы" },
    { id: "client", kind: "client", position: order.location, pulse: order.status !== "completed" },
  ];

  return (
    <MapLayout
      mapHeight="44dvh"
      map={
        <Map
          center={order.location}
          zoom={14}
          markers={markers}
          route={tracking.route}
          routeActive={tracking.remaining}
          fit={tracking.route ?? [order.location]}
          fitKey={`${order.id}-${order.status}-${tracking.route?.length ?? 0}`}
          padding={[70, 60]}
          className="h-full w-full"
        />
      }
      overlay={
        order.status === "en_route" ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex justify-end p-3 pt-[calc(.75rem+env(safe-area-inset-top))]">
            <div className="rounded-2xl bg-ink-900 px-3.5 py-2 text-white shadow-lift">
              <div className="text-[11px] font-semibold text-ink-300">До клиента</div>
              <div className="text-lg font-extrabold leading-tight tabular">{tracking.etaLeft} мин</div>
            </div>
          </div>
        ) : undefined
      }
    >
      <div className="px-5 pb-8 lg:px-7 lg:pt-5">
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-ink-400">Заказ №{order.id}</span>
          <StatusBadge status={order.status} />
        </div>

        {order.status === "completed" ? (
          <div className="py-4 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-mint-50 text-mint-500">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h1 className="mt-3 text-[26px] font-extrabold">Доставка завершена</h1>
            <p className="text-ink-500">
              {formatVolume(order.volume)} · {order.address}
            </p>
            <div className="mt-4 rounded-3xl bg-mint-50 p-4">
              <div className="text-[13px] font-semibold text-mint-600">Ваш доход</div>
              <div className="text-3xl font-extrabold text-ink-900">{formatPrice(econ.driverIncome)}</div>
            </div>
            <div className="mt-4 text-left">
              <OrderEconomics order={order} perspective="driver" />
            </div>
            {order.rating && <div className="mt-3 text-[15px] font-semibold">Оценка клиента: {"★".repeat(order.rating.stars)}</div>}
            <Link href="/driver">
              <Button size="xl" full className="mt-5">
                К ленте заявок
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-2 text-[26px] font-extrabold leading-tight tracking-tight">{STATUS_META[order.status].title}</h1>
            <p className="mt-1 text-[15px] text-ink-500">
              {order.status === "accepted" && "Клиент подтвердил заказ. Нажмите «Начать поездку», когда выедете."}
              {order.status === "en_route" &&
                (tracking.progress >= 1 ? "Вы на месте — отметьте прибытие." : `Осталось ≈ ${tracking.etaLeft} ${plural(tracking.etaLeft, "минута", "минуты", "минут")} · клиент видит вас на карте`)}
              {order.status === "arrived" && "Подключите шланг и начните слив воды."}
              {order.status === "delivering" && `Слито ${Math.round(tracking.delivery * order.volume * 10) / 10} из ${formatVolume(order.volume)}`}
            </p>

            {order.status === "delivering" && (
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-aqua-50">
                <div className="h-full rounded-full bg-gradient-to-r from-aqua-300 to-aqua-600 transition-all" style={{ width: `${Math.round(tracking.delivery * 100)}%` }} />
              </div>
            )}
            {order.status === "en_route" && (
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-aqua-500 transition-all" style={{ width: `${Math.round(tracking.progress * 100)}%` }} />
              </div>
            )}

            {next && (
              <Button
                size="xl"
                variant={next.variant}
                full
                className="mt-5"
                icon={<next.icon className="h-5 w-5" />}
                onClick={() => setOrderStatus(order.id, next.to, "driver")}
              >
                {next.label}
              </Button>
            )}

            <div className="mt-5 rounded-3xl bg-white p-4 shadow-soft ring-1 ring-ink-100">
              <div className="flex items-center gap-3">
                <Avatar name={client?.name ?? "Клиент"} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-ink-400">Клиент</div>
                  <div className="truncate text-[17px] font-extrabold">{client?.name ?? "Клиент"}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-extrabold">{formatPrice(order.finalPrice)}</div>
                  <div className="text-[12px] text-ink-400">{formatVolume(order.volume)}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Button variant="secondary" icon={<Phone className="h-4 w-4" />} onClick={() => setCall(true)}>
                  Позвонить
                </Button>
                <Button variant="secondary" icon={<MessageCircle className="h-4 w-4" />} onClick={() => setChat(true)}>
                  Чат
                </Button>
                <Button
                  variant="secondary"
                  icon={<Navigation className="h-4 w-4" />}
                  onClick={() => window.open(`https://www.openstreetmap.org/directions?to=${order.location.lat},${order.location.lng}`, "_blank")}
                >
                  Маршрут
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <div className="label">Заказ</div>
              <OrderDetails order={order} />
              <div className="mt-4">
                <OrderEconomics order={order} perspective="driver" />
              </div>
            </div>
            <div className="mt-6">
              <div className="label">Статусы</div>
              <StatusProgress order={order} />
            </div>
            {order.status !== "delivering" && (
              <Button variant="ghost" full className="mt-4 text-coral-600" icon={<XCircle className="h-4 w-4" />} onClick={() => setCancel(true)}>
                Отказаться от заказа
              </Button>
            )}
          </>
        )}
      </div>

      <ChatSheet order={order} me="driver" peerName={client?.name ?? "Клиент"} open={chat} onClose={() => setChat(false)} />
      <CallSheet name={client?.name ?? "Клиент"} phone={client?.phone ?? ""} open={call} onClose={() => setCall(false)} />
      <CancelSheet
        open={cancel}
        onClose={() => setCancel(false)}
        warning="Частые отказы снижают рейтинг водителя."
        reasons={["Сломалась машина", "Не успеваю к клиенту", "Не могу подъехать к адресу", "Другое"]}
        onConfirm={(reason) => {
          cancelOrder(order.id, "driver", `Водитель отказался: ${reason.toLowerCase()}`);
          setCancel(false);
        }}
      />
    </MapLayout>
  );
}
