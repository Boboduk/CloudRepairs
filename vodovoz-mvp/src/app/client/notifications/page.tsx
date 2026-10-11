"use client";
import { useEffect, useMemo } from "react";
import { CheckCheck } from "lucide-react";
import { PageContainer, PageTitle } from "@/components/layout/AppShell";
import { NotificationList } from "@/components/layout/NotificationList";
import { Button } from "@/components/ui";
import { useDb } from "@/hooks/useDb";
import { useSession } from "@/hooks/useSession";
import { markNotificationsRead } from "@/lib/api";

export default function ClientNotificationsPage() {
  const db = useDb();
  const { user } = useSession("client");
  const items = useMemo(
    () => (user ? db.notifications.filter((n) => n.userId === user.id).sort((a, b) => Date.parse(b.at) - Date.parse(a.at)) : []),
    [db.notifications, user],
  );
  const unread = items.filter((n) => !n.read).length;

  // Отмечаем прочитанными через пару секунд после открытия
  useEffect(() => {
    if (!user || !unread) return;
    const t = setTimeout(() => markNotificationsRead(user.id), 2500);
    return () => clearTimeout(t);
  }, [user, unread]);

  return (
    <PageContainer>
      <PageTitle
        title="Уведомления"
        subtitle={unread ? `${unread} новых` : "Все прочитаны"}
        action={
          unread > 0 && user ? (
            <Button variant="ghost" size="sm" icon={<CheckCheck className="h-4 w-4" />} onClick={() => markNotificationsRead(user.id)}>
              Прочитать все
            </Button>
          ) : undefined
        }
      />
      <NotificationList items={items} hrefFor={(n) => (n.orderId ? `/client/order/${n.orderId}` : undefined)} />
    </PageContainer>
  );
}
