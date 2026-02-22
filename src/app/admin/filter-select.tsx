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
          "w-full h-11 rounded-none border-border bg-background px-4 py-2 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer",
          className,
        )}
      >
        <SelectValue placeholder={`Pilih ${name}`} />
      </SelectTrigger>

      <SelectContent className="rounded-none border-border">
        {options.map((opt) => (
          <SelectItem
            key={opt.value || "all"}
            value={opt.value || "all"}
            className="rounded-none"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
