"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatus } from "./actions";

// Status options using semantic design tokens instead of hardcoded colors
const statusOptions = [
  {
    value: "PENDING",
    label: "Pending",
    className: "text-warning font-bold hover:bg-warning/10 focus:bg-warning/10",
  },
  {
    value: "PENDING_MANUAL",
    label: "Pending Manual",
    className: "text-warning font-bold hover:bg-warning/10 focus:bg-warning/10",
  },
  {
    value: "PAID",
    label: "Dibayar",
    className: "text-primary font-bold hover:bg-primary/10 focus:bg-primary/10",
  },
  {
    value: "FAILED",
    label: "Gagal",
    className:
      "text-destructive font-bold hover:bg-destructive/10 focus:bg-destructive/10",
  },
];

// Helper to style the trigger capsule based on current status — uses semantic tokens
const getTriggerColor = (status: string) => {
  switch (status) {
    case "PENDING":
    case "PENDING_MANUAL":
      return "border-warning/30 bg-warning/10 text-warning focus:ring-warning";
    case "PAID":
      return "border-primary/30 bg-primary/10 text-primary focus:ring-primary";
    case "FAILED":
      return "border-destructive/30 bg-destructive/10 text-destructive focus:ring-destructive";
    default:
      return "border-border/50 bg-background text-foreground focus:ring-primary";
  }
};

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (newStatus: string) => {
    if (newStatus === currentStatus) return;
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result?.error) {
        alert(result.error);
      }
    });
  };

  return (
    <Select
      defaultValue={currentStatus}
      onValueChange={handleChange}
      disabled={isPending}
    >
      <SelectTrigger
        className={`w-[120px] sm:w-[130px] h-9 rounded-full border px-3 text-xs font-bold tracking-wide outline-none transition-all ${getTriggerColor(currentStatus)} ${isPending ? "opacity-60 cursor-not-allowed animate-pulse" : "hover:brightness-110 cursor-pointer"}`}
      >
        <SelectValue />
      </SelectTrigger>

      <SelectContent
        className="rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl animate-in fade-in zoom-in-95"
        position="popper"
      >
        <div className="p-1">
          {statusOptions.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className={`rounded-lg text-xs transition-colors my-0.5 px-3 py-2 cursor-pointer ${opt.className}`}
            >
              {opt.label}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}
