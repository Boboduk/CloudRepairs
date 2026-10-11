/** Линейные иконки 24×24 (inline SVG, без внешних библиотек) */
const PATHS = {
  catalog: ["M3 4h7v5H3z", "M14 15h7v5h-7z", "M14 4h7v5h-7z", "M6.5 9v8.5H14", "M6.5 13H14", "M10 6.5h4"],
  planning: ["M4 5h16v15H4z", "M4 9.5h16", "M8.5 3v4", "M15.5 3v4", "M8 13.5h3", "M8 16.5h6"],
  staff: ["M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z", "M2.5 20a6.5 6.5 0 0 1 13 0", "M16 4.5a3.5 3.5 0 0 1 0 6.5", "M18 14.5a6.5 6.5 0 0 1 3.5 5.5"],
  techcard: ["M7 3h7l5 5v13H7z", "M14 3v5h5", "M10 12h6", "M10 15h6", "M10 18h4"],
  cabinet: ["M5 3h14v18H5z", "M9 7h6", "M9 11h6", "M9.5 16.5l1.5 1.5 3.5-3.5"],
  monitor: ["M3 4h18v12H3z", "M8 20h8", "M12 16v4", "M6.5 12.5l3-3 2.5 2 4.5-4.5"],
  skills: ["M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.4 6.7 19.1l1-5.8L3.5 9.2l5.9-.9z"],
  optimize: ["M12 21a9 9 0 1 1 9-9", "M12 12l4-4", "M12 7v1", "M7 12h1", "M17 16l2 2 3-3"],
  gantt: ["M4 4v16h16", "M7 7.5h6", "M10 11.5h7", "M8 15.5h5"],
  auto: [
    "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z",
    "M12 2.5v2.5M12 19v2.5M4.6 5.6l1.8 1.8M17.6 16.6l1.8 1.8M2.5 12H5M19 12h2.5M4.6 18.4l1.8-1.8M17.6 7.4l1.8-1.8",
  ],
  arrow: ["M5 12h14", "M13 6l6 6-6 6"],
  arrowUpRight: ["M7 17L17 7", "M8 7h9v9"],
  external: ["M14 4h6v6", "M20 4l-9 9", "M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"],
  mail: ["M3 6h18v12H3z", "M3 7l9 6 9-6"],
  phone: ["M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"],
  telegram: ["M21 4L3 11l6 2.5", "M21 4l-3 16-9-6.5", "M21 4L9 13.5V19l3-3.5"],
  menu: ["M4 7h16", "M4 12h16", "M4 17h16"],
  close: ["M6 6l12 12", "M18 6L6 18"],
  check: ["M5 12.5l4.5 4.5L19 7.5"],
  chevronLeft: ["M15 6l-6 6 6 6"],
  chevronRight: ["M9 6l6 6-6 6"],
  plus: ["M12 5v14", "M5 12h14"],
  zoom: ["M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z", "M20 20l-4-4", "M11 8v6", "M8 11h6"],
  shield: ["M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z", "M8.5 12l2.5 2.5 4.5-5"],
  devices: ["M3 5h13v10H3z", "M7 19h5", "M9.5 15v4", "M17 9h4v11h-4z"],
  layers: ["M12 3l9 5-9 5-9-5z", "M3 13l9 5 9-5"],
  spark: ["M12 3v4", "M12 17v4", "M3 12h4", "M17 12h4", "M6 6l2.5 2.5", "M15.5 15.5L18 18", "M6 18l2.5-2.5", "M15.5 8.5L18 6"],
  factory: ["M3 21V10l6 4V10l6 4V6l6 3v12z", "M7 17h2", "M12 17h2", "M17 17h2"],
  users: ["M16 20a4 4 0 0 0-8 0", "M12 13a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z", "M20 19a3 3 0 0 0-3-3", "M4 19a3 3 0 0 1 3-3"],
  route: ["M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z", "M18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z", "M8 17h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"],
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 24, className, strokeWidth = 1.8 }: { name: IconName; size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
