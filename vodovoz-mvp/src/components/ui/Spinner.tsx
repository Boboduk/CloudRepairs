import { LogoMark } from "./Logo";

export function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink-50">
      <div className="flex flex-col items-center gap-4">
        <LogoMark size={56} className="animate-float" />
        <div className="h-1 w-24 overflow-hidden rounded-full bg-ink-200">
          <div className="h-full w-full animate-pulse rounded-full bg-aqua-500" />
        </div>
      </div>
    </div>
  );
}
