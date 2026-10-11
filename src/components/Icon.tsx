/** Набор линейных иконок (inline SVG, без внешних библиотек) */
const PATHS: Record<string, string> = {
  catalog: "M4 5h6v4H4zM14 15h6v4h-6zM14 5h6v4h-6zM7 9v8h7M7 7h7",
  planning: "M4 6h16M4 12h10M4 18h6M17 14l3 3-3 3",
  auto: "M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5l2.6-1.5M17.2 9l2.6-1.5M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  cabinet: "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 9h16M9 4v5M8 13h3M8 16h6",
  notify: "M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0",
  staff: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14.5a6.5 6.5 0 0 1 3.5 5.5",
  techcard: "M7 3h7l5 5v13H7zM14 3v5h5M10 12h6M10 15h6M10 18h4",
  gantt: "M4 4v16h16M7 8h6M10 12h7M8 16h5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  external: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z",
  telegram: "M21 4L3 11l6 2.5M21 4l-3 16-9-6.5M21 4L9 13.5V19l3-3.5",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6L6 18",
  info: "M12 8h.01M11 12h1v5h1M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
  chevronLeft: "M15 6l-6 6 6 6",
  chevronRight: "M9 6l6 6-6 6",
  check: "M5 12.5l4.5 4.5L19 7.5",
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 24, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
