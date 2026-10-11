"use client";
import { useMemo, useState } from "react";
import { Ban, Search, Unlock } from "lucide-react";
import { Avatar, Badge, Button } from "@/components/ui";
import { useDb } from "@/hooks/useDb";
import { updateUser } from "@/lib/api";
import { formatPrice, formatShortDate } from "@/lib/format";

export default function AdminClientsPage() {
  const db = useDb();
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return db.users
      .filter((u) => u.role === "client")
      .filter((u) => !query || u.name.toLowerCase().includes(query) || u.phone.includes(query) || u.email.toLowerCase().includes(query))
      .map((u) => {
        const orders = db.orders.filter((o) => o.clientId === u.id);
        const done = orders.filter((o) => o.status === "completed");
        return { u, count: orders.length, sum: done.reduce((s, o) => s + (o.finalPrice ?? o.clientPrice), 0), last: orders[0]?.createdAt };
      })
      .sort((a, b) => b.count - a.count);
  }, [db, q]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[28px] font-extrabold tracking-tight">Клиенты</h1>
        <p className="text-ink-500">{rows.length} клиентов</p>
      </div>
      <div className="card mb-4 p-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input className="input pl-10" placeholder="Имя, телефон или e-mail" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-ink-100 text-[12px] font-bold uppercase tracking-wide text-ink-400">
              {["Имя", "Телефон", "Количество заказов", "Сумма заказов", "Дата регистрации", "Статус", ""].map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ u, count, sum }) => (
              <tr key={u.id} className="border-b border-ink-50 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} size={36} />
                    <div>
                      <div className="font-bold">{u.name}</div>
                      <div className="text-[12px] text-ink-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-600">{u.phone}</td>
                <td className="px-4 py-3 font-semibold">{count}</td>
                <td className="px-4 py-3 font-semibold tabular">{formatPrice(sum)}</td>
                <td className="px-4 py-3 text-ink-500">{formatShortDate(u.createdAt)}</td>
                <td className="px-4 py-3">{u.blocked ? <Badge tone="danger">Заблокирован</Badge> : <Badge tone="success">Активен</Badge>}</td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant={u.blocked ? "secondary" : "ghost"}
                    icon={u.blocked ? <Unlock className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                    onClick={() => updateUser(u.id, { blocked: !u.blocked })}
                  >
                    {u.blocked ? "Разблокировать" : "Заблокировать"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
