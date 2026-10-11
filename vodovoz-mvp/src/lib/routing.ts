/**
 * Маршруты для карты. Пытаемся получить реальный дорожный маршрут через
 * публичный демо-сервер OSRM (бесплатно, без ключа). Если сервис недоступен —
 * строим «квартальный» маршрут локально. В продакшене — собственный OSRM/
 * Valhalla или платный маршрутизатор.
 */
import type { LatLng } from "@/types";
import { fallbackRoute } from "./geo";

const cache = new Map<string, Promise<LatLng[]>>();
const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

const keyOf = (a: LatLng, b: LatLng) => `${a.lat.toFixed(5)},${a.lng.toFixed(5)}:${b.lat.toFixed(5)},${b.lng.toFixed(5)}`;

export function getRoute(from: LatLng, to: LatLng): Promise<LatLng[]> {
  const key = keyOf(from, to);
  const hit = cache.get(key);
  if (hit) return hit;
  const p = fetchOsrm(from, to).catch(() => fallbackRoute(from, to));
  cache.set(key, p);
  return p;
}

async function fetchOsrm(from: LatLng, to: LatLng): Promise<LatLng[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3500);
  try {
    const url = `${OSRM_URL}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`OSRM ${res.status}`);
    const json = (await res.json()) as { routes?: { geometry: { coordinates: [number, number][] } }[] };
    const coords = json.routes?.[0]?.geometry.coordinates;
    if (!coords || coords.length < 2) throw new Error("empty route");
    return [from, ...coords.map(([lng, lat]) => ({ lat, lng })), to];
  } finally {
    clearTimeout(timer);
  }
}
