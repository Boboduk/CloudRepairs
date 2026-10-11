/**
 * Демо-аутентификация. Сессии хранятся отдельно для каждой роли,
 * поэтому в одном браузере можно одновременно быть клиентом,
 * водителем и администратором (удобно для показа инвестору).
 *
 * В продакшене: Supabase Auth / собственный backend с SMS-кодом и JWT.
 */
import type { Role, Session, User } from "@/types";
import { getDb, mutate } from "./db";
import { readJson, removeKey, writeJson } from "./storage";
import { uid } from "./random";

const key = (role: Role) => `vodovoz:session:${role}`;
const listeners = new Set<() => void>();
const cache: Partial<Record<Role, Session | null>> = {};
let attached = false;

function emit() {
  listeners.forEach((l) => l());
}

function attach() {
  if (attached || typeof window === "undefined") return;
  attached = true;
  window.addEventListener("storage", (e) => {
    if (!e.key?.startsWith("vodovoz:session:")) return;
    (["client", "driver", "admin"] as Role[]).forEach((r) => delete cache[r]);
    emit();
  });
}

export function getSession(role: Role): Session | null {
  attach();
  if (!(role in cache)) cache[role] = readJson<Session>(key(role));
  return cache[role] ?? null;
}

export function subscribeSession(l: () => void) {
  attach();
  listeners.add(l);
  return () => listeners.delete(l);
}

function setSession(role: Role, s: Session | null) {
  cache[role] = s;
  if (s) writeJson(key(role), s);
  else removeKey(key(role));
  emit();
}

export type AuthResult = { ok: true; user: User } | { ok: false; error: string };

export function login(email: string, password: string): AuthResult {
  const db = getDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password !== password) {
    return { ok: false, error: "Неверный e-mail или пароль" };
  }
  if (user.blocked) return { ok: false, error: "Аккаунт заблокирован администратором" };
  if (user.role === "driver") {
    const d = db.drivers.find((x) => x.id === user.driverId);
    if (d?.blocked) return { ok: false, error: "Аккаунт водителя заблокирован администратором" };
  }
  setSession(user.role, { userId: user.id, role: user.role, at: new Date().toISOString() });
  return { ok: true, user };
}

export function loginAs(role: Role, userId: string) {
  setSession(role, { userId, role, at: new Date().toISOString() });
}

export function logout(role: Role) {
  setSession(role, null);
}

export interface RegisterInput {
  role: "client" | "driver";
  name: string;
  phone: string;
  email: string;
  password: string;
  car?: { brand: string; model: string; plate: string; tankVolume: number; year: number; photo?: string };
}

export function register(input: RegisterInput): AuthResult {
  const email = input.email.trim().toLowerCase();
  if (getDb().users.some((u) => u.email.toLowerCase() === email)) {
    return { ok: false, error: "Пользователь с таким e-mail уже существует" };
  }
  const user = mutate((db) => {
    const now = new Date().toISOString();
    const u: User = {
      id: uid("u"),
      role: input.role,
      name: input.name.trim(),
      phone: input.phone.trim(),
      email,
      password: input.password,
      createdAt: now,
    };
    if (input.role === "driver" && input.car) {
      const driverId = uid("d");
      u.driverId = driverId;
      const center = db.drivers[0]?.location ?? { lat: 62.03, lng: 129.73 };
      db.drivers.push({
        id: driverId,
        userId: u.id,
        name: u.name,
        phone: u.phone,
        car: { ...input.car, color: "#0A88F0" },
        rating: 5,
        ratingCount: 0,
        ordersCompleted: 0,
        experienceYears: 0,
        location: { lat: center.lat + 0.006, lng: center.lng - 0.01 },
        online: false,
        verified: false,
        blocked: false,
        isBot: false,
        priceBias: 0,
        reviews: [],
        documents: [
          { id: "license", title: "Водительское удостоверение", number: "—", status: "pending" },
          { id: "sts", title: "СТС автомобиля", number: "—", status: "pending" },
          { id: "sanpass", title: "Санитарный паспорт цистерны", number: "—", status: "missing" },
          { id: "water", title: "Сертификат качества воды", number: "—", status: "missing" },
        ],
        createdAt: now,
      });
    }
    db.users.push(u);
    db.notifications.push({
      id: uid("n"),
      userId: u.id,
      title: "Регистрация завершена",
      body:
        input.role === "driver"
          ? "Профиль отправлен на проверку. В демо-режиме вы уже можете выходить на линию."
          : "Теперь вы можете заказать доставку воды.",
      kind: "success",
      at: now,
      read: false,
    });
    return u;
  });
  setSession(user.role, { userId: user.id, role: user.role, at: new Date().toISOString() });
  return { ok: true, user };
}
