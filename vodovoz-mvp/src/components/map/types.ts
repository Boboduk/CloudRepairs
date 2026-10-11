import type { LatLng } from "@/types";

export type MarkerKind = "truck" | "client" | "order";

export interface MapMarker {
  id: string;
  position: LatLng;
  kind: MarkerKind;
  color?: string;
  label?: string;
  active?: boolean;
  offline?: boolean;
  /** Текст внутри маркера заказа (например, объём) */
  text?: string;
  pulse?: boolean;
  onClick?: () => void;
}

export interface MapViewProps {
  center: LatLng;
  zoom?: number;
  markers?: MapMarker[];
  /** Полный маршрут (пунктир) */
  route?: LatLng[] | null;
  /** Оставшаяся часть маршрута (сплошная) */
  routeActive?: LatLng[] | null;
  /** Точки, в которые нужно вписать карту; пересчитывается при смене fitKey */
  fit?: LatLng[];
  fitKey?: string;
  onMapClick?: (p: LatLng) => void;
  className?: string;
  /** Отступы при вписывании (сверху/снизу), px */
  padding?: [number, number];
  showZoom?: boolean;
}
