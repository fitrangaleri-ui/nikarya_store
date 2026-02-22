"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "price-asc", label: "Harga: Termurah" },
  { value: "price-desc", label: "Harga: Termahal" },
  { value: "name-asc", label: "Nama: A–Z" },
];

export function MobileSortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.get("sort") || "newest";

  const onChange = (value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value === "newest") params.delete("sort");
    else params.set("sort", value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="md:hidden flex items-center justify-between mb-4 px-1">
      <div className="flex items-center gap-1.5">
        <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/70" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Urutkan
        </span>
      </div>

      <div className="relative">
        <Select value={current} onValueChange={onChange}>
          <SelectTrigger
            className="w-[150px] h-9 text-xs font-bold text-foreground border-border/50 rounded-full bg-card/60 backdrop-blur-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm hover:bg-muted/40 outline-none"
            aria-label="Urutkan Produk"
          >
            <SelectValue placeholder="Pilih Urutan" />
          </SelectTrigger>
          <SelectContent
            className="rounded-xl border-border/50 bg-background/95 backdrop-blur-xl shadow-lg animate-in fade-in zoom-in-95"
            position="popper"
          >
            {OPTIONS.map((o) => (
              <SelectItem
                key={o.value}
                value={o.value}
                className="text-xs font-medium cursor-pointer rounded-lg hover:bg-primary/10 focus:bg-primary/10 hover:text-primary focus:text-primary transition-colors my-0.5"
              >
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
