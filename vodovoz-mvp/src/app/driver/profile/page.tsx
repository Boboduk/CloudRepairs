"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Camera, Clock3, FileCheck2, FileClock, FileX2, LogOut, Pencil, Star, Truck } from "lucide-react";
import { PageContainer } from "@/components/layout/AppShell";
import { Avatar, Badge, Button, Field, RatingPill, Sheet, Stars, TruckPhoto, cn } from "@/components/ui";
import { useSession } from "@/hooks/useSession";
import { logout } from "@/lib/auth";
import { updateDriver } from "@/lib/api";
import { resizeImage } from "@/lib/image";
import { experienceLabel, formatNumber, formatVolume, relativeTime } from "@/lib/format";
import type { Driver } from "@/types";

const DOC_ICON = { verified: FileCheck2, pending: FileClock, missing: FileX2 };
const DOC_LABEL = { verified: "Проверен", pending: "На проверке", missing: "Не загружен" };

export default function DriverProfilePage() {
  const { driver, user } = useSession("driver");
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  if (!driver || !user) return null;

  return (
    <PageContainer>
      <div className="overflow-hidden rounded-[28px] bg-white shadow-soft ring-1 ring-ink-100">
        <TruckPhoto color={driver.car.color} photo={driver.car.photo} className="h-44 w-full rounded-none" />
        <div className="-mt-10 flex items-end gap-4 px-5">
          <Avatar name={driver.name} src={driver.avatar} size={84} className="rounded-[30px] ring-4 ring-white" />
          <div className="pb-1">
            <div className="flex items-center gap-1.5 text-2xl font-extrabold">
              {driver.name}
              {driver.verified && <BadgeCheck className="h-6 w-6 text-aqua-500" />}
            </div>
            <div className="flex items-center gap-2">
              <Stars value={driver.rating} size={14} />
              <RatingPill value={driver.rating} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 p-5">
          {[
            { icon: Truck, v: formatNumber(driver.ordersCompleted), l: "доставок" },
            { icon: Clock3, v: experienceLabel(driver.experienceYears), l: "стаж" },
            { icon: Star, v: formatNumber(driver.ratingCount), l: "оценок" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-ink-50 p-3 text-center">
              <s.icon className="mx-auto mb-1 h-4 w-4 text-aqua-500" />
              <div className="font-extrabold">{s.v}</div>
              <div className="text-[12px] text-ink-400">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5">
          <Button variant="outline" size="lg" full icon={<Pencil className="h-4 w-4" />} onClick={() => setEdit(true)}>
            Редактировать профиль
          </Button>
        </div>
      </div>

      <h2 className="mb-3 mt-7 text-lg font-extrabold">Автомобиль</h2>
      <div className="card divide-y divide-ink-100">
        {[
          ["Марка и модель", `${driver.car.brand} ${driver.car.model}`],
          ["Год выпуска", String(driver.car.year)],
          ["Объём цистерны", formatVolume(driver.car.tankVolume)],
          ["Госномер", driver.car.plate],
          ["Телефон", driver.phone],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-4 py-3 text-[15px]">
            <span className="text-ink-500">{k}</span>
            <span className="text-right font-bold">{v}</span>
          </div>
        ))}
      </div>

      <div className="mb-3 mt-7 flex items-center justify-between">
        <h2 className="text-lg font-extrabold">Проверка и документы</h2>
        <Badge tone={driver.verified ? "success" : "warning"} dot>
          {driver.verified ? "Проверен" : "На проверке"}
        </Badge>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {driver.documents.map((d) => {
          const Icon = DOC_ICON[d.status];
          return (
            <div key={d.id} className="card flex items-center gap-3 p-4">
              <div
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-xl",
                  d.status === "verified" ? "bg-mint-50 text-mint-600" : d.status === "pending" ? "bg-sun-50 text-sun-600" : "bg-ink-100 text-ink-400",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-bold">{d.title}</div>
                <div className="text-[12px] text-ink-400">
                  {d.number} · {DOC_LABEL[d.status]}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[12px] text-ink-400">Демо: документы показаны как карточки, реальная загрузка и проверка — на следующем этапе.</p>

      <h2 className="mb-3 mt-7 text-lg font-extrabold">Отзывы клиентов</h2>
      <div className="space-y-2">
        {driver.reviews.slice(0, 6).map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex items-center justify-between">
              <span className="font-bold">{r.author}</span>
              <Stars value={r.stars} size={13} />
            </div>
            <p className="mt-1 text-[14px] text-ink-600">{r.text}</p>
            <div className="mt-1 text-[12px] text-ink-400">{relativeTime(r.at)}</div>
          </div>
        ))}
        {driver.reviews.length === 0 && <div className="card p-4 text-sm text-ink-500">Отзывов пока нет</div>}
      </div>

      <Button
        variant="danger"
        size="lg"
        full
        className="mt-7"
        icon={<LogOut className="h-5 w-5" />}
        onClick={() => {
          logout("driver");
          router.push("/");
        }}
      >
        Выйти
      </Button>

      <EditDriverSheet driver={driver} open={edit} onClose={() => setEdit(false)} />
    </PageContainer>
  );
}

function EditDriverSheet({ driver, open, onClose }: { driver: Driver; open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    name: driver.name,
    phone: driver.phone,
    brand: driver.car.brand,
    model: driver.car.model,
    plate: driver.car.plate,
    tankVolume: driver.car.tankVolume,
    year: driver.car.year,
    photo: driver.car.photo,
    avatar: driver.avatar,
  });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const upload = async (file: File | undefined, key: "photo" | "avatar") => {
    if (!file) return;
    set({ [key]: await resizeImage(file, key === "photo" ? 640 : 256) });
  };
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Редактировать профиль"
      footer={
        <Button
          size="lg"
          full
          onClick={() => {
            updateDriver(driver.id, {
              name: form.name,
              phone: form.phone,
              avatar: form.avatar,
              car: { brand: form.brand, model: form.model, plate: form.plate, tankVolume: Number(form.tankVolume), year: Number(form.year), photo: form.photo },
            });
            onClose();
          }}
        >
          Сохранить
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="relative cursor-pointer">
          <TruckPhoto color={driver.car.color} photo={form.photo} className="h-28 w-full" />
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-lg bg-ink-900/80 px-2 py-1 text-[12px] font-bold text-white">
            <Camera className="h-3.5 w-3.5" /> Фото авто
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0], "photo")} />
        </label>
        <label className="relative grid cursor-pointer place-items-center rounded-2xl bg-ink-50">
          <Avatar name={form.name} src={form.avatar} size={72} />
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-lg bg-ink-900/80 px-2 py-1 text-[12px] font-bold text-white">
            <Camera className="h-3.5 w-3.5" /> Ваше фото
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0], "avatar")} />
        </label>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Field label="Имя" className="col-span-2">
          <input className="input" value={form.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label="Телефон" className="col-span-2">
          <input className="input" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
        </Field>
        <Field label="Марка">
          <input className="input" value={form.brand} onChange={(e) => set({ brand: e.target.value })} />
        </Field>
        <Field label="Модель">
          <input className="input" value={form.model} onChange={(e) => set({ model: e.target.value })} />
        </Field>
        <Field label="Госномер">
          <input className="input" value={form.plate} onChange={(e) => set({ plate: e.target.value })} />
        </Field>
        <Field label="Год">
          <input className="input" type="number" value={form.year} onChange={(e) => set({ year: Number(e.target.value) })} />
        </Field>
        <Field label="Объём цистерны, м³" className="col-span-2">
          <input className="input" type="number" min={1} max={30} value={form.tankVolume} onChange={(e) => set({ tankVolume: Number(e.target.value) })} />
        </Field>
      </div>
    </Sheet>
  );
}
