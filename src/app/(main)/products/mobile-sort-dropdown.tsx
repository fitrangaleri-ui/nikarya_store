"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

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
    <div className="md:hidden flex items-center justify-end gap-2 mb-4">
      <ArrowUpDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm font-medium text-foreground border border-border rounded-none px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
