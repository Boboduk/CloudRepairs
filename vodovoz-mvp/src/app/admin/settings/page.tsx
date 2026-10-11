"use client";
import { useState } from "react";
import { Gauge, MapPin, Percent, Radar, RotateCcw, Save } from "lucide-react";
import { Button, Segmented, cn } from "@/components/ui";
import { useDb } from "@/hooks/useDb";
import { resetDemo, updateSettings } from "@/lib/api";
import { splitEconomics } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { CITIES } from "@/data/cities";

export default function AdminSettingsPage() {
  const db = useDb();
  const [rate, setRate] = useState(Math.round(db.settings.commissionRate * 1000) / 10);
  const [saved, setSaved] = useState(false);
  const sample = splitEconomics(2700, rate / 100);

  return (
    <div className="max-w-3xl">
      <h1 className="mb-5 text-[28px] font-extrabold tracking-tight">Настройки сервиса</h1>

      <section className="card p-5">
        <h2 className="flex items-center gap-2 text-lg font-extrabold">
          <Percent className="h-5 w-5 text-aqua-500" /> Комиссия сервиса
        </h2>
        <p className="mt-1 text-[14px] text-ink-500">Применяется к новым заказам. Уже созданные заказы сохраняют ставку на момент создания.</p>
        <div className="mt-4 flex items-center gap-4">
          <input type="range" min={0} max={30} step={0.5} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="flex-1 accent-aqua-500" />
          <div className="flex items-center gap-1">
            <input type="number" min={0} max={50} step={0.5} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="input h-11 w-20 text-center font-bold" />
            <span className="font-bold text-ink-400">%</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-ink-50 p-4 text-center">
          <div>
            <div className="text-[12px] font-semibold text-ink-400">Стоимость заказа</div>
            <div className="text-lg font-extrabold">{formatPrice(sample.total)}</div>
          </div>
          <div>
            <div className="text-[12px] font-semibold text-ink-400">Доход водителя</div>
            <div className="text-lg font-extrabold text-mint-600">{formatPrice(sample.driverIncome)}</div>
          </div>
          <div>
            <div className="text-[12px] font-semibold text-ink-400">Комиссия сервиса</div>
            <div className="text-lg font-extrabold text-aqua-700">{formatPrice(sample.commission)}</div>
          </div>
        </div>
        <Button
          className="mt-4"
          icon={<Save className="h-4 w-4" />}
          onClick={() => {
            updateSettings({ commissionRate: Math.max(0, Math.min(50, rate)) / 100 });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
        >
          {saved ? "Сохранено ✓" : "Сохранить комиссию"}
        </Button>
      </section>

      <section className="card mt-4 p-5">
        <h2 className="flex items-center gap-2 text-lg font-extrabold">
          <MapPin className="h-5 w-5 text-aqua-500" /> Тестовый город
        </h2>
        <p className="mt-1 text-[14px] text-ink-500">Архитектура не привязана к городу: координаты водителей и адреса строятся от центра выбранного города.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {CITIES.map((c) => (
            <button
              key={c.id}
              className={cn("chip", c.id === db.settings.cityId && "chip-active")}
              onClick={() => {
                if (c.id !== db.settings.cityId && confirm(`Перенести демо в город «${c.name}»? Демо-данные будут пересозданы.`)) resetDemo(c.id);
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      <section className="card mt-4 p-5">
        <h2 className="flex items-center gap-2 text-lg font-extrabold">
          <Radar className="h-5 w-5 text-aqua-500" /> Радиус поиска заявок
        </h2>
        <Segmented
          className="mt-3"
          value={String(db.settings.searchRadiusKm)}
          onChange={(v) => updateSettings({ searchRadiusKm: Number(v) })}
          options={[5, 10, 15, 25].map((v) => ({ value: String(v), label: `${v} км` }))}
        />
      </section>

      <section className="card mt-4 p-5">
        <h2 className="flex items-center gap-2 text-lg font-extrabold">
          <Gauge className="h-5 w-5 text-aqua-500" /> Демо-режим
        </h2>
        <p className="mt-1 text-[14px] text-ink-500">Скорость симуляции движения водовозов и смены статусов.</p>
        <Segmented
          className="mt-3"
          value={String(db.settings.demoSpeed)}
          onChange={(v) => updateSettings({ demoSpeed: Number(v) })}
          options={["0.5", "1", "2", "4"].map((v) => ({ value: v, label: `${v}×` }))}
        />
        <Button
          variant="danger"
          className="mt-4"
          icon={<RotateCcw className="h-4 w-4" />}
          onClick={() => confirm("Сбросить все демо-данные?") && resetDemo()}
        >
          Сбросить демо-данные
        </Button>
      </section>
    </div>
  );
}
