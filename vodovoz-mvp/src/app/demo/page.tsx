"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, RotateCcw, Shield, Truck, User } from "lucide-react";
import { Button, Logo, Segmented, cn } from "@/components/ui";
import { DemoPanel } from "@/components/layout/DemoPanel";
import { getSession, loginAs } from "@/lib/auth";
import { resetDemo, updateSettings } from "@/lib/api";
import { useDb } from "@/hooks/useDb";

const SCRIPT = [
  { who: "driver", text: "Водитель включает «Я на линии»" },
  { who: "client", text: "Клиент указывает адрес, 5 м³, питьевую воду, «Как можно скорее» и цену 2 500 ₽" },
  { who: "client", text: "Нажимает «Найти водовоз» — идёт поиск, приходят предложения" },
  { who: "driver", text: "Водитель видит заявку, расстояние и цену клиента — принимает или предлагает свою" },
  { who: "client", text: "Клиент сравнивает предложения и выбирает Алексея" },
  { who: "driver", text: "Водитель получает подтверждение → «Начать поездку»" },
  { who: "client", text: "Клиент видит движение водовоза на карте" },
  { who: "driver", text: "«Я прибыл» → «Начать слив воды» → «Завершить доставку»" },
  { who: "client", text: "Клиент видит «Заказ завершён» и ставит оценку" },
] as const;

/**
 * Режим презентации: клиент и водитель рядом в двух «телефонах».
 * Оба фрейма работают с одной базой (localStorage) и синхронизируются мгновенно.
 */
export default function DemoPage() {
  const db = useDb();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<"client" | "driver">("client");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!getSession("client")) loginAs("client", "u-client-demo");
    if (!getSession("driver")) loginAs("driver", "u-driver-demo");
    setReady(true);
  }, []);

  return (
    <div className="min-h-dvh bg-gradient-to-br from-ink-900 via-ink-800 to-aqua-900 text-white">
      <header className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-5 py-4">
        <Link href="/">
          <Logo light />
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-2 py-1 text-[13px] font-semibold">
            Скорость
            <Segmented
              size="sm"
              className="bg-white/10"
              value={String(db.settings.demoSpeed)}
              onChange={(v) => updateSettings({ demoSpeed: Number(v) })}
              options={["1", "2", "4"].map((v) => ({ value: v, label: `${v}×` }))}
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={() => {
              if (!confirm("Сбросить демо-данные и начать сценарий заново?")) return;
              resetDemo();
              loginAs("client", "u-client-demo");
              loginAs("driver", "u-driver-demo");
              setNonce((n) => n + 1);
            }}
          >
            Начать заново
          </Button>
          <Link href="/admin" target="_blank">
            <Button size="sm" variant="primary" icon={<Shield className="h-4 w-4" />} iconRight={<ExternalLink className="h-3.5 w-3.5" />}>
              Админ-панель
            </Button>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 pb-10">
        <Segmented
          className="mb-4 bg-white/10 xl:hidden"
          value={tab}
          onChange={setTab}
          options={[
            { value: "client", label: "Клиент" },
            { value: "driver", label: "Водитель" },
          ]}
        />
        <div className="grid items-start gap-8 xl:grid-cols-[1fr_auto_auto]">
          <aside className="order-last xl:order-first">
            <h1 className="font-display text-3xl font-semibold leading-tight">Полный цикл заказа воды</h1>
            <p className="mt-2 text-ink-300">Два независимых приложения работают одновременно. Всё, что делает клиент, мгновенно видит водитель — и наоборот.</p>
            <ol className="mt-6 space-y-2">
              {SCRIPT.map((s, i) => (
                <li key={i} className="flex gap-3 rounded-2xl bg-white/5 p-3">
                  <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-lg", s.who === "client" ? "bg-aqua-500" : "bg-mint-500")}>
                    {s.who === "client" ? <User className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                  </span>
                  <span className="text-[14px] text-ink-100">
                    <b className="text-white">{i + 1}.</b> {s.text}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[13px] text-ink-400">Подсказка: кнопка «Демо» внизу справа позволяет перемотать этап заказа.</p>
          </aside>

          {ready &&
            (["client", "driver"] as const).map((role) => (
              <div key={role} className={cn("mx-auto", tab !== role && "hidden xl:block")}>
                <div className="mb-3 flex items-center justify-center gap-2 text-[14px] font-bold text-ink-200">
                  {role === "client" ? <User className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                  {role === "client" ? "Клиент · demo@client.ru" : "Водитель · demo@driver.ru"}
                </div>
                <div className="rounded-[46px] bg-black p-3 shadow-[0_40px_80px_-30px_rgba(0,0,0,.8)] ring-1 ring-white/10">
                  <div className="relative overflow-hidden rounded-[36px] bg-white">
                    <iframe
                      key={`${role}-${nonce}`}
                      src={role === "client" ? "/client" : "/driver"}
                      title={role}
                      className="block h-[780px] max-h-[calc(100dvh-140px)] min-h-[600px] w-[380px] max-w-[calc(100vw-64px)] border-0"
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      <DemoPanel className="bottom-6 right-6" />
    </div>
  );
}
