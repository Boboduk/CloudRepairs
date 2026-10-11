"use client";
import { useEffect, useState } from "react";

/** Текущее время, обновляемое с заданным интервалом (для анимаций и таймеров) */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
