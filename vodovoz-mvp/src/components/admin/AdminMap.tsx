"use client";
import { Map, type MapMarker } from "@/components/map/Map";
import { useNow } from "@/hooks/useNow";
import { getCity } from "@/data/cities";
import { isActive } from "@/lib/selectors";
import { travelProgress } from "@/lib/timing";
import type { DbState, Order } from "@/types";

/** Живая карта: водители (онлайн/офлайн), активные заказы, машины в пути */
export function AdminMap({ db, onOrder, className }: { db: DbState; onOrder?: (o: Order) => void; className?: string }) {
  const now = useNow(1000);
  const city = getCity(db.settings.cityId);
  const active = db.orders.filter(isActive);
  const markers: MapMarker[] = [];
  for (const d of db.drivers) {
    const o = active.find((x) => x.driverId === d.id && x.status === "en_route");
    let pos = d.location;
    if (o && o.routeFrom) {
      const p = travelProgress(o, now, db.settings.demoSpeed);
      pos = { lat: o.routeFrom.lat + (o.location.lat - o.routeFrom.lat) * p, lng: o.routeFrom.lng + (o.location.lng - o.routeFrom.lng) * p };
    }
    markers.push({
      id: d.id,
      kind: "truck",
      position: pos,
      color: d.blocked ? "#AEBBD0" : d.car.color,
      offline: !d.online || d.blocked,
      active: !!o,
      label: d.name,
    });
  }
  for (const o of active) {
    markers.push({
      id: `o${o.id}`,
      kind: "order",
      position: o.location,
      text: String(o.volume),
      color: ["searching", "offers", "new"].includes(o.status) ? "#F5A524" : "#0A88F0",
      onClick: onOrder ? () => onOrder(o) : undefined,
    });
  }
  return <Map center={city.center} zoom={city.zoom} markers={markers} fitKey={city.id} className={className} />;
}
