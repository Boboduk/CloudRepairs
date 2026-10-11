"use client";
import { useEffect, useState, type ReactNode } from "react";
import { Splash } from "@/components/ui";
import { useSimulation } from "@/hooks/useSimulation";

function Simulation() {
  useSimulation();
  return null;
}

/**
 * Данные демо живут в localStorage, поэтому приложение рендерится
 * только на клиенте (после монтирования).
 */
export function Providers({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <Splash />;
  return (
    <>
      <Simulation />
      {children}
    </>
  );
}
