import { Award, Truck } from "lucide-react";
import type { Driver } from "@/types";
import { Avatar, RatingPill, TruckPhoto } from "@/components/ui";
import { formatNumber, formatVolume, maskPlate, plural } from "@/lib/format";

/** Компактная карточка водителя: фото, имя, рейтинг, авто */
export function DriverInfo({ driver, right }: { driver: Driver; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Avatar name={driver.name} src={driver.avatar} size={56} />
        <TruckPhoto color={driver.car.color} photo={driver.car.photo} className="absolute -bottom-1.5 -right-2.5 h-7 w-10 rounded-lg ring-2 ring-white" />
      </div>
      <div className="min-w-0 flex-1 pl-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[17px] font-extrabold text-ink-900">{driver.name}</span>
          <RatingPill value={driver.rating} />
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ink-500">
          <Truck className="h-3.5 w-3.5" />
          <span className="truncate">
            {driver.car.brand} {driver.car.model} · {formatVolume(driver.car.tankVolume)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-400">
          <Award className="h-3.5 w-3.5" />
          {formatNumber(driver.ordersCompleted)} {plural(driver.ordersCompleted, "заказ", "заказа", "заказов")} · {maskPlate(driver.car.plate)}
        </div>
      </div>
      {right}
    </div>
  );
}
