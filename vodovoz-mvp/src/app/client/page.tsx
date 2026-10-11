"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Crosshair, MessageSquareText, Search, Truck } from "lucide-react";
import { MapLayout } from "@/components/layout/AppShell";
import { Map, type MapMarker } from "@/components/map/Map";
import { AddressInput, type AddressOption } from "@/components/order/AddressInput";
import { OrderSteps } from "@/components/order/OrderSteps";
import { VolumePicker } from "@/components/order/VolumePicker";
import { WaterTypePicker } from "@/components/order/WaterTypePicker";
import { SchedulePicker } from "@/components/order/SchedulePicker";
import { PriceInput } from "@/components/order/PriceInput";
import { Button, StatusBadge, cn } from "@/components/ui";
import { useDb } from "@/hooks/useDb";
import { useSession } from "@/hooks/useSession";
import { cityAddresses, getCity } from "@/data/cities";
import { createOrder } from "@/lib/api";
import { activeClientOrder, clientOrders, driverActiveOrder } from "@/lib/selectors";
import { recommendedPrice } from "@/lib/pricing";
import { formatPrice, formatVolume, plural } from "@/lib/format";
import { roadDistanceKm } from "@/lib/geo";
import type { LatLng, Schedule, WaterType } from "@/types";

function Section({ n, title, children, done }: { n: number; title: string; children: React.ReactNode; done?: boolean }) {
  return (
    <section className="py-5">
      <div className="mb-3 flex items-center gap-2.5">
        <span className={cn("grid h-6 w-6 place-items-center rounded-lg text-xs font-extrabold", done ? "bg-aqua-500 text-white" : "bg-ink-100 text-ink-500")}>{n}</span>
        <h2 className="text-[17px] font-extrabold text-ink-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function ClientHome() {
  const db = useDb();
  const router = useRouter();
  const { user } = useSession("client");
  const city = getCity(db.settings.cityId);
  const cityAddrs = useMemo(() => cityAddresses(city), [city]);

  const history = useMemo(() => (user ? clientOrders(db, user.id) : []), [db, user]);
  const active = user ? activeClientOrder(db, user.id) : undefined;

  const addressOptions: AddressOption[] = useMemo(() => {
    const recent: AddressOption[] = [];
    for (const o of history) {
      if (!recent.some((r) => r.title === o.address)) recent.push({ title: o.address, location: o.location, recent: true });
    }
    return [...recent.slice(0, 3), ...cityAddrs.filter((a) => !recent.some((r) => r.title === a.title))];
  }, [history, cityAddrs]);

  const initial = history[0] ? { title: history[0].address, location: history[0].location } : { title: "", location: cityAddrs[0].location };
  const [address, setAddress] = useState(initial.title);
  const [location, setLocation] = useState<LatLng>(initial.location);
  const [volume, setVolume] = useState(5);
  const [waterType, setWaterType] = useState<WaterType>("drinking");
  const [schedule, setSchedule] = useState<Schedule>({ type: "now" });
  const recommended = recommendedPrice(volume, waterType);
  const [price, setPrice] = useState(2500);
  const [priceTouched, setPriceTouched] = useState(false);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fitKey, setFitKey] = useState("init");

  // Пока клиент не менял цену сам, подставляем рекомендованную
  const effectivePrice = priceTouched ? price : recommended;

  const nearby = useMemo(
    () =>
      db.drivers
        .filter((d) => d.online && !d.blocked && !driverActiveOrder(db, d.id))
        .map((d) => ({ d, km: roadDistanceKm(d.location, location) }))
        .sort((a, b) => a.km - b.km),
    [db, location],
  );

  const markers: MapMarker[] = [
    ...nearby.map(({ d }) => ({ id: d.id, kind: "truck" as const, position: d.location, color: d.car.color })),
    { id: "me", kind: "client" as const, position: location, pulse: true },
  ];

  const scheduleValid = schedule.type === "now" || (!!schedule.time && (schedule.type === "recurring" || !!schedule.date));
  const done = [address.trim().length > 3, volume > 0, scheduleValid, effectivePrice >= 100, false];
  const current = done.findIndex((d) => !d);

  const submit = () => {
    if (!user) return;
    if (!done[0]) return setError("Укажите адрес доставки");
    if (!done[2]) return setError("Укажите дату и время доставки");
    if (!done[3]) return setError("Укажите цену не меньше 100 ₽");
    setSubmitting(true);
    const order = createOrder({
      clientId: user.id,
      address: address.trim(),
      location,
      volume,
      waterType,
      schedule,
      clientPrice: effectivePrice,
      comment: comment.trim(),
    });
    router.push(`/client/order/${order.id}`);
  };

  const pickOnMap = (p: LatLng) => {
    setLocation(p);
    if (!address || address.startsWith("Точка на карте")) {
      setAddress(`Точка на карте (${p.lat.toFixed(4)}, ${p.lng.toFixed(4)})`);
    }
  };

  return (
    <MapLayout
      mapHeight="42dvh"
      map={
        <Map
          center={location}
          zoom={city.zoom + 1}
          markers={markers}
          onMapClick={pickOnMap}
          fit={[location, ...nearby.slice(0, 3).map((n) => n.d.location)]}
          fitKey={fitKey}
          padding={[70, 60]}
          className="h-full w-full"
        />
      }
      overlay={
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex items-start justify-between gap-2 p-3 pt-[calc(.75rem+env(safe-area-inset-top))]">
          <div className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-2 shadow-soft backdrop-blur">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-mint-500" />
            </span>
            <span className="text-[13px] font-bold text-ink-800">
              {city.name}: {nearby.length} {plural(nearby.length, "водовоз", "водовоза", "водовозов")} рядом
            </span>
          </div>
          <button
            onClick={() => {
              setLocation(cityAddrs[0].location);
              setAddress(cityAddrs[0].title);
              setFitKey(String(Date.now()));
            }}
            className="pointer-events-auto grid h-10 w-10 place-items-center rounded-2xl bg-white/95 text-ink-700 shadow-soft backdrop-blur"
            title="Моё местоположение (демо)"
          >
            <Crosshair className="h-5 w-5" />
          </button>
        </div>
      }
    >
      <div className="px-5 pb-6 lg:px-7 lg:pt-6">
        {active && (
          <Link href={`/client/order/${active.id}`} className="mb-4 mt-2 flex items-center gap-3 rounded-2xl bg-ink-900 p-3.5 text-white shadow-lift">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-aqua-500">
              <Truck className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] text-ink-300">Активный заказ №{active.id}</div>
              <div className="truncate font-extrabold">{formatVolume(active.volume)} · {formatPrice(active.finalPrice ?? active.clientPrice)}</div>
            </div>
            <StatusBadge status={active.status} className="hidden sm:inline-flex" />
            <ChevronRight className="h-5 w-5 text-ink-400" />
          </Link>
        )}

        <div className="pt-2">
          <h1 className="text-[26px] font-extrabold leading-[1.15] tracking-tight text-ink-900 lg:text-[30px]">
            Сколько воды вам нужно
            <br />и куда её доставить?
          </h1>
          <div className="mt-4">
            <OrderSteps done={done} current={current === -1 ? 4 : current} />
          </div>
        </div>

        <div className="divide-y divide-ink-100">
          <Section n={1} title="Адрес доставки" done={done[0]}>
            <AddressInput
              value={address}
              options={addressOptions}
              onChange={(t, loc) => {
                setAddress(t);
                setError("");
                if (loc) {
                  setLocation(loc);
                  setFitKey(t);
                }
              }}
              placeholder="г. Якутск, ул. Ленина, 15"
            />
            <p className="mt-2 text-[13px] text-ink-400">Можно выбрать точку прямо на карте — нажмите на нужное место.</p>
          </Section>

          <Section n={2} title="Объём воды" done={done[1]}>
            <VolumePicker value={volume} onChange={setVolume} />
            <div className="label mt-5">Тип воды</div>
            <WaterTypePicker value={waterType} onChange={setWaterType} />
          </Section>

          <Section n={3} title="Когда доставить?" done={done[2]}>
            <SchedulePicker value={schedule} onChange={setSchedule} />
          </Section>

          <Section n={4} title="Сколько готовы заплатить?" done={done[3]}>
            <PriceInput
              value={effectivePrice}
              recommended={recommended}
              onChange={(v) => {
                setPrice(v);
                setPriceTouched(true);
              }}
            />
          </Section>

          <section className="py-5">
            <div className="mb-3 flex items-center gap-2.5">
              <MessageSquareText className="h-5 w-5 text-ink-400" />
              <h2 className="text-[17px] font-extrabold text-ink-900">Комментарий водителю</h2>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              placeholder="Нужен длинный шланг, подъезд к дому возможен"
              className="input h-auto resize-none py-3"
            />
            <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
              {["Нужен длинный шланг", "Позвоните заранее", "Ворота открыты"].map((t) => (
                <button key={t} type="button" onClick={() => setComment((c) => (c ? `${c}. ${t}` : t))} className="shrink-0 rounded-xl bg-ink-50 px-3 py-1.5 text-[13px] font-semibold text-ink-600 hover:bg-ink-100">
                  + {t}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="sticky bottom-[calc(4.75rem+var(--safe-bottom))] z-20 -mx-5 border-t border-ink-100 bg-white/95 px-5 pb-3 pt-3 backdrop-blur lg:bottom-0 lg:-mx-7 lg:px-7">
          {error && <div className="mb-2 rounded-xl bg-coral-50 px-3 py-2 text-sm font-semibold text-coral-600">{error}</div>}
          <Button size="xl" full onClick={submit} loading={submitting} icon={<Search className="h-5 w-5" />}>
            Найти водовоз · {formatPrice(effectivePrice)}
          </Button>
          <div className="mt-2 text-center text-[12px] text-ink-400">
            {formatVolume(volume)} · {waterType === "drinking" ? "питьевая" : waterType === "technical" ? "техническая" : "для хоз. нужд"} · оплата водителю после доставки
          </div>
        </div>
      </div>
    </MapLayout>
  );
}
