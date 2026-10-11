"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, LayoutDashboard, LogOut, Settings, Truck, Users } from "lucide-react";
import { DemoPanel } from "@/components/layout/DemoPanel";
import { Avatar, Logo, Splash, cn } from "@/components/ui";
import { useRequireSession } from "@/hooks/useSession";
import { useDb } from "@/hooks/useDb";
import { logout } from "@/lib/auth";
import { isActive } from "@/lib/selectors";
import { getCity } from "@/data/cities";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useRequireSession("admin");
  const db = useDb();
  const pathname = usePathname();
  const router = useRouter();
  if (!user) return <Splash />;

  const nav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/orders", label: "Заказы", icon: ClipboardList, badge: db.orders.filter(isActive).length },
    { href: "/admin/drivers", label: "Водители", icon: Truck },
    { href: "/admin/clients", label: "Клиенты", icon: Users },
    { href: "/admin/settings", label: "Настройки", icon: Settings },
  ];
  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <div className="min-h-dvh bg-ink-50 lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-[700] hidden w-64 flex-col bg-ink-900 p-4 text-white lg:flex">
        <Link href="/" className="px-2 py-2">
          <Logo light />
        </Link>
        <div className="mt-2 rounded-xl bg-white/5 px-3 py-2 text-[12px] text-ink-300">
          Админ-панель · {getCity(db.settings.cityId).name}
        </div>
        <nav className="mt-6 space-y-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold transition",
                active(n.href, n.exact) ? "bg-aqua-500 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <n.icon className="h-5 w-5" />
              {n.label}
              {!!n.badge && <span className="ml-auto rounded-md bg-white/15 px-1.5 text-[12px] font-bold">{n.badge}</span>}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 rounded-2xl bg-white/5 p-3">
          <Avatar name={user.name} size={36} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">{user.name}</div>
            <div className="truncate text-[12px] text-ink-400">{user.email}</div>
          </div>
          <button
            onClick={() => {
              logout("admin");
              router.push("/");
            }}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-white/10 hover:text-white"
            aria-label="Выйти"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Мобильная шапка */}
      <header className="sticky top-0 z-[700] bg-ink-900 text-white lg:hidden">
        <div className="flex items-center justify-between px-4 pb-2 pt-[calc(.75rem+env(safe-area-inset-top))]">
          <Logo light />
          <button
            onClick={() => {
              logout("admin");
              router.push("/");
            }}
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/10"
            aria-label="Выйти"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-[13px] font-bold",
                active(n.href, n.exact) ? "bg-aqua-500 text-white" : "bg-white/5 text-ink-300",
              )}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1400px] p-4 lg:p-8">{children}</main>
      <DemoPanel className="bottom-4 right-4 lg:bottom-6 lg:right-6" />
    </div>
  );
}
