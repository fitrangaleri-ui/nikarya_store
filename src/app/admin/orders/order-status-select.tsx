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

const statusOptions = [
  { value: "PENDING", label: "Pending", className: "text-amber-600 font-bold" },
  { value: "PAID", label: "Dibayar", className: "text-primary font-bold" },
  { value: "FAILED", label: "Gagal", className: "text-destructive font-bold" },
];

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
        className={`w-[120px] sm:w-[130px] h-9 rounded-none border-border bg-background text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:border-primary transition-colors ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-none border-border">
        {statusOptions.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className={`rounded-none text-xs ${opt.className}`}
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
