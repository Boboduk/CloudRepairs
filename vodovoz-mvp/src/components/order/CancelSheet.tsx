"use client";
import { useState } from "react";
import { CANCEL_REASONS } from "@/data/catalog";
import { Button, Sheet, cn } from "@/components/ui";

export function CancelSheet({
  open,
  onClose,
  onConfirm,
  warning,
  reasons = CANCEL_REASONS,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  warning?: string;
  reasons?: string[];
}) {
  const [reason, setReason] = useState(reasons[0]);
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Отменить заказ?"
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="lg" onClick={onClose}>
            Не отменять
          </Button>
          <Button variant="danger" size="lg" onClick={() => onConfirm(reason)}>
            Отменить
          </Button>
        </div>
      }
    >
      {warning && <div className="mb-3 rounded-2xl bg-sun-50 p-3 text-sm font-semibold text-sun-600">{warning}</div>}
      <div className="label">Причина</div>
      <div className="space-y-2">
        {reasons.map((r) => (
          <button
            key={r}
            onClick={() => setReason(r)}
            className={cn("flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[15px] font-semibold", reason === r ? "border-aqua-500 bg-aqua-50" : "border-ink-200")}
          >
            <span className={cn("h-5 w-5 rounded-full border-2", reason === r ? "border-[6px] border-aqua-500" : "border-ink-300")} />
            {r}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
