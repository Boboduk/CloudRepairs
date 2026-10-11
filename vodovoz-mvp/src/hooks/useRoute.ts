"use client";
import { useEffect, useState } from "react";
import { getRoute } from "@/lib/routing";
import { fallbackRoute } from "@/lib/geo";
import type { LatLng } from "@/types";

export function useRoute(from?: LatLng | null, to?: LatLng | null): LatLng[] | null {
  const [route, setRoute] = useState<LatLng[] | null>(null);
  const key = from && to ? `${from.lat},${from.lng},${to.lat},${to.lng}` : "";
  useEffect(() => {
    if (!from || !to) {
      setRoute(null);
      return;
    }
    let alive = true;
    setRoute(fallbackRoute(from, to));
    getRoute(from, to).then((r) => alive && setRoute(r));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return route;
}
