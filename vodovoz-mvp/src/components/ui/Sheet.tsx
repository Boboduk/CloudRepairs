"use client";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "./cn";

/** Нижний лист на мобильном, модальное окно на десктопе */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade-in bg-ink-900/45 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative flex max-h-[92dvh] w-full animate-slide-up flex-col overflow-hidden rounded-t-[28px] bg-white shadow-lift sm:rounded-[28px]",
          wide ? "sm:max-w-2xl" : "sm:max-w-md",
        )}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-ink-200 sm:hidden" />
        {(title || true) && (
          <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-3 sm:pt-5">
            <div className="text-lg font-extrabold text-ink-900">{title}</div>
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-ink-100 text-ink-500 hover:bg-ink-200" aria-label="Закрыть">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        {footer && <div className="border-t border-ink-100 bg-white px-5 py-4 pb-[calc(1rem+var(--safe-bottom))]">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
