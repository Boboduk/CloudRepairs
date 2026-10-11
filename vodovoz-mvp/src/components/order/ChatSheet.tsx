"use client";
import { useEffect, useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";
import type { Order } from "@/types";
import { Avatar, Sheet, cn } from "@/components/ui";
import { sendChat } from "@/lib/api";
import { formatTime } from "@/lib/format";

const QUICK = {
  client: ["Я на месте, жду", "Ворота открыты", "Позвоните, как подъедете"],
  driver: ["Выезжаю", "Буду через 10 минут", "Я на месте, выходите"],
};

/** Чат клиента и водителя (в демо — внутри приложения, без реальной связи) */
export function ChatSheet({ order, me, peerName, open, onClose }: { order: Order; me: "client" | "driver"; peerName: string; open: boolean; onClose: () => void }) {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [order.chat.length, open]);

  const send = (t: string) => {
    if (!t.trim()) return;
    sendChat(order.id, me, t.trim());
    setText("");
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <Avatar name={peerName} size={34} />
          <div>
            <div className="text-[16px] leading-tight">{peerName}</div>
            <div className="text-xs font-semibold text-mint-600">в сети</div>
          </div>
        </div>
      }
      footer={
        <div>
          <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto">
            {QUICK[me].map((q) => (
              <button key={q} onClick={() => send(q)} className="shrink-0 rounded-xl bg-ink-50 px-3 py-1.5 text-[13px] font-semibold text-ink-600 hover:bg-ink-100">
                {q}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
            className="flex gap-2"
          >
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Сообщение…" className="input flex-1" />
            <button type="submit" className="grid h-12 w-12 place-items-center rounded-2xl bg-aqua-500 text-white" aria-label="Отправить">
              <SendHorizonal className="h-5 w-5" />
            </button>
          </form>
        </div>
      }
    >
      <div className="min-h-[220px] space-y-2 py-2">
        {order.chat.length === 0 && <div className="py-10 text-center text-sm text-ink-400">Напишите {me === "client" ? "водителю" : "клиенту"} — например, как подъехать к дому</div>}
        {order.chat.map((m) => (
          <div key={m.id} className={cn("flex", m.from === me ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2 text-[15px]", m.from === me ? "rounded-br-md bg-aqua-500 text-white" : "rounded-bl-md bg-ink-100 text-ink-900")}>
              {m.text}
              <div className={cn("mt-0.5 text-right text-[11px]", m.from === me ? "text-aqua-100" : "text-ink-400")}>{formatTime(m.at)}</div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </Sheet>
  );
}
