/**
 * Локальная «база данных» демо-версии.
 *
 * Состояние хранится в localStorage и синхронизируется между вкладками
 * (событие `storage`), поэтому клиент, водитель и админ, открытые в разных
 * вкладках или в режиме «Демо: два экрана», видят изменения друг друга.
 *
 * Весь доступ на запись идёт только через `mutate()` из `lib/api.ts`.
 * Для перехода на Supabase достаточно заменить реализацию `lib/api.ts`
 * и подписку на изменения (Supabase Realtime) — UI менять не придётся.
 */
import type { DbState } from "@/types";
import { createSeed, DB_VERSION } from "@/data/seed";
import { readJson, writeJson } from "./storage";

export const DB_KEY = "vodovoz:db";

let state: DbState | null = null;
const listeners = new Set<() => void>();
let syncAttached = false;

function load(): DbState {
  const stored = readJson<DbState>(DB_KEY);
  if (stored && stored.version === DB_VERSION) return stored;
  const fresh = createSeed();
  writeJson(DB_KEY, fresh);
  return fresh;
}

function attachSync() {
  if (syncAttached || typeof window === "undefined") return;
  syncAttached = true;
  window.addEventListener("storage", (e) => {
    if (e.key !== DB_KEY || !e.newValue) return;
    try {
      state = JSON.parse(e.newValue) as DbState;
      emit();
    } catch {
      /* ignore */
    }
  });
}

function emit() {
  listeners.forEach((l) => l());
}

export function getDb(): DbState {
  if (!state) {
    state = load();
    attachSync();
  }
  return state;
}

export function subscribeDb(listener: () => void): () => void {
  getDb();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Атомарное (в пределах вкладки) изменение состояния.
 * Перед записью перечитываем localStorage, чтобы не затереть изменения
 * из соседней вкладки.
 */
export function mutate<T = void>(fn: (draft: DbState) => T): T {
  const latest = readJson<DbState>(DB_KEY);
  const base = latest && latest.version === DB_VERSION ? latest : getDb();
  const draft: DbState = structuredClone(base);
  const result = fn(draft);
  state = draft;
  writeJson(DB_KEY, draft);
  emit();
  return result;
}

/** Как mutate, но сохраняет изменения, только если fn вернула true */
export function mutateIf(fn: (draft: DbState) => boolean): boolean {
  const latest = readJson<DbState>(DB_KEY);
  const base = latest && latest.version === DB_VERSION ? latest : getDb();
  const draft: DbState = structuredClone(base);
  if (!fn(draft)) return false;
  state = draft;
  writeJson(DB_KEY, draft);
  emit();
  return true;
}

export function replaceDb(next: DbState) {
  state = next;
  writeJson(DB_KEY, next);
  emit();
}
