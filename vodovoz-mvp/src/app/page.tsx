"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Droplets,
  HandCoins,
  MapPin,
  MonitorSmartphone,
  Repeat,
  Shield,
  Star,
  Truck,
  User,
  Wallet,
} from "lucide-react";
import { Button, LogoMark, Logo, TruckPhoto } from "@/components/ui";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/data/catalog";
import { login } from "@/lib/auth";
import { useDb } from "@/hooks/useDb";
import { getCity } from "@/data/cities";
import { formatPrice } from "@/lib/format";
import type { Role } from "@/types";

const ROLE_ICON = { client: User, driver: Truck, admin: Shield };
const ROLE_HOME: Record<Role, string> = { client: "/client", driver: "/driver", admin: "/admin" };

const STEPS = [
  { icon: MapPin, title: "Адрес и объём", text: "Укажите, куда и сколько кубов воды привезти" },
  { icon: HandCoins, title: "Ваша цена", text: "Предложите цену — водители примут её или предложат свою" },
  { icon: Star, title: "Выбор водителя", text: "Сравните рейтинг, машину, время прибытия и цену" },
  { icon: Truck, title: "Доставка", text: "Следите за водовозом на карте и оцените работу" },
];

export default function Landing() {
  const router = useRouter();
  const db = useDb();
  const city = getCity(db.settings.cityId);
  const online = db.drivers.filter((d) => d.online && !d.blocked).length;

  const enter = (role: Role) => {
    const acc = DEMO_ACCOUNTS.find((a) => a.role === role)!;
    login(acc.email, DEMO_PASSWORD);
    router.push(ROLE_HOME[role]);
  };

  return (
    <div className="min-h-dvh bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink-900 text-white">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-aqua-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-52 -left-40 h-[480px] w-[480px] rounded-full bg-mint-500/20 blur-3xl" />
        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Logo light />
          <div className="flex items-center gap-2">
            <Link href="/demo" className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-aqua-200 hover:bg-white/5 sm:flex">
              <MonitorSmartphone className="h-4 w-4" /> Демо: два экрана
            </Link>
            <Link href="/login" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15">
              Войти
            </Link>
          </div>
        </header>

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 pt-8 lg:grid-cols-[1.1fr_1fr] lg:pb-28 lg:pt-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-semibold text-aqua-100">
              <span className="h-2 w-2 animate-pulse rounded-full bg-mint-400" />
              {city.name}: {online} водовозов на линии
            </div>
            <h1 className="mt-5 font-display text-[40px] font-semibold leading-[1.05] tracking-tight sm:text-[56px]">
              Вода по вызову.
              <br />
              <span className="bg-gradient-to-r from-aqua-300 to-mint-400 bg-clip-text text-transparent">Водовоз за пару минут.</span>
            </h1>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-ink-300">
              Укажите адрес, объём и свою цену. Ближайшие водители-водовозы примут заявку или предложат свою цену — вы выбираете лучшего.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="xl" onClick={() => enter("client")} iconRight={<ArrowRight className="h-5 w-5" />}>
                Заказать воду
              </Button>
              <Button size="xl" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" onClick={() => enter("driver")} icon={<Truck className="h-5 w-5" />}>
                Я водитель-водовоз
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-ink-300">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-aqua-300" /> Подача от 8 минут
              </span>
              <span className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-aqua-300" /> Проверенные водители
              </span>
              <span className="flex items-center gap-2">
                <Repeat className="h-4 w-4 text-aqua-300" /> Регулярная доставка
              </span>
            </div>
          </div>

          {/* Превью приложения */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="animate-float rounded-[34px] bg-white p-3 text-ink-900 shadow-[0_40px_80px_-30px_rgba(0,0,0,.6)]">
              <div className="rounded-[26px] bg-ink-50 p-4">
                <div className="text-[13px] font-semibold text-ink-400">Получено 3 предложения</div>
                <div className="mt-1 text-[13px] text-ink-500">
                  Ваша цена: <b className="text-ink-900">2 500 ₽</b> · 5 м³
                </div>
                {[
                  { n: "Алексей", r: "4,9", c: "КАМАЗ · 10 м³", t: 12, p: 2700, col: "#0A88F0" },
                  { n: "Иван", r: "4,7", c: "ГАЗон · 5 м³", t: 9, p: 2500, col: "#F5A524" },
                  { n: "Сергей", r: "4,95", c: "Урал · 10 м³", t: 15, p: 2800, col: "#6366F1" },
                ].map((o, i) => (
                  <div key={o.n} className="mt-2.5 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft" style={{ opacity: 1 - i * 0.12 }}>
                    <TruckPhoto color={o.col} className="h-10 w-14 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[14px] font-extrabold">
                        {o.n} <span className="text-[12px] font-bold text-sun-600">★ {o.r}</span>
                      </div>
                      <div className="truncate text-[12px] text-ink-500">
                        {o.c} · ≈ {o.t} мин
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[15px] font-extrabold">{formatPrice(o.p)}</div>
                      <div className={o.p === 2500 ? "text-[11px] font-bold text-mint-600" : "text-[11px] font-bold text-sun-600"}>
                        {o.p === 2500 ? "ваша цена" : `+${o.p - 2500} ₽`}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-3 rounded-2xl bg-aqua-500 py-3 text-center text-[15px] font-extrabold text-white shadow-glow">Выбрать водителя</div>
              </div>
            </div>
            <div className="absolute -left-6 top-10 hidden rounded-2xl bg-white px-3 py-2 text-ink-900 shadow-lift sm:block">
              <div className="flex items-center gap-2 text-[13px] font-bold">
                <Droplets className="h-4 w-4 text-aqua-500" /> Водовоз едет к вам
              </div>
              <div className="text-[12px] text-ink-400">прибытие через 8 мин</div>
            </div>
          </div>
        </div>
      </section>

      {/* КАК ЭТО РАБОТАЕТ */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-[28px] font-extrabold tracking-tight sm:text-[34px]">Как это работает</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-3xl bg-ink-50 p-5">
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-aqua-500 shadow-soft">
                  <s.icon className="h-6 w-6" />
                </div>
                <span className="font-display text-3xl font-semibold text-ink-200">0{i + 1}</span>
              </div>
              <div className="mt-4 text-lg font-extrabold">{s.title}</div>
              <p className="mt-1 text-[15px] text-ink-500">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ДЕМО-ВХОД */}
      <section className="bg-ink-50">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-[28px] font-extrabold tracking-tight sm:text-[34px]">Демо-режим</h2>
              <p className="mt-1 text-ink-500">
                Без SMS, банковских карт и GPS. Пароль для всех аккаунтов: <b className="text-ink-900">{DEMO_PASSWORD}</b>
              </p>
            </div>
            <Link href="/demo">
              <Button variant="dark" size="lg" icon={<MonitorSmartphone className="h-5 w-5" />}>
                Клиент и водитель на одном экране
              </Button>
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {DEMO_ACCOUNTS.map((a) => {
              const Icon = ROLE_ICON[a.role];
              return (
                <button key={a.role} onClick={() => enter(a.role)} className="group rounded-3xl bg-white p-5 text-left shadow-soft ring-1 ring-ink-100 transition hover:-translate-y-0.5 hover:shadow-lift">
                  <div className="flex items-center justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-aqua-50 text-aqua-600">
                      <Icon className="h-6 w-6" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-ink-300 transition group-hover:translate-x-1 group-hover:text-aqua-500" />
                  </div>
                  <div className="mt-4 text-xl font-extrabold">{a.title}</div>
                  <div className="mt-1 text-[14px] text-ink-500">{a.desc}</div>
                  <div className="mt-4 rounded-xl bg-ink-50 px-3 py-2 font-mono text-[13px] text-ink-700">
                    {a.email} / {DEMO_PASSWORD}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* БИЗНЕС-МОДЕЛЬ */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-8 rounded-[32px] bg-gradient-to-br from-aqua-500 to-aqua-800 p-6 text-white sm:p-10 lg:grid-cols-2">
          <div>
            <h2 className="text-[28px] font-extrabold tracking-tight sm:text-[34px]">Бизнес-модель</h2>
            <p className="mt-3 max-w-md text-aqua-100">
              Маркетплейс доставки воды: клиент и водитель договариваются о цене, сервис получает комиссию с каждого выполненного заказа. Ставка настраивается в админ-панели.
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-aqua-100">
              <Wallet className="h-4 w-4" /> Пример заказа 5 м³
            </div>
            {[
              ["Стоимость заказа", "2 700 ₽"],
              ["Доход водителя (90%)", "2 430 ₽"],
              ["Комиссия сервиса (10%)", "270 ₽"],
            ].map(([k, v], i) => (
              <div key={k} className={`flex justify-between py-3 text-[17px] ${i < 2 ? "border-b border-white/15" : ""}`}>
                <span className="text-aqua-50">{k}</span>
                <b>{v}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-[13px] text-ink-400">
          <div className="flex items-center gap-2">
            <LogoMark size={24} /> «Водовоз» — демо-MVP. Все данные вымышленные.
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-ink-700">
              Вход
            </Link>
            <Link href="/register" className="hover:text-ink-700">
              Регистрация
            </Link>
            <Link href="/admin" className="hover:text-ink-700">
              Админ-панель
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
