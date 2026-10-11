"use client";
import { useEffect, useState } from "react";
import { FastForward, Phone, Save, Trash2, XCircle } from "lucide-react";
import type { DbState, OrderStatus } from "@/types";
import { Avatar, Button, Field, Sheet, StatusBadge } from "@/components/ui";
import { DriverInfo } from "@/components/order/DriverInfo";
import { StatusProgress } from "@/components/order/StatusProgress";
import { OrderDetails, OrderEconomics } from "@/components/order/OrderSummary";
import { advanceOrder, cancelOrder, deleteOrder, setOrderStatus, updateOrder } from "@/lib/api";
import { getDriver, getUser } from "@/lib/selectors";
import { STATUS_META, STATUS_ORDER } from "@/data/catalog";
import { formatDateTime, formatPrice } from "@/lib/format";

/** Карточка заказа в админке: клиент, водитель, смена статуса, отмена, удаление, редактирование */
export function OrderDrawer({ db, orderId, onClose }: { db: DbState; orderId: number | null; onClose: () => void }) {
  const order = db.orders.find((o) => o.id === orderId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ address: "", clientPrice: 0, finalPrice: 0, comment: "" });
  useEffect(() => {
    if (order) setForm({ address: order.address, clientPrice: order.clientPrice, finalPrice: order.finalPrice ?? 0, comment: order.comment });
    setEditing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (!order) return null;
  const client = getUser(db, order.clientId);
  const driver = getDriver(db, order.driverId);
  const final = order.status === "completed" || order.status === "cancelled";

  return (
    <Sheet
      open={!!order}
      onClose={onClose}
      wide
      title={
        <div className="flex items-center gap-3">
          Заказ №{order.id} <StatusBadge status={order.status} />
        </div>
      }
    >
      <div className="text-[13px] text-ink-400">Создан {formatDateTime(order.createdAt)} · обновлён {formatDateTime(order.updatedAt)}</div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink-100 p-4">
          <div className="label">Клиент</div>
          <div className="flex items-center gap-3">
            <Avatar name={client?.name ?? "?"} size={44} />
            <div>
              <div className="font-extrabold">{client?.name ?? "—"}</div>
              <div className="flex items-center gap-1 text-[13px] text-ink-500">
                <Phone className="h-3.5 w-3.5" /> {client?.phone}
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-ink-100 p-4">
          <div className="label">Водитель</div>
          {driver ? <DriverInfo driver={driver} /> : <div className="text-[14px] text-ink-500">Ещё не выбран · предложений: {order.offers.length}</div>}
        </div>
      </div>

      {order.offers.length > 0 && !driver && (
        <div className="mt-3 rounded-2xl bg-ink-50 p-3">
          <div className="label">Предложения водителей</div>
          <div className="space-y-1">
            {order.offers.map((o) => (
              <div key={o.id} className="flex justify-between text-[14px]">
                <span>{getDriver(db, o.driverId)?.name}</span>
                <span className="font-bold">
                  {formatPrice(o.price)} · {o.etaMin} мин
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <div className="label">Детали</div>
          {editing ? (
            <div className="space-y-3">
              <Field label="Адрес">
                <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Цена клиента">
                  <input className="input" type="number" value={form.clientPrice} onChange={(e) => setForm({ ...form, clientPrice: Number(e.target.value) })} />
                </Field>
                <Field label="Итоговая цена">
                  <input className="input" type="number" value={form.finalPrice} onChange={(e) => setForm({ ...form, finalPrice: Number(e.target.value) })} />
                </Field>
              </div>
              <Field label="Комментарий">
                <input className="input" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
              </Field>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  icon={<Save className="h-4 w-4" />}
                  onClick={() => {
                    updateOrder(order.id, {
                      address: form.address,
                      clientPrice: form.clientPrice,
                      comment: form.comment,
                      ...(order.driverId ? { finalPrice: form.finalPrice } : {}),
                    });
                    setEditing(false);
                  }}
                >
                  Сохранить
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <>
              <OrderDetails order={order} />
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setEditing(true)}>
                Редактировать данные
              </Button>
            </>
          )}
          <div className="mt-4">
            <OrderEconomics order={order} perspective="admin" />
          </div>
        </div>
        <div>
          <div className="label">Статусы</div>
          <StatusProgress order={order} />
          {order.cancelReason && order.status === "cancelled" && <div className="mt-2 text-[13px] text-coral-600">Причина: {order.cancelReason}</div>}
          {order.rating && (
            <div className="mt-3 rounded-2xl bg-sun-50 p-3 text-[14px]">
              <b>{"★".repeat(order.rating.stars)}</b> {order.rating.text}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-ink-50 p-4">
        <div className="label">Управление</div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="input h-11 w-auto min-w-[220px]"
            value={order.status}
            onChange={(e) => setOrderStatus(order.id, e.target.value as OrderStatus, "admin")}
          >
            {STATUS_ORDER.map((s, i) => (
              <option key={s} value={s}>
                {i + 1}. {STATUS_META[s].title}
              </option>
            ))}
          </select>
          {!final && (
            <Button variant="secondary" icon={<FastForward className="h-4 w-4" />} onClick={() => advanceOrder(order.id)}>
              Следующий этап
            </Button>
          )}
          {!final && (
            <Button variant="danger" icon={<XCircle className="h-4 w-4" />} onClick={() => cancelOrder(order.id, "admin", "Отменён администратором")}>
              Отменить заказ
            </Button>
          )}
          <Button
            variant="ghost"
            className="text-coral-600"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => {
              if (confirm(`Удалить заказ №${order.id}? Действие необратимо.`)) {
                deleteOrder(order.id);
                onClose();
              }
            }}
          >
            Удалить
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

