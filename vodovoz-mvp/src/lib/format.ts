const NBSP = " ";

export function formatPrice(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Math.round(value).toLocaleString("ru-RU").replace(/\s/g, NBSP)}${NBSP}₽`;
}

export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("ru-RU").replace(/\s/g, NBSP);
}

export function formatVolume(v: number): string {
  return `${String(v).replace(".", ",")}${NBSP}м³`;
}

export function formatKm(km: number): string {
  return `${km.toFixed(1).replace(".", ",")}${NBSP}км`;
}

export function formatRating(r: number): string {
  return r.toFixed(r * 10 === Math.round(r * 10) ? 1 : 2).replace(".", ",");
}

const MONTHS_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  return `${day} ${MONTHS_GEN[d.getMonth()]}, ${formatTime(iso)}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function relativeTime(iso: string, now = Date.now()): string {
  const diff = Math.round((now - Date.parse(iso)) / 1000);
  if (diff < 45) return "только что";
  const min = Math.round(diff / 60);
  if (min < 60) return `${min} ${plural(min, "минуту", "минуты", "минут")} назад`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} ${plural(h, "час", "часа", "часов")} назад`;
  const days = Math.round(h / 24);
  if (days < 7) return `${days} ${plural(days, "день", "дня", "дней")} назад`;
  return formatDate(iso);
}

/** Частично скрывает госномер: «А 123 ВС 14» → «А •2• ВС 14» */
export function maskPlate(plate: string): string {
  const parts = plate.split(" ");
  if (parts.length < 2) return plate;
  const digits = parts[1];
  parts[1] = `•${digits.slice(1, 2)}•`;
  return parts.join(" ");
}

export function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})-(\d{2})-(\d{2})$/, "•••-••-$3");
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function minutesLabel(min: number): string {
  const m = Math.max(1, Math.round(min));
  return `${m}${NBSP}${plural(m, "минута", "минуты", "минут")}`;
}

export function experienceLabel(years: number): string {
  return `${years} ${plural(years, "год", "года", "лет")}`;
}
