import type { LatLng } from "@/types";

const R = 6371;

export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Дорожное расстояние ≈ 1.3 × расстояние по прямой */
export function roadDistanceKm(a: LatLng, b: LatLng): number {
  return Math.round(distanceKm(a, b) * 1.3 * 10) / 10;
}

/** Время в пути при средней городской скорости 28 км/ч + 3 мин на сборы */
export function etaMinutes(km: number): number {
  return Math.max(4, Math.round((km / 28) * 60 + 3));
}

export function pathLengthKm(path: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) total += distanceKm(path[i - 1], path[i]);
  return total;
}

/** Точка на ломаной при прогрессе 0..1 */
export function pointAlong(path: LatLng[], progress: number): LatLng {
  if (path.length === 0) return { lat: 0, lng: 0 };
  if (path.length === 1 || progress <= 0) return path[0];
  if (progress >= 1) return path[path.length - 1];
  const total = pathLengthKm(path);
  let target = total * progress;
  for (let i = 1; i < path.length; i++) {
    const seg = distanceKm(path[i - 1], path[i]);
    if (target <= seg) {
      const t = seg === 0 ? 0 : target / seg;
      return {
        lat: path[i - 1].lat + (path[i].lat - path[i - 1].lat) * t,
        lng: path[i - 1].lng + (path[i].lng - path[i - 1].lng) * t,
      };
    }
    target -= seg;
  }
  return path[path.length - 1];
}

/** Остаток пути начиная с прогресса */
export function remainingPath(path: LatLng[], progress: number): LatLng[] {
  if (path.length < 2) return path;
  const total = pathLengthKm(path);
  let target = total * Math.min(1, Math.max(0, progress));
  for (let i = 1; i < path.length; i++) {
    const seg = distanceKm(path[i - 1], path[i]);
    if (target <= seg) {
      return [pointAlong(path, progress), ...path.slice(i)];
    }
    target -= seg;
  }
  return [path[path.length - 1]];
}

/** Запасной «дорожный» маршрут: ломаная по сетке кварталов */
export function fallbackRoute(from: LatLng, to: LatLng): LatLng[] {
  const midLat = from.lat + (to.lat - from.lat) * 0.55;
  return [
    from,
    { lat: midLat, lng: from.lng },
    { lat: midLat, lng: from.lng + (to.lng - from.lng) * 0.6 },
    { lat: to.lat, lng: from.lng + (to.lng - from.lng) * 0.6 },
    to,
  ];
}

export function offset(p: LatLng, dLat: number, dLng: number): LatLng {
  return { lat: p.lat + dLat, lng: p.lng + dLng };
}
