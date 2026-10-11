"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { Bell, ClipboardList, Home, UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "@/components/layout/Toaster";
import { DemoPanel } from "@/components/layout/DemoPanel";
import { Avatar, Splash } from "@/components/ui";
import { useRequireSession } from "@/hooks/useSession";
import { useDb } from "@/hooks/useDb";
import { unreadCount } from "@/lib/selectors";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { user } = useRequireSession("client");
  const db = useDb();
  if (!user) return <Splash />;
  const unread = unreadCount(db, user.id);
  return (
    <AppShell
      tag="Клиент"
      nav={[
        { href: "/client", label: "Главная", icon: Home, exact: true },
        { href: "/client/orders", label: "Заказы", icon: ClipboardList },
        { href: "/client/notifications", label: "Уведомления", icon: Bell, badge: unread },
        { href: "/client/profile", label: "Профиль", icon: UserRound },
      ]}
      right={
        <Link href="/client/profile" className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-3 hover:bg-ink-50">
          <Avatar name={user.name} size={34} />
          <span className="text-sm font-bold">{user.name}</span>
        </Link>
      }
    >
      <Toaster userId={user.id} hrefFor={(n) => (n.orderId ? `/client/order/${n.orderId}` : undefined)} />
      {children}
      <DemoPanel focusUserId={user.id} />
    </AppShell>
  );
}
