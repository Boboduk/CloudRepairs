import { initials } from "@/lib/format";
import { cn } from "./cn";

const GRADIENTS = [
  "from-aqua-400 to-aqua-700",
  "from-mint-400 to-aqua-600",
  "from-indigo-400 to-aqua-700",
  "from-sky-300 to-indigo-600",
  "from-teal-300 to-cyan-700",
  "from-blue-400 to-ink-800",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function Avatar({
  name,
  src,
  size = 48,
  className,
  online,
}: {
  name: string;
  src?: string;
  size?: number;
  className?: string;
  online?: boolean;
}) {
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full rounded-[32%] object-cover" />
      ) : (
        <div
          className={cn(
            "grid h-full w-full place-items-center rounded-[32%] bg-gradient-to-br font-display font-semibold text-white",
            GRADIENTS[hash(name) % GRADIENTS.length],
          )}
          style={{ fontSize: size * 0.36 }}
        >
          {initials(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white",
            online ? "bg-mint-500" : "bg-ink-300",
          )}
        />
      )}
    </div>
  );
}
