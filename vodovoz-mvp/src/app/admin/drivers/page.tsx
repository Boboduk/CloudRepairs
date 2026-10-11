"use client";
import { useMemo, useState } from "react";
import { BadgeCheck, Ban, Eye, Pencil, Search, ShieldCheck, Unlock } from "lucide-react";
import { Avatar, Badge, Button, Field, RatingPill, Segmented, Sheet } from "@/components/ui";
import { DriverDetailsSheet } from "@/components/order/DriverDetailsSheet";
import { useDb } from "@/hooks/useDb";
import { driverActiveOrder } from "@/lib/selectors";
import { setDriverBlocked, setDriverVerified, updateDriver } from "@/lib/api";
import { formatNumber, formatVolume } from "@/lib/format";
import type { Driver } from "@/types";

type Filter = "all" | "online" | "unverified" | "blocked";

export default function AdminDriversPage() {
  const db = useDb();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<Driver | null>(null);
  const [edit, setEdit] = useState<Driver | null>(null);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return db.drivers
      .filter((d) => (filter === "online" ? d.online && !d.blocked : filter === "unverified" ? !d.verified : filter === "blocked" ? d.blocked : true))
      .filter((d) => !query || d.name.toLowerCase().includes(query) || d.phone.includes(query) || d.car.plate.toLowerCase().includes(query) || d.car.brand.toLowerCase().includes(query));
  }, [db, q, filter]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[28px] font-extrabold tracking-tight">Водители</h1>
        <p className="text-ink-500">
          {db.drivers.length} в базе · {db.drivers.filter((d) => d.online && !d.blocked).length} онлайн · {db.drivers.filter((d) => !d.verified).length} ждут проверки
        </p>
      </div>
      <div className="card mb-4 flex flex-col gap-2 p-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input className="input pl-10" placeholder="Имя, телефон, госномер, марка" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "Все" },
            { value: "online", label: "Онлайн" },
            { value: "unverified", label: "Не проверены" },
            { value: "blocked", label: "Заблокированы" },
          ]}
        />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-ink-100 text-[12px] font-bold uppercase tracking-wide text-ink-400">
              {["Водитель", "Телефон", "Автомобиль", "Цистерна", "Рейтинг", "Заказов", "Статус", "Проверка", "Действия"].map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((d) => {
              const busy = driverActiveOrder(db, d.id);
              return (
                <tr key={d.id} className="border-b border-ink-50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={d.name} src={d.avatar} size={38} online={d.online && !d.blocked} />
                      <div>
                        <div className="font-bold">{d.name}</div>
                        <div className="text-[12px] text-ink-400">{d.isBot ? "демо-бот" : "живой аккаунт"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-600">{d.phone}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">
                      {d.car.brand} {d.car.model}
                    </div>
                    <div className="text-[12px] text-ink-400">{d.car.plate}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatVolume(d.car.tankVolume)}</td>
                  <td className="px-4 py-3">
                    <RatingPill value={d.rating} />
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatNumber(d.ordersCompleted)}</td>
                  <td className="px-4 py-3">
                    {d.blocked ? (
                      <Badge tone="danger" dot>
                        Заблокирован
                      </Badge>
                    ) : busy ? (
                      <Badge tone="progress" dot>
                        На заказе
                      </Badge>
                    ) : d.online ? (
                      <Badge tone="success" dot>
                        На линии
                      </Badge>
                    ) : (
                      <Badge dot>Не на линии</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDriverVerified(d.id, !d.verified)} title="Переключить проверку">
                      {d.verified ? (
                        <Badge tone="info">
                          <BadgeCheck className="h-3.5 w-3.5" /> Проверен
                        </Badge>
                      ) : (
                        <Badge tone="warning">Не проверен</Badge>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setView(d)} title="Просмотр" icon={<Eye className="h-4 w-4" />} />
                      <Button size="sm" variant="ghost" onClick={() => setEdit(d)} title="Редактировать" icon={<Pencil className="h-4 w-4" />} />
                      {!d.verified && (
                        <Button size="sm" variant="ghost" onClick={() => setDriverVerified(d.id, true)} title="Подтвердить" icon={<ShieldCheck className="h-4 w-4 text-mint-600" />} />
                      )}
                      <Button
                        size="sm"
                        variant={d.blocked ? "secondary" : "danger"}
                        onClick={() => setDriverBlocked(d.id, !d.blocked)}
                        icon={d.blocked ? <Unlock className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      >
                        {d.blocked ? "Разблок." : "Блок."}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <DriverDetailsSheet open={!!view} driver={view ? db.drivers.find((d) => d.id === view.id) ?? null : null} onClose={() => setView(null)} />
      {edit && <EditSheet key={edit.id} driver={edit} onClose={() => setEdit(null)} />}
    </div>
  );
}

function EditSheet({ driver, onClose }: { driver: Driver; onClose: () => void }) {
  const [f, setF] = useState({
    name: driver.name,
    phone: driver.phone,
    brand: driver.car.brand,
    model: driver.car.model,
    plate: driver.car.plate,
    tankVolume: driver.car.tankVolume,
    rating: driver.rating,
  });
  return (
    <Sheet
      open
      onClose={onClose}
      title={`Редактирование: ${driver.name}`}
      footer={
        <Button
          size="lg"
          full
          onClick={() => {
            updateDriver(driver.id, {
              name: f.name,
              phone: f.phone,
              rating: Math.min(5, Math.max(1, Number(f.rating))),
              car: { brand: f.brand, model: f.model, plate: f.plate, tankVolume: Number(f.tankVolume) },
            });
            onClose();
          }}
        >
          Сохранить
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Имя" className="col-span-2">
          <input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </Field>
        <Field label="Телефон" className="col-span-2">
          <input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        </Field>
        <Field label="Марка">
          <input className="input" value={f.brand} onChange={(e) => setF({ ...f, brand: e.target.value })} />
        </Field>
        <Field label="Модель">
          <input className="input" value={f.model} onChange={(e) => setF({ ...f, model: e.target.value })} />
        </Field>
        <Field label="Госномер">
          <input className="input" value={f.plate} onChange={(e) => setF({ ...f, plate: e.target.value })} />
        </Field>
        <Field label="Цистерна, м³">
          <input className="input" type="number" value={f.tankVolume} onChange={(e) => setF({ ...f, tankVolume: Number(e.target.value) })} />
        </Field>
        <Field label="Рейтинг" className="col-span-2">
          <input className="input" type="number" step={0.01} min={1} max={5} value={f.rating} onChange={(e) => setF({ ...f, rating: Number(e.target.value) })} />
        </Field>
      </div>
    </Sheet>
  );
}
