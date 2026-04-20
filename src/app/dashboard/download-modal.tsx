// ============================================================
// FILE: src/app/dashboard/download-modal.tsx
// PERUBAHAN: Ganti <button> native di footer → <PrimaryButton>
//            Logika, state, dan handler tidak diubah
// ============================================================
"use client";

import {
  XMarkIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  DocumentDuplicateIcon,
  CubeIcon,
  HashtagIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

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
    ? "bg-destructive"
    : remaining <= 5
      ? "bg-warning"
      : "bg-primary";

  const statusColorToken = isMaxed
    ? "destructive"
    : remaining <= 5
      ? "warning"
      : "success";

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
          className="relative pointer-events-auto w-full max-w-md rounded-xl bg-background overflow-hidden border border-border shadow-2xl shadow-black/20"
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
          <div className="relative bg-gradient-to-br from-primary to-secondary-foreground px-6 pt-7 pb-6 overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute bottom-[-15px] left-[15%] h-24 w-24 rounded-full bg-white/5 pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between gap-3">
              <div>
                <Typography variant="h4" as="h2" className="text-primary-foreground leading-none font-bold">
                  Unduh Produk Digital
                </Typography>
                <Typography variant="body-xs" className="text-primary-foreground/70 mt-1 font-medium italic">
                  File siap diakses di server yang aman
                </Typography>
              </div>

              <button
                onClick={onClose}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all active:scale-95 border border-white/10 outline-none"
                aria-label="Tutup"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="px-6 py-5 space-y-4">
            {/* Info produk */}
            <div className="rounded-xl bg-muted/40 border border-border/60 overflow-hidden">
              <div className="flex items-start gap-3 px-4 py-3 border-b border-border/60">
                <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 mt-0.5 border border-primary/10">
                  <CubeIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <Typography variant="caption" color="muted" className="font-extrabold uppercase  text-[10px]">
                    Produk Digital
                  </Typography>
                  <Typography variant="body-sm" className="font-bold line-clamp-2 mt-0.5 leading-tight">
                    {productTitle}
                  </Typography>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-border/60">
                <div className="flex items-start gap-2.5 px-4 py-3">
                  <HashtagIcon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <Typography variant="caption" color="muted" className="font-extrabold uppercase  text-[10px]">
                      Order ID
                    </Typography>
                    <Typography variant="body-xs" className="font-mono mt-0.5 truncate">
                      #{orderDisplayId.substring(0, 12)}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 px-4 py-3">
                  <CalendarDaysIcon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <Typography variant="caption" color="muted" className="font-extrabold uppercase  text-[10px]">
                      Tanggal Beli
                    </Typography>
                    <Typography variant="body-xs" className="mt-0.5 font-medium truncate">
                      {formattedDate}
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 bg-success/5 border-t border-border/60">
                <ShieldCheckIcon className="h-3.5 w-3.5 text-success shrink-0" />
                <Typography variant="caption" color="success" className="font-bold">
                  Pembayaran Terverifikasi
                </Typography>
              </div>
            </div>

            {/* Kuota download */}
            <div className="rounded-xl bg-muted/20 border border-border/60 px-4 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <Typography variant="body-xs" color="muted" className="font-extrabold uppercase ">
                  Kuota Unduhan
                </Typography>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Typography variant="body-sm" color="muted" className="font-bold">
                      <Typography as="span" variant="body-sm" color={statusColorToken as any} className="font-black">
                        {count}
                      </Typography>{" "}
                      / {MAX_DOWNLOADS}
                    </Typography>
                  </div>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden border border-border/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <Typography variant="caption" color="muted" className="font-medium italic">
                  {isMaxed
                    ? "Limit tercapai"
                    : `Tersisa ${remaining} kali unduh`}
                </Typography>
                <div className={`px-2 py-0.5 rounded-full border bg-background/50 border-border/50`}>
                  <Typography variant="caption" color={statusColorToken as any} className="font-extrabold uppercase text-[9px]">
                    {quotaLabel}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Instruksi */}
            {!isMaxed && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center border border-primary/10">
                    <ArrowDownTrayIcon className="h-3 w-3 text-primary" />
                  </div>
                  <Typography variant="body-xs" color="primary" className="font-bold">
                    File Anda Sudah Siap
                  </Typography>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <DocumentDuplicateIcon className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground/60" />
                  <Typography variant="caption" color="muted" className="leading-relaxed font-medium">
                    Silakan buat salinan (copy) file sebelum mengedit agar file asli tetap tersimpan dengan aman di google drive Anda.
                  </Typography>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-destructive/5 border border-destructive/30 px-4 py-3 flex items-start gap-2.5 animate-in fade-in zoom-in-95">
                <ExclamationTriangleIcon className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <Typography variant="body-sm" color="destructive" className="font-medium">
                  {error}
                </Typography>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-xl bg-success/5 border border-success/30 px-4 py-3 flex items-start gap-2.5 animate-in fade-in zoom-in-95">
                <ShieldCheckIcon className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <Typography variant="body-sm" color="success" className="font-medium">
                  File berhasil dibuka di tab baru.
                </Typography>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════════ */}
          {/* FOOTER — pakai PrimaryButton                    */}
          {/* ════════════════════════════════════════════════ */}
          <div className="px-6 pb-6 pt-2">
            {isMaxed ? (
              <Button
                variant="outline"
                size="lg"
                disabled
                className="w-full rounded-full bg-muted border-border/40 hover:bg-muted text-muted-foreground opacity-80"
              >
                <ExclamationTriangleIcon className="h-4 w-4" />
                Limit Tercapai ({MAX_DOWNLOADS}/{MAX_DOWNLOADS})
              </Button>
            ) : (
              <Button
                variant="brand"
                size="lg"
                className="w-full rounded-full"
                onClick={handleOpenFile}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    Akses File Digital
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
