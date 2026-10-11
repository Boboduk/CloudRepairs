"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, CreditCard, HelpCircle, LogOut, MapPin, Pencil, Repeat, ShieldCheck } from "lucide-react";
import { PageContainer } from "@/components/layout/AppShell";
import { Avatar, Button, Field, Sheet, Toggle } from "@/components/ui";
import { useDb } from "@/hooks/useDb";
import { useSession } from "@/hooks/useSession";
import { logout } from "@/lib/auth";
import { toggleRecurring, updateUser } from "@/lib/api";
import { clientOrders, scheduleLabel } from "@/lib/selectors";
import { formatDate, formatPrice, formatVolume } from "@/lib/format";

export default function ClientProfilePage() {
  const db = useDb();
  const router = useRouter();
  const { user } = useSession("client");
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  const orders = useMemo(() => (user ? clientOrders(db, user.id) : []), [db, user]);
  if (!user) return null;
  const completed = orders.filter((o) => o.status === "completed");
  const recurring = orders.filter((o) => o.schedule.type === "recurring" && o.status !== "cancelled");
  const addresses = Array.from(new Set(orders.map((o) => o.address))).slice(0, 4);

  return (
    <PageContainer>
      <div className="flex items-center gap-4 rounded-3xl bg-gradient-to-br from-aqua-500 to-aqua-800 p-5 text-white shadow-lift">
        <Avatar name={user.name} size={64} className="ring-4 ring-white/20 rounded-[26px]" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-xl font-extrabold">{user.name}</div>
          <div className="text-[14px] text-aqua-100">{user.phone}</div>
          <div className="text-[13px] text-aqua-200">{user.email}</div>
        </div>
        <button onClick={() => setEdit(true)} className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 hover:bg-white/25" aria-label="Редактировать">
          <Pencil className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { v: completed.length, l: "доставок" },
          { v: `${completed.reduce((s, o) => s + o.volume, 0)} м³`, l: "воды" },
          { v: formatDate(user.createdAt), l: "с нами с" },
        ].map((s) => (
          <div key={s.l} className="card p-3 text-center">
            <div className="text-lg font-extrabold">{s.v}</div>
            <div className="text-[12px] font-semibold text-ink-400">{s.l}</div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-7 flex items-center gap-2 text-lg font-extrabold">
        <Repeat className="h-5 w-5 text-aqua-500" /> Регулярные доставки
      </h2>
      {recurring.length === 0 ? (
        <div className="card p-4 text-[14px] text-ink-500">Выберите «Регулярно» при оформлении заказа — например, 5 м³ каждую неделю.</div>
      ) : (
        <div className="space-y-2">
          {recurring.map((o) => (
            <div key={o.id} className="card flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="font-extrabold">
                  {formatVolume(o.volume)} · {formatPrice(o.finalPrice ?? o.clientPrice)}
                </div>
                <div className="text-[13px] text-ink-500">{scheduleLabel(o.schedule)}</div>
                <div className="truncate text-[13px] text-ink-400">{o.address}</div>
              </div>
              <Toggle checked={!!o.schedule.active} onChange={() => toggleRecurring(o.id)} label="Активна" />
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-3 mt-7 flex items-center gap-2 text-lg font-extrabold">
        <MapPin className="h-5 w-5 text-aqua-500" /> Мои адреса
      </h2>
      <div className="card divide-y divide-ink-100">
        {addresses.length === 0 && <div className="p-4 text-sm text-ink-500">Адреса появятся после первого заказа</div>}
        {addresses.map((a) => (
          <div key={a} className="flex items-center gap-3 p-4 text-[15px] font-semibold">
            <MapPin className="h-4 w-4 shrink-0 text-ink-400" />
            <span className="truncate">{a}</span>
          </div>
        ))}
      </div>

      <div className="card mt-7 divide-y divide-ink-100">
        {[
          { icon: CreditCard, title: "Способы оплаты", hint: "Наличные / перевод водителю (онлайн-оплата — этап 2)" },
          { icon: ShieldCheck, title: "Безопасность", hint: "Защищённые номера и проверенные водители" },
          { icon: HelpCircle, title: "Поддержка", hint: "Чат с оператором 24/7" },
        ].map((r) => (
          <div key={r.title} className="flex items-center gap-3 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink-50 text-ink-500">
              <r.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold">{r.title}</div>
              <div className="text-[13px] text-ink-400">{r.hint}</div>
            </div>
            <ChevronRight className="h-5 w-5 text-ink-300" />
          </div>
        ))}
      </div>

      <Button
        variant="danger"
        size="lg"
        full
        className="mt-6"
        icon={<LogOut className="h-5 w-5" />}
        onClick={() => {
          logout("client");
          router.push("/");
        }}
      >
        Выйти
      </Button>

      <Sheet
        open={edit}
        onClose={() => setEdit(false)}
        title="Редактировать профиль"
        footer={
          <Button
            size="lg"
            full
            onClick={() => {
              updateUser(user.id, { name: name.trim() || user.name, phone: phone.trim() || user.phone });
              setEdit(false);
            }}
          >
            Сохранить
          </Button>
        }
      >
        <div className="space-y-3">
          <Field label="Имя">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Телефон">
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </div>
      </Sheet>
    </PageContainer>
  );
}
