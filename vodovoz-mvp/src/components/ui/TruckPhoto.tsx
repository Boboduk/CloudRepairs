import { cn } from "./cn";

/**
 * «Фотография» автомобиля для демо: стилизованная иллюстрация водовоза
 * в цвете машины. Если водитель загрузил фото — показываем его.
 */
export function TruckPhoto({
  color = "#0A88F0",
  photo,
  className,
  label,
}: {
  color?: string;
  photo?: string;
  className?: string;
  label?: string;
}) {
  if (photo) {
    return (
      <div className={cn("overflow-hidden rounded-2xl bg-ink-100", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt={label ?? "Автомобиль"} className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-gradient-to-b from-aqua-50 to-ink-100", className)}>
      <svg viewBox="0 0 240 140" className="h-full w-full" role="img" aria-label={label ?? "Водовоз"}>
        <defs>
          <linearGradient id={`tank-${color}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".55" />
            <stop offset=".45" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse cx="120" cy="118" rx="100" ry="8" fill="#0D172B" opacity=".12" />
        <rect x="18" y="100" width="204" height="8" rx="4" fill="#2B3A56" />
        {/* цистерна */}
        <rect x="20" y="40" width="138" height="58" rx="29" fill={color} />
        <rect x="20" y="40" width="138" height="58" rx="29" fill={`url(#tank-${color})`} />
        <rect x="44" y="34" width="22" height="8" rx="3" fill="#2B3A56" />
        <path d="M58 69c0-7 8-15 8-15s8 8 8 15a8 8 0 0 1-16 0z" fill="#fff" opacity=".95" />
        <rect x="84" y="62" width="58" height="5" rx="2.5" fill="#fff" opacity=".55" />
        <rect x="84" y="72" width="40" height="5" rx="2.5" fill="#fff" opacity=".35" />
        {/* кабина */}
        <path d="M164 52h30c6 0 10 3 13 8l13 22c2 3 2 6 2 9v9h-58z" fill="#0D172B" />
        <path d="M174 58h18c3 0 5 1 7 4l9 16h-34z" fill="#A8DCFF" />
        <rect x="214" y="88" width="9" height="6" rx="2" fill="#F5A524" />
        {/* колёса */}
        {[52, 92, 186].map((x) => (
          <g key={x}>
            <circle cx={x} cy="106" r="15" fill="#0D172B" />
            <circle cx={x} cy="106" r="6" fill="#AEBBD0" />
          </g>
        ))}
      </svg>
    </div>
  );
}
