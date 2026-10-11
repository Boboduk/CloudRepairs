/**
 * Чистые функции «времени симуляции». Используются и движком, и UI,
 * поэтому позиция водовоза и прогресс слива одинаковы во всех вкладках.
 */
import type { Order, OrderStatus } from "@/types";

/** Для заказов, созданных в демо, «минута» пути длится 1.5 секунды */
export const DEMO_MS_PER_MIN = 1500;

export function stageStartedAt(order: Order, status: OrderStatus = order.status): number {
  for (let i = order.timeline.length - 1; i >= 0; i--) {
    if (order.timeline[i].status === status) return Date.parse(order.timeline[i].at);
  }
  return Date.parse(order.updatedAt);
}

export function simMinute(order: Order, speed: number): number {
  return (order.simMsPerMin || DEMO_MS_PER_MIN) / Math.max(0.25, speed);
}

export function travelDurationMs(order: Order, speed: number): number {
  return (order.etaMin ?? 10) * simMinute(order, speed);
}

export function travelProgress(order: Order, now: number, speed: number): number {
  if (order.status === "accepted") return 0;
  if (order.status !== "en_route") return ["arrived", "delivering", "completed"].includes(order.status) ? 1 : 0;
  const elapsed = now - stageStartedAt(order, "en_route");
  return Math.min(1, Math.max(0, elapsed / travelDurationMs(order, speed)));
}

export function remainingEtaMin(order: Order, now: number, speed: number): number {
  const p = travelProgress(order, now, speed);
  return Math.max(0, Math.ceil((order.etaMin ?? 10) * (1 - p)));
}

export function deliveryDurationMs(order: Order, speed: number): number {
  return Math.max(2, order.volume * 0.8) * simMinute(order, speed);
}

export function deliveryProgress(order: Order, now: number, speed: number): number {
  if (order.status === "completed") return 1;
  if (order.status !== "delivering") return 0;
  const elapsed = now - stageStartedAt(order, "delivering");
  return Math.min(1, Math.max(0, elapsed / deliveryDurationMs(order, speed)));
}

/** Запланированный заказ, время которого ещё не наступило */
export function isFutureScheduled(order: Order, now: number): boolean {
  if (order.schedule.type === "now" || !order.schedule.date) return false;
  const at = Date.parse(`${order.schedule.date}T${order.schedule.time ?? "09:00"}:00`);
  return at - now > 30 * 60000;
}

export function scheduledAt(order: Order): number | null {
  if (!order.schedule.date) return null;
  return Date.parse(`${order.schedule.date}T${order.schedule.time ?? "09:00"}:00`);
}
