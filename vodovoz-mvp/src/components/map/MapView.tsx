"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LatLng } from "@/types";
import type { MapMarker, MapViewProps } from "./types";

// Бесплатные тайлы OpenStreetMap в стилистике CARTO Voyager (без ключа API)
const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

const TRUCK_SVG =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>';
const HOME_SVG =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 2.5s-7 7.4-7 12.4a7 7 0 0 0 14 0c0-5-7-12.4-7-12.4z"/></svg>';

const iconCache = new Map<string, L.DivIcon>();

function iconFor(m: MapMarker): L.DivIcon {
  const key = [m.kind, m.color, m.label, m.active, m.offline, m.text, m.pulse].join("|");
  const hit = iconCache.get(key);
  if (hit) return hit;
  let icon: L.DivIcon;
  if (m.kind === "truck") {
    icon = L.divIcon({
      className: "vv-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      html: `<div class="vv-truck ${m.active ? "is-active" : ""} ${m.offline ? "is-offline" : ""}" style="background:${m.color ?? "#0A88F0"}">${TRUCK_SVG}${
        m.label ? `<span class="vv-truck-label">${m.label}</span>` : ""
      }</div>`,
    });
  } else if (m.kind === "client") {
    icon = L.divIcon({
      className: "vv-marker",
      iconSize: [44, 52],
      iconAnchor: [22, 50],
      html: `<div class="vv-pin">${m.pulse ? '<span class="vv-pulse" style="top:22px"></span>' : ""}<div class="vv-pin-head">${HOME_SVG}</div></div>`,
    });
  } else {
    icon = L.divIcon({
      className: "vv-marker",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      html: `<div class="vv-order-dot" style="${m.color ? `border-color:${m.color};color:${m.color}` : ""}">${m.text ?? "•"}</div>`,
    });
  }
  iconCache.set(key, icon);
  return icon;
}

function ClickHandler({ onClick }: { onClick?: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function Fitter({ fit, fitKey, padding, center, zoom }: { fit?: LatLng[]; fitKey?: string; padding: [number, number]; center: LatLng; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (fit && fit.length > 1) {
      const b = L.latLngBounds(fit.map((p) => [p.lat, p.lng] as [number, number]));
      map.fitBounds(b, { paddingTopLeft: [40, padding[0]], paddingBottomRight: [40, padding[1]], maxZoom: 15, animate: true });
    } else if (fit && fit.length === 1) {
      map.setView([fit[0].lat, fit[0].lng], Math.max(map.getZoom(), 14), { animate: true });
    } else {
      map.setView([center.lat, center.lng], zoom, { animate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, map]);
  // Карта может менять размер (адаптивная вёрстка) — пересчитываем
  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [map]);
  return null;
}

export default function MapView({
  center,
  zoom = 13,
  markers = [],
  route,
  routeActive,
  fit,
  fitKey,
  onMapClick,
  className,
  padding = [40, 40],
  showZoom = true,
}: MapViewProps) {
  const routeLatLngs = useMemo(() => route?.map((p) => [p.lat, p.lng] as [number, number]), [route]);
  const activeLatLngs = useMemo(() => routeActive?.map((p) => [p.lat, p.lng] as [number, number]), [routeActive]);

  return (
    <div className={className}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        zoomControl={showZoom}
        attributionControl
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} subdomains="abcd" maxZoom={19} />
        <ClickHandler onClick={onMapClick} />
        <Fitter fit={fit} fitKey={fitKey ?? `${center.lat},${center.lng},${zoom}`} padding={padding} center={center} zoom={zoom} />
        {routeLatLngs && routeLatLngs.length > 1 && (
          <Polyline positions={routeLatLngs} pathOptions={{ color: "#0A88F0", weight: 5, opacity: 0.25, dashArray: "2 10", lineCap: "round" }} />
        )}
        {activeLatLngs && activeLatLngs.length > 1 && (
          <>
            <Polyline positions={activeLatLngs} pathOptions={{ color: "#ffffff", weight: 9, opacity: 0.9, lineCap: "round", lineJoin: "round" }} />
            <Polyline positions={activeLatLngs} pathOptions={{ color: "#0A88F0", weight: 5, opacity: 1, lineCap: "round", lineJoin: "round" }} />
          </>
        )}
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.position.lat, m.position.lng]}
            icon={iconFor(m)}
            zIndexOffset={m.kind === "client" ? 500 : m.active ? 1000 : 0}
            eventHandlers={m.onClick ? { click: m.onClick } : undefined}
          />
        ))}
      </MapContainer>
    </div>
  );
}
