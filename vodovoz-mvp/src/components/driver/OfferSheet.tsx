"use client";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import type { Order } from "@/types";
import { Button, Sheet, cn } from "@/components/ui";
import { PriceInput } from "@/components/order/PriceInput";
import { splitEconomics } from "@/lib/pricing";
import { formatPrice, formatVolume } from "@/lib/format";

const ETAS = [10, 15, 20, 30, 45, 60];

/** «Предложить цену»: своя цена + через сколько минут приедет */
export function OfferSheet({
  order,
  suggestedEta,
  commissionRate,
  open,
  onClose,
  onSubmit,
}: {
  order: Order | null;
  suggestedEta: number;
  commissionRate: number;
  open: boolean;
  onClose: () => void;
  onSubmit: (price: number, eta: number, message: string) => void;
}) {
  const [price, setPrice] = useState(0);
  const [eta, setEta] = useState(15);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (order) {
      setPrice(order.clientPrice + 200);
      setEta(ETAS.find((e) => e >= suggestedEta) ?? 60);
      setMessage("");
    }
  }, [order, suggestedEta]);
  if (!order) return null;
  const econ = splitEconomics(price, commissionRate);
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`Ваше предложение · №${order.id}`}
      footer={
        <Button size="xl" full icon={<Send className="h-5 w-5" />} disabled={price < 100} onClick={() => onSubmit(price, eta, message.trim())}>
          Отправить предложение
        </Button>
      }
    >
      <div className="mb-4 rounded-2xl bg-ink-50 p-3 text-[14px]">
        <div className="flex justify-between">
          <span className="text-ink-500">Клиент предлагает</span>
          <b>{formatPrice(order.clientPrice)}</b>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-ink-500">Объём</span>
          <b>{formatVolume(order.volume)}</b>
        </div>
      </div>
      <div className="label">Ваша цена</div>
      <PriceInput value={price} onChange={setPrice} recommended={order.clientPrice} hint={null} showLevel={false} recommendLabel="Цена клиента" />
      <div className="mt-2 flex justify-between rounded-xl bg-mint-50 px-3 py-2 text-[13px] font-semibold text-mint-600">
        <span>Ваш доход после комиссии {Math.round(commissionRate * 100)}%</span>
        <span>{formatPrice(econ.driverIncome)}</span>
      </div>

      <div className="label mt-5">Через сколько минут сможете приехать?</div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {ETAS.map((e) => (
          <button key={e} type="button" onClick={() => setEta(e)} className={cn("chip", eta === e && "chip-active")}>
            {e} мин
          </button>
        ))}
      </div>

      <div className="label mt-5">Комментарий клиенту</div>
      <input className="input" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Например: шланг 30 м, помогу подключить" />
    </Sheet>
  );
}
