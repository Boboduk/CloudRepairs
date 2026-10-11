import type { ReactNode } from "react";

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-aqua-50 text-aqua-500">{icon}</div>
      <div className="text-lg font-extrabold text-ink-900">{title}</div>
      {text && <p className="mt-1.5 max-w-xs text-[15px] text-ink-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
