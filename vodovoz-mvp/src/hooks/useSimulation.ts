"use client";
import { useEffect } from "react";
import { simulationTick } from "@/lib/simulation";
import { readJson, writeJson } from "@/lib/storage";
import { uid } from "@/lib/random";

const LEADER_KEY = "vodovoz:sim-leader";
const TAB_ID = typeof window !== "undefined" ? uid("tab") : "ssr";

/**
 * Запускает демо-симуляцию. Если открыто несколько вкладок/фреймов,
 * тикает только одна — «лидер» (простое голосование через localStorage).
 */
export function useSimulation() {
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const leader = readJson<{ id: string; at: number }>(LEADER_KEY);
      if (!leader || leader.id === TAB_ID || now - leader.at > 3500) {
        writeJson(LEADER_KEY, { id: TAB_ID, at: now });
        try {
          simulationTick(now);
        } catch (e) {
          console.error("[simulation]", e);
        }
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    const release = () => {
      const leader = readJson<{ id: string }>(LEADER_KEY);
      if (leader?.id === TAB_ID) writeJson(LEADER_KEY, { id: "", at: 0 });
    };
    window.addEventListener("beforeunload", release);
    return () => {
      clearInterval(t);
      window.removeEventListener("beforeunload", release);
    };
  }, []);
}
