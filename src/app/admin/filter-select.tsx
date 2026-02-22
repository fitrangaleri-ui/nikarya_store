"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FilterSelectProps = {
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
  className?: string;
};

export function FilterSelect({
  name,
  defaultValue,
  options,
  className,
}: FilterSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Menangani perubahan nilai pada komponen Select shadcn
  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // Anggap value "all" adalah representasi string kosong dari opsi "Semua Status/Kategori"
    if (value && value !== "all") {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    router.push(`?${params.toString()}`);
  };

  // Nilai default shadcn Select tidak bisa string kosong, kita ganti "all" untuk opsi default
  const resolvedValue = defaultValue || "all";

  return (
    <Select value={resolvedValue} onValueChange={handleValueChange}>
      <SelectTrigger
        className={cn(
          "w-full h-11 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm hover:bg-muted/40 transition-all cursor-pointer",
          className,
        )}
      >
        <SelectValue placeholder={`Pilih ${name}`} />
      </SelectTrigger>

      <SelectContent
        className="rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-lg animate-in fade-in zoom-in-95"
        position="popper"
      >
        <div className="p-1">
          {options.map((opt) => (
            <SelectItem
              key={opt.value || "all"}
              value={opt.value || "all"}
              className="rounded-lg text-sm font-medium cursor-pointer hover:bg-primary/10 focus:bg-primary/10 hover:text-primary focus:text-primary transition-colors my-0.5 px-3 py-2"
            >
              {opt.label}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}
