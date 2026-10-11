import { cn } from "./cn";

export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <linearGradient id="vv-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#33A6FB" />
          <stop offset="1" stopColor="#006CD1" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#vv-logo)" />
      <path d="M20 7.5c0 0-9 9.6-9 16a9 9 0 0 0 18 0c0-6.4-9-16-9-16z" fill="#fff" />
      <path d="M14.5 25.5c1.8 1.2 3.6 1.2 5.5 0s3.7-1.2 5.5 0" stroke="#0A88F0" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <div className="leading-none">
        <div className={cn("font-display text-[19px] font-semibold tracking-tight", light ? "text-white" : "text-ink-900")}>Водовоз</div>
        <div className={cn("mt-0.5 text-[10px] font-bold uppercase tracking-[.18em]", light ? "text-aqua-200" : "text-aqua-500")}>вода по вызову</div>
      </div>
    </div>
  );
}
