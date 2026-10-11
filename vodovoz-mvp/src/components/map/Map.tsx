"use client";
import dynamic from "next/dynamic";
import type { MapViewProps } from "./types";

// Leaflet работает только в браузере — загружаем без SSR
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-gradient-to-br from-ink-100 to-aqua-50" />,
});

export function Map(props: MapViewProps) {
  return <MapView {...props} />;
}

export type { MapMarker, MapViewProps } from "./types";
