"use client";
import { useMemo } from "react";
import type { Driver, LatLng, Order } from "@/types";
import { pointAlong, remainingPath } from "@/lib/geo";
import { deliveryProgress, remainingEtaMin, travelProgress } from "@/lib/timing";
import { useRoute } from "./useRoute";
import { useNow } from "./useNow";

export interface Tracking {
  position: LatLng | null;
  route: LatLng[] | null;
  remaining: LatLng[] | null;
  progress: number;
  etaLeft: number;
  delivery: number;
}

/** Позиция водовоза на маршруте к клиенту (имитация GPS) */
export function useTracking(order: Order | undefined, driver: Driver | undefined, speed: number): Tracking {
  const now = useNow(250);
  const moving = !!order && ["accepted", "en_route"].includes(order.status);
  const from = order?.routeFrom ?? driver?.location ?? null;
  const route = useRoute(moving ? from : null, moving ? order?.location : null);

  return useMemo(() => {
    if (!order || !driver) return { position: null, route: null, remaining: null, progress: 0, etaLeft: 0, delivery: 0 };
    const progress = travelProgress(order, now, speed);
    const delivery = deliveryProgress(order, now, speed);
    if (!moving || !route) {
      const atClient = ["arrived", "delivering", "completed"].includes(order.status);
      return {
        position: atClient ? order.location : driver.location,
        route: null,
        remaining: null,
        progress,
        etaLeft: 0,
        delivery,
      };
    }
    return {
      position: pointAlong(route, progress),
      route,
      remaining: remainingPath(route, progress),
      progress,
      etaLeft: remainingEtaMin(order, now, speed),
      delivery,
    };
  }, [order, driver, now, speed, moving, route]);
}
