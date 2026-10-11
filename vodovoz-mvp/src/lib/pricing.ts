import { DELIVERY_BASE_PRICE, WATER_TYPES } from "@/data/catalog";
import type { Order, WaterType } from "@/types";

export function roundPrice(v: number, step = 50): number {
  return Math.max(step, Math.round(v / step) * step);
}

/** Рекомендованная цена заказа: стоимость воды + подача машины */
export function recommendedPrice(volume: number, waterType: WaterType): number {
  const perM3 = WATER_TYPES.find((w) => w.id === waterType)?.pricePerM3 ?? 400;
  return roundPrice(DELIVERY_BASE_PRICE + perM3 * volume, 100);
}

export type PriceLevel = "low" | "fair" | "high";

export function priceLevel(price: number, recommended: number): PriceLevel {
  if (price < recommended * 0.85) return "low";
  if (price > recommended * 1.2) return "high";
  return "fair";
}

export interface Economics {
  total: number;
  commission: number;
  driverIncome: number;
  rate: number;
}

export function splitEconomics(total: number, rate: number): Economics {
  const commission = Math.round(total * rate);
  return { total, commission, driverIncome: total - commission, rate };
}

export function orderEconomics(order: Order): Economics {
  return splitEconomics(order.finalPrice ?? order.clientPrice, order.commissionRate);
}
