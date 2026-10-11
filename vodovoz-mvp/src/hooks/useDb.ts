"use client";
import { useSyncExternalStore } from "react";
import { getDb, subscribeDb } from "@/lib/db";
import type { DbState } from "@/types";

/** Текущее состояние базы. Перерисовывает компонент при любом изменении (в т.ч. из другой вкладки). */
export function useDb(): DbState {
  return useSyncExternalStore(subscribeDb, getDb, getDb);
}
