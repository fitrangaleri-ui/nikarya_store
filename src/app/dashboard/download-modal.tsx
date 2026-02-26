// ============================================================
// FILE: src/app/dashboard/download-modal.tsx
// PERUBAHAN: Ganti <button> native di footer → <PrimaryButton>
//            Logika, state, dan handler tidak diubah
// ============================================================
"use client";

import {
  X,
  Download,
  ExternalLink,
  ShieldCheck,
  Copy,
  Package,
  Hash,
  CalendarDays,
  AlertOctagon,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { PrimaryButton } from "@/components/ui/primary-button";

const MAX_DOWNLOADS = 25;

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  downloadCount: number;
  productTitle: string;
  orderDate: string;
  orderDisplayId: string;
}

export function DownloadModal({
  isOpen,
  onClose,
  orderId,
  downloadCount: initialCount,
  productTitle,
  orderDate,
  orderDisplayId,
}: DownloadModalProps) {
  // ── State — tidak diubah ─────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const remaining = MAX_DOWNLOADS - count;
  const isMaxed = count >= MAX_DOWNLOADS;
  const progress = (count / MAX_DOWNLOADS) * 100;

  // ── Effects — tidak diubah ───────────────────────────────
  useEffect(() => {
    setCount(initialCount);
    setError(null);
    setSuccess(false);
  }, [initialCount, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const enterFrame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(enterFrame);
    } else {
      setVisible(false);
      const exitTimer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(exitTimer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // ── Handler — tidak diubah ───────────────────────────────
  const handleOpenFile = useCallback(async () => {
    if (isMaxed || loading) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/download/${orderId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mengakses file.");
        if (data.download_count !== undefined) setCount(data.download_count);
        return;
      }
      if (data.url) {
        window.open(data.url, "_blank");
        setCount(data.download_count);
        setSuccess(true);
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [orderId, isMaxed, loading]);

  if (!mounted) return null;

  const formattedDate = new Date(orderDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const progressColor = isMaxed
    ? "bg-red-500"
    : remaining <= 5
      ? "bg-amber-500"
      : "bg-primary";
  const quotaColor = isMaxed
    ? "text-red-500"
    : remaining <= 5
      ? "text-amber-500"
      : "text-emerald-600";
  const quotaLabel = isMaxed
    ? "Kuota habis"
    : remaining <= 5
      ? "Hampir habis"
      : "Tersedia";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        style={{
          transition: "opacity 300ms ease",
          opacity: visible ? 1 : 0,
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative pointer-events-auto w-full max-w-md rounded-3xl overflow-hidden bg-background/95 backdrop-blur-2xl border border-border/50 shadow-2xl shadow-black/20"
          role="dialog"
          aria-label="Download File"
          onClick={(e) => e.stopPropagation()}
          style={{
            transition:
              "opacity 300ms ease, transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            opacity: visible ? 1 : 0,
            transform: visible
              ? "scale(1) translateY(0px)"
              : "scale(0.95) translateY(12px)",
          }}
        >
          {/* ── Header Banner ── */}
          <div className="relative bg-primary px-6 pt-6 pb-5 overflow-hidden">
            <div
              aria-hidden
              className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none blur-[60px]"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />
            <div
              aria-hidden
              className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full pointer-events-none blur-[50px]"
              style={{ background: "rgba(255,255,255,0.05)" }}
            />
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            />

            <div className="relative z-10 flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white/15 text-primary-foreground text-[10px] font-bold uppercase tracking-widest mb-2">
                  <Download className="w-3 h-3" />
                  Akses File
                </span>
                <h2 className="text-xl font-extrabold text-primary-foreground leading-tight tracking-tight">
                  Unduh Produk
                </h2>
                <p className="mt-0.5 text-xs text-primary-foreground/70">
                  File digital siap diakses
                </p>
              </div>

              <button
                onClick={onClose}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-primary-foreground/80 hover:text-primary-foreground transition-all active:scale-95 border border-white/20"
                aria-label="Tutup"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="px-6 py-5 space-y-4">
            {/* Info produk */}
            <div className="rounded-2xl bg-muted/30 border border-border/40 overflow-hidden">
              <div className="flex items-start gap-3 px-4 py-3 border-b border-border/40">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Package className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Produk
                  </p>
                  <p className="text-sm font-bold text-foreground line-clamp-2 mt-0.5">
                    {productTitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-border/40">
                <div className="flex items-start gap-2 px-4 py-3">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Order ID
                    </p>
                    <p className="text-xs font-mono text-foreground mt-0.5">
                      #{orderDisplayId.substring(0, 12)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 px-4 py-3">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Tanggal Beli
                    </p>
                    <p className="text-xs text-foreground mt-0.5">
                      {formattedDate}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/5 border-t border-emerald-500/10">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="text-xs font-semibold text-emerald-600">
                  Pembayaran Lunas
                </span>
              </div>
            </div>

            {/* Kuota download */}
            <div className="rounded-2xl bg-muted/20 border border-border/40 px-4 py-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">
                  Kuota Download
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isMaxed
                        ? "bg-red-500/10 border-red-500/20 text-red-500"
                        : remaining <= 5
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                    }`}
                  >
                    {quotaLabel}
                  </span>
                  <span className="font-bold text-muted-foreground">
                    <span className={`font-extrabold ${quotaColor}`}>
                      {count}
                    </span>{" "}
                    / {MAX_DOWNLOADS}
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground text-center">
                {isMaxed
                  ? "Kuota download habis."
                  : `Sisa ${remaining} download tersedia`}
              </p>
            </div>

            {/* Instruksi */}
            {!isMaxed && (
              <div className="rounded-2xl bg-primary/5 border border-primary/10 px-4 py-3 space-y-1.5">
                <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Download className="h-3 w-3" />
                  File Anda sudah siap.
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
                  <Copy className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground/60" />
                  Silakan buat salinan (copy) file sebelum mengedit agar file
                  asli tetap tersimpan.
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-2xl bg-red-500/5 border border-red-500/20 px-4 py-3 flex items-start gap-2">
                <AlertOctagon className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-3 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-700">
                  File berhasil dibuka di tab baru.
                </p>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════════ */}
          {/* FOOTER — pakai PrimaryButton                    */}
          {/* ════════════════════════════════════════════════ */}
          <div className="px-6 pb-6 pt-2">
            {isMaxed ? (
              <PrimaryButton variant="disabled-outline" size="lg">
                <AlertOctagon className="h-4 w-4" />
                Limit Tercapai ({MAX_DOWNLOADS}/{MAX_DOWNLOADS})
              </PrimaryButton>
            ) : (
              <PrimaryButton
                size="lg"
                loading={loading}
                onClick={handleOpenFile}
                disabled={isMaxed}
              >
                <ExternalLink className="h-4 w-4" />
                Buka File
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
