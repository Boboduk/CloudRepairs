"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, UserPlus } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button, Field, Segmented, TruckPhoto } from "@/components/ui";
import { register } from "@/lib/auth";
import { resizeImage } from "@/lib/image";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"client" | "driver">("client");
  const [f, setF] = useState({ name: "", phone: "+7 ", email: "", password: "", brand: "КАМАЗ", model: "АЦ-10", plate: "", tankVolume: 10, year: 2018, photo: "" });
  const [error, setError] = useState("");
  const set = (patch: Partial<typeof f>) => setF((x) => ({ ...x, ...patch }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (f.name.trim().length < 2) return setError("Укажите имя");
    if (f.phone.replace(/\D/g, "").length < 11) return setError("Укажите телефон полностью");
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setError("Укажите корректный e-mail");
    if (f.password.length < 6) return setError("Пароль — минимум 6 символов");
    if (role === "driver" && !f.plate.trim()) return setError("Укажите госномер");
    const res = register({
      role,
      name: f.name,
      phone: f.phone,
      email: f.email,
      password: f.password,
      car: role === "driver" ? { brand: f.brand, model: f.model, plate: f.plate, tankVolume: Number(f.tankVolume), year: Number(f.year), photo: f.photo || undefined } : undefined,
    });
    if (!res.ok) return setError(res.error);
    router.push(role === "driver" ? "/driver" : "/client");
  };

  return (
    <AuthLayout title="Регистрация" subtitle="В демо-режиме подтверждение по SMS не требуется">
      <Segmented
        value={role}
        onChange={setRole}
        options={[
          { value: "client", label: "Я клиент" },
          { value: "driver", label: "Я водитель-водовоз" },
        ]}
      />
      <form onSubmit={submit} className="mt-5 space-y-3">
        <Field label="Имя">
          <input className="input" value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="Как к вам обращаться" />
        </Field>
        <Field label="Телефон">
          <input className="input" value={f.phone} onChange={(e) => set({ phone: e.target.value })} inputMode="tel" />
        </Field>
        <Field label="E-mail">
          <input className="input" type="email" value={f.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@example.ru" />
        </Field>
        <Field label="Пароль">
          <input className="input" type="password" value={f.password} onChange={(e) => set({ password: e.target.value })} placeholder="Минимум 6 символов" />
        </Field>

        {role === "driver" && (
          <div className="animate-slide-up space-y-3 rounded-3xl bg-white p-4 ring-1 ring-ink-100">
            <div className="font-extrabold">Автомобиль</div>
            <label className="relative block cursor-pointer">
              <TruckPhoto photo={f.photo || undefined} className="h-32 w-full" />
              <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-lg bg-ink-900/80 px-2 py-1 text-[12px] font-bold text-white">
                <Camera className="h-3.5 w-3.5" /> Загрузить фото
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => e.target.files?.[0] && set({ photo: await resizeImage(e.target.files[0], 640) })} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Марка">
                <input className="input" value={f.brand} onChange={(e) => set({ brand: e.target.value })} />
              </Field>
              <Field label="Модель">
                <input className="input" value={f.model} onChange={(e) => set({ model: e.target.value })} />
              </Field>
              <Field label="Госномер">
                <input className="input" value={f.plate} onChange={(e) => set({ plate: e.target.value.toUpperCase() })} placeholder="А 000 АА 14" />
              </Field>
              <Field label="Объём цистерны, м³">
                <input className="input" type="number" min={1} max={30} value={f.tankVolume} onChange={(e) => set({ tankVolume: Number(e.target.value) })} />
              </Field>
            </div>
          </div>
        )}

        {error && <div className="rounded-xl bg-coral-50 px-3 py-2 text-sm font-semibold text-coral-600">{error}</div>}
        <Button type="submit" size="xl" full icon={<UserPlus className="h-5 w-5" />}>
          Создать аккаунт
        </Button>
      </form>
      <p className="mt-5 text-center text-[15px] text-ink-500">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-bold text-aqua-600">
          Войти
        </Link>
      </p>
    </AuthLayout>
  );
}
