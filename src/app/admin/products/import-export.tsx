"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import { importProducts, exportProducts } from "./import-export-actions";
import * as XLSX from "xlsx";

type ParsedRow = Record<string, string>;

const EXPECTED_HEADERS = [
  "title",
  "description",
  "price",
  "category",
  "product_code",
  "sku",
  "badge",
  "tags",
  "original_price",
  "discount_percent",
  "discount_price",
  "thumbnail_url",
  "drive_file_url",
  "demo_link",
  "is_active",
];

// ─── CSV Parser ─────────────────────────────────────────────────────────────

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map((line) => {
    const values = line
      .split(",")
      .map((v) => v.trim().replace(/^["']|["']$/g, ""));
    const row: ParsedRow = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || "";
    });
    return row;
  });
}

// ─── XLSX Parser ────────────────────────────────────────────────────────────

function parseXLSX(buffer: ArrayBuffer): ParsedRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<ParsedRow>(sheet, { defval: "" });
  return json.map((row) => {
    const normalized: ParsedRow = {};
    Object.keys(row).forEach((key) => {
      normalized[key.trim().toLowerCase().replace(/\s+/g, "_")] = String(
        row[key],
      );
    });
    return normalized;
  });
}

// ─── Import Section ─────────────────────────────────────────────────────────

function ImportDialog() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    count?: number;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);
    setFileName(file.name);

    try {
      if (file.name.endsWith(".csv")) {
        const text = await file.text();
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setError("File CSV kosong atau format tidak valid.");
          return;
        }
        setRows(parsed);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const buffer = await file.arrayBuffer();
        const parsed = parseXLSX(buffer);
        if (parsed.length === 0) {
          setError("File Excel kosong atau format tidak valid.");
          return;
        }
        setRows(parsed);
      } else {
        setError("Format file tidak didukung. Gunakan CSV atau XLSX.");
      }
    } catch {
      setError("Gagal membaca file. Pastikan format benar.");
    }
  };

  const handleImport = () => {
    setError(null);
    setResult(null);

    // Validate required field
    const missingTitle = rows.some((r) => !r.title?.trim());
    if (missingTitle) {
      setError('Kolom "title" wajib diisi untuk semua baris.');
      return;
    }

    startTransition(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await importProducts(rows as any);
      if (res && "error" in res) {
        setError(res.error as string);
      } else {
        setResult({ success: true, count: res.count });
        setRows([]);
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  };

  const resetForm = () => {
    setRows([]);
    setFileName("");
    setError(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-11 rounded-2xl border-border/50 bg-background/50 text-muted-foreground font-bold hover:text-primary hover:bg-primary/10 shadow-sm transition-all"
        >
          <Upload className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Import</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border/40 bg-card/95 backdrop-blur-xl rounded-3xl shadow-lg sm:max-w-3xl max-h-[85vh] overflow-y-auto p-6 custom-scrollbar">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-black text-foreground flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Import Produk
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {error && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm font-semibold text-destructive flex items-center gap-2.5 animate-in fade-in zoom-in-95">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {result?.success && (
            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-3.5 text-sm font-bold text-green-600 flex items-center gap-2.5 animate-in fade-in zoom-in-95">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              Berhasil mengimpor {result.count} produk!
            </div>
          )}

          {/* Upload Area */}
          {rows.length === 0 && !result?.success && (
            <div className="space-y-4">
              <label
                htmlFor="import-file"
                className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border/50 bg-background/30 p-10 cursor-pointer transition-colors hover:bg-muted/50 hover:border-primary/50"
              >
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-foreground">
                    Pilih file CSV atau XLSX
                  </p>
                  <p className="text-xs font-medium text-muted-foreground mt-1.5">
                    Kolom wajib:{" "}
                    <span className="font-bold text-foreground">
                      title, price
                    </span>
                  </p>
                </div>
              </label>
              <input
                ref={fileInputRef}
                id="import-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFile}
                className="hidden"
              />

              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground">
                <p className="font-bold mb-1.5 text-primary">
                  Kolom yang didukung:
                </p>
                <p className="font-mono text-[10px] sm:text-[11px] font-medium leading-relaxed opacity-80">
                  {EXPECTED_HEADERS.join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {rows.length > 0 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground truncate max-w-[150px] sm:max-w-xs">
                    {fileName}
                  </span>
                  <Badge className="bg-primary/10 text-primary border border-primary/20 shadow-none font-bold rounded-full">
                    {rows.length} baris
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  className="text-muted-foreground font-semibold hover:text-foreground rounded-xl"
                >
                  Ganti File
                </Button>
              </div>

              <div className="overflow-auto max-h-[300px] rounded-2xl border border-border/40 bg-card custom-scrollbar">
                <Table>
                  <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm shadow-sm z-10">
                    <TableRow className="border-border/40 hover:bg-transparent">
                      <TableHead className="text-[11px] font-bold text-muted-foreground py-3 pl-4">
                        #
                      </TableHead>
                      <TableHead className="text-[11px] font-bold text-muted-foreground py-3">
                        Title
                      </TableHead>
                      <TableHead className="text-[11px] font-bold text-muted-foreground py-3">
                        Price
                      </TableHead>
                      <TableHead className="text-[11px] font-bold text-muted-foreground py-3">
                        Category
                      </TableHead>
                      <TableHead className="text-[11px] font-bold text-muted-foreground py-3">
                        Code
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 20).map((row, i) => (
                      <TableRow
                        key={i}
                        className="hover:bg-muted/30 border-border/40 transition-colors"
                      >
                        <TableCell className="text-xs font-medium text-muted-foreground py-2.5 pl-4">
                          {i + 1}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-foreground max-w-[200px] truncate py-2.5">
                          {row.title || "—"}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-muted-foreground py-2.5">
                          {row.price || "—"}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-muted-foreground py-2.5">
                          {row.category || "—"}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-muted-foreground py-2.5">
                          {row.product_code || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {rows.length > 20 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-xs font-semibold text-muted-foreground/60 py-4 hover:bg-transparent"
                        >
                          ... dan {rows.length - 20} baris lainnya
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <Button
                onClick={handleImport}
                className="w-full h-11 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-sm active:scale-[0.98] transition-all"
                disabled={isPending}
              >
                {isPending
                  ? "Mengimpor..."
                  : `Import ${rows.length} Produk Sekarang`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Export Handler ──────────────────────────────────────────────────────────

function ExportDropdown() {
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleExport = (format: "csv" | "xlsx") => {
    setMenuOpen(false);

    startTransition(async () => {
      const res = await exportProducts();
      if (res && "error" in res) {
        alert(res.error);
        return;
      }

      const data = res.data;
      if (!data || data.length === 0) {
        alert("Tidak ada produk untuk diekspor.");
        return;
      }

      if (format === "csv") {
        const headers = Object.keys(data[0]);
        const csvLines = [
          headers.join(","),
          ...data.map((row) =>
            headers
              .map((h) => {
                const val = String(row[h as keyof typeof row] ?? "");
                return val.includes(",") ? `"${val}"` : val;
              })
              .join(","),
          ),
        ];
        const csvText = csvLines.join("\n");
        downloadFile(csvText, "products.csv", "text/csv");
      } else {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Products");
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        downloadFile(
          new Blob([wbout]),
          "products.xlsx",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
      }
    });
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="h-11 rounded-2xl border-border/50 bg-background/50 text-muted-foreground font-bold hover:text-primary hover:bg-primary/10 shadow-sm transition-all"
        onClick={() => setMenuOpen(!menuOpen)}
        disabled={isPending}
      >
        <Download className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">
          {isPending ? "Mengekspor..." : "Export"}
        </span>
      </Button>
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-44 rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-lg p-1.5 animate-in fade-in slide-in-from-top-2">
            <button
              onClick={() => handleExport("csv")}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <FileText className="h-4 w-4 text-emerald-500" />
              CSV (.csv)
            </button>
            <button
              onClick={() => handleExport("xlsx")}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              Excel (.xlsx)
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Download Helper ────────────────────────────────────────────────────────

function downloadFile(
  content: string | Blob,
  filename: string,
  mimeType: string,
) {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Main Export ────────────────────────────────────────────────────────────

export function ImportExportSection() {
  return (
    <div className="flex items-center gap-2.5">
      <ImportDialog />
      <ExportDropdown />
    </div>
  );
}
