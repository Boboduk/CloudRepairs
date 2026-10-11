"use client";
import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo, cn } from "@/components/ui";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
  /** Подсвечивать пункт только при точном совпадении пути */
  exact?: boolean;
}

/**
 * Оболочка мобильного приложения: нижняя навигация на телефоне,
 * верхняя панель на десктопе.
 */
export function AppShell({
  nav,
  children,
  right,
  tag,
}: {
  nav: NavItem[];
  children: ReactNode;
  right?: ReactNode;
  tag?: string;
}) {
  const pathname = usePathname();
  const isActive = (item: NavItem) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/"));

  return (
    <div className="min-h-dvh bg-ink-50">
      {/* Desktop header */}
      <header className="sticky top-0 z-[700] hidden h-16 items-center gap-6 border-b border-ink-100 bg-white/90 px-6 backdrop-blur lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <Logo />
          {tag && <span className="rounded-lg bg-ink-100 px-2 py-1 text-xs font-bold text-ink-500">{tag}</span>}
        </Link>
        <nav className="ml-6 flex items-center gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-bold transition",
                  active ? "bg-aqua-50 text-aqua-700" : "text-ink-500 hover:bg-ink-100 hover:text-ink-800",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
                {!!item.badge && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-coral-500 px-1 text-[11px] text-white">{item.badge}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">{right}</div>
      </header>

      <main className="pb-[calc(4.75rem+var(--safe-bottom))] lg:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-[700] border-t border-ink-100 bg-white/95 pb-[var(--safe-bottom)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link key={item.href} href={item.href} className="relative flex h-[4.25rem] flex-1 flex-col items-center justify-center gap-1">
                <div className={cn("relative grid h-8 w-14 place-items-center rounded-full transition", active && "bg-aqua-50")}>
                  <Icon className={cn("h-[22px] w-[22px] transition", active ? "text-aqua-600" : "text-ink-400")} />
                  {!!item.badge && (
                    <span className="absolute -top-0.5 right-2 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-white bg-coral-500 px-1 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={cn("text-[11px] font-bold", active ? "text-ink-900" : "text-ink-400")}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/**
 * Экран «карта + панель»: на телефоне карта сверху, а панель
 * наезжает на неё как bottom sheet; на десктопе — две колонки.
 */
export function MapLayout({ map, overlay, children, mapHeight = "46dvh" }: { map: ReactNode; overlay?: ReactNode; children: ReactNode; mapHeight?: string }) {
  return (
    <div className="lg:grid lg:h-[calc(100dvh-4rem)] lg:grid-cols-[460px_1fr] xl:grid-cols-[500px_1fr]">
      <div className="fixed inset-x-0 top-0 isolate z-0 lg:relative lg:order-2 lg:!h-full" style={{ height: mapHeight }}>
        {map}
        {overlay}
      </div>
      <div
        className="relative z-10 rounded-t-[28px] bg-white shadow-[0_-12px_40px_-12px_rgba(13,23,43,.25)] lg:order-1 lg:!mt-0 lg:h-full lg:overflow-y-auto lg:rounded-none lg:border-r lg:border-ink-100 lg:shadow-none"
        style={{ marginTop: `calc(${mapHeight} - 28px)`, minHeight: `calc(100dvh - ${mapHeight} + 28px - 4.75rem)` }}
      >
        <div className="mx-auto mb-1 mt-2.5 h-1.5 w-10 rounded-full bg-ink-200 lg:hidden" />
        {children}
      </div>
    </div>
  );
}

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-3xl px-4 pb-8 pt-[calc(1rem+env(safe-area-inset-top))] lg:px-8 lg:pt-8", className)}>{children}</div>;
}

export function PageTitle({ title, subtitle, action }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
