import type { City } from "@/types";

// Набор улиц, общий для большинства российских городов (для демо-подсказок).
const commonStreets: City["streets"] = [
  { title: "ул. Ленина, 15", dLat: 0.0021, dLng: 0.0042 },
  { title: "ул. Советская, 8", dLat: -0.0062, dLng: 0.0121 },
  { title: "ул. Мира, 42", dLat: 0.0105, dLng: -0.0153 },
  { title: "ул. Гагарина, 3", dLat: -0.0128, dLng: -0.0082 },
  { title: "ул. Садовая, 27", dLat: 0.0168, dLng: 0.0221 },
  { title: "ул. Строителей, 11", dLat: -0.0191, dLng: 0.0262 },
  { title: "ул. Молодёжная, 5", dLat: 0.0072, dLng: -0.0318 },
  { title: "СНТ «Берёзка», уч. 24", dLat: 0.0262, dLng: -0.0391 },
  { title: "ДНТ «Сосновый бор», уч. 7", dLat: -0.0251, dLng: -0.0352 },
  { title: "ул. Лесная, 19", dLat: 0.0228, dLng: 0.0402 },
];

export const CITIES: City[] = [
  {
    id: "yakutsk",
    name: "Якутск",
    center: { lat: 62.0281, lng: 129.7325 },
    zoom: 13,
    streets: [
      { title: "ул. Ленина, 15", dLat: 0.0012, dLng: 0.0035 },
      { title: "ул. Кирова, 18", dLat: -0.0035, dLng: -0.0062 },
      { title: "ул. Орджоникидзе, 36", dLat: -0.0068, dLng: 0.0081 },
      { title: "ул. Петра Алексеева, 21", dLat: -0.0146, dLng: -0.0222 },
      { title: "ул. Дзержинского, 52", dLat: 0.0092, dLng: -0.0175 },
      { title: "ул. Лермонтова, 104", dLat: 0.0121, dLng: 0.0214 },
      { title: "ул. Хабарова, 27", dLat: -0.0186, dLng: 0.0121 },
      { title: "ул. Курашова, 9", dLat: 0.0168, dLng: -0.0291 },
      { title: "Покровский тракт, 16 км, уч. 4", dLat: -0.0291, dLng: -0.0462 },
      { title: "СОТ «Сосновый бор», уч. 112", dLat: 0.0262, dLng: 0.0418 },
      { title: "ДНТ «Север», уч. 31", dLat: 0.0302, dLng: -0.0402 },
      { title: "мкр. Марха, ул. Дорожная, 6", dLat: 0.0348, dLng: -0.0521 },
    ],
  },
  {
    id: "moscow",
    name: "Москва (область)",
    center: { lat: 55.7512, lng: 37.6184 },
    zoom: 12,
    streets: commonStreets,
  },
  {
    id: "novosibirsk",
    name: "Новосибирск",
    center: { lat: 55.0302, lng: 82.9204 },
    zoom: 13,
    streets: commonStreets,
  },
  {
    id: "krasnoyarsk",
    name: "Красноярск",
    center: { lat: 56.0153, lng: 92.8932 },
    zoom: 13,
    streets: commonStreets,
  },
  {
    id: "irkutsk",
    name: "Иркутск",
    center: { lat: 52.287, lng: 104.305 },
    zoom: 13,
    streets: commonStreets,
  },
];

export const DEFAULT_CITY_ID = "yakutsk";

export function getCity(id: string | undefined): City {
  return CITIES.find((c) => c.id === id) ?? CITIES[0];
}

export function cityAddresses(city: City) {
  return city.streets.map((s) => ({
    title: `г. ${city.name.replace(/ \(.*\)$/, "")}, ${s.title}`,
    short: s.title,
    location: { lat: city.center.lat + s.dLat, lng: city.center.lng + s.dLng },
  }));
}
