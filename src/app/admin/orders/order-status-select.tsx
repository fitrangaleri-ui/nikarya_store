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

// Kita simpan pewarnaan spesifik setiap status agar saat dropdown dibuka terlihat cantik
const statusOptions = [
  {
    value: "PENDING",
    label: "Pending",
    className: "text-amber-600 font-bold hover:bg-amber-50 focus:bg-amber-50",
  },
  {
    value: "PENDING_MANUAL",
    label: "Pending Manual",
    className: "text-amber-600 font-bold hover:bg-amber-50 focus:bg-amber-50",
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

// Helper untuk mewarnai kapsul Trigger (tombol utama) berdasarkan status saat ini
const getTriggerColor = (status: string) => {
  switch (status) {
    case "PENDING":
    case "PENDING_MANUAL":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 focus:ring-amber-500";
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
        className={`w-[120px] sm:w-[130px] h-9 rounded-full border px-3 text-xs font-bold tracking-wide outline-none transition-all shadow-sm ${getTriggerColor(currentStatus)} ${isPending ? "opacity-60 cursor-not-allowed animate-pulse" : "hover:brightness-110 cursor-pointer"}`}
      >
        <SelectValue />
      </SelectTrigger>

      <SelectContent
        className="rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-lg animate-in fade-in zoom-in-95"
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
