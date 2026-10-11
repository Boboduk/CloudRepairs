"use client";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getSession, subscribeSession } from "@/lib/auth";
import { useDb } from "./useDb";
import type { Driver, Role, User } from "@/types";

export function useSession(role: Role): { user: User | null; driver: Driver | null } {
  const session = useSyncExternalStore(
    subscribeSession,
    () => getSession(role),
    () => null,
  );
  const db = useDb();
  return useMemo(() => {
    const user = session ? db.users.find((u) => u.id === session.userId) ?? null : null;
    const driver = user?.driverId ? db.drivers.find((d) => d.id === user.driverId) ?? null : null;
    return { user, driver };
  }, [session, db]);
}

/** Требует вход под ролью; иначе переводит на страницу входа */
export function useRequireSession(role: Role) {
  const res = useSession(role);
  const router = useRouter();
  useEffect(() => {
    if (!res.user) router.replace(`/login?role=${role}`);
  }, [res.user, role, router]);
  return res;
}
