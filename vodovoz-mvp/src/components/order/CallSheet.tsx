"use client";
import { useEffect, useState } from "react";
import { Mic, PhoneOff, Volume2 } from "lucide-react";
import { Avatar, Sheet } from "@/components/ui";
import { maskPhone } from "@/lib/format";

/** Имитация звонка через подменный номер (в продакшене — телефония с маскировкой номеров) */
export function CallSheet({ name, phone, open, onClose }: { name: string; phone: string; open: boolean; onClose: () => void }) {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    if (!open) return;
    setSec(0);
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [open]);
  const connected = sec >= 3;
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex flex-col items-center pb-4 pt-2 text-center">
        <div className="relative">
          {!connected && <span className="absolute inset-0 animate-ripple rounded-[32%] bg-aqua-400" />}
          <Avatar name={name} size={96} />
        </div>
        <div className="mt-4 text-2xl font-extrabold">{name}</div>
        <div className="mt-1 text-sm text-ink-500">{maskPhone(phone)} · защищённый номер</div>
        <div className="mt-3 text-lg font-bold text-aqua-600 tabular">
          {connected ? `${String(Math.floor((sec - 3) / 60)).padStart(2, "0")}:${String((sec - 3) % 60).padStart(2, "0")}` : "Вызов…"}
        </div>
        <div className="mt-8 flex items-center gap-6">
          <button className="grid h-14 w-14 place-items-center rounded-full bg-ink-100 text-ink-600" aria-label="Микрофон">
            <Mic className="h-6 w-6" />
          </button>
          <button onClick={onClose} className="grid h-16 w-16 place-items-center rounded-full bg-coral-500 text-white shadow-lg" aria-label="Завершить">
            <PhoneOff className="h-7 w-7" />
          </button>
          <button className="grid h-14 w-14 place-items-center rounded-full bg-ink-100 text-ink-600" aria-label="Динамик">
            <Volume2 className="h-6 w-6" />
          </button>
        </div>
        <p className="mt-6 text-xs text-ink-400">Демо-режим: реальное соединение не устанавливается</p>
      </div>
    </Sheet>
  );
}
