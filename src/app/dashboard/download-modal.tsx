"use client";

import { Button } from "@/components/ui/button";
import {
    X,
    Download,
    Loader2,
    ExternalLink,
    ShieldCheck,
    Copy,
    Package,
    Hash,
    CalendarDays,
    AlertOctagon,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

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
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(initialCount);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const remaining = MAX_DOWNLOADS - count;
    const isMaxed = count >= MAX_DOWNLOADS;
    const progress = (count / MAX_DOWNLOADS) * 100;

    // Sync when props change
    useEffect(() => {
        setCount(initialCount);
        setError(null);
        setSuccess(false);
    }, [initialCount, isOpen]);

    // Close on Escape
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
                if (data.download_count !== undefined) {
                    setCount(data.download_count);
                }
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

    if (!isOpen) return null;

    const formattedDate = new Date(orderDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="pointer-events-auto w-full max-w-md bg-background/95 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                    role="dialog"
                    aria-label="Download File"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Glow accent */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/8 blur-[60px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />

                    {/* Header */}
                    <div className="relative flex items-center justify-between px-6 pt-6 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Download className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground tracking-tight">
                                    Akses File
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    File digital Anda
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95"
                            aria-label="Tutup"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 pb-2 space-y-4">
                        {/* Product Info */}
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                            <div className="flex items-start gap-3">
                                <Package className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                                        Produk
                                    </p>
                                    <p className="text-sm font-semibold text-foreground line-clamp-2 mt-0.5">
                                        {productTitle}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-start gap-2">
                                    <Hash className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                            Order ID
                                        </p>
                                        <p className="text-xs font-mono text-foreground mt-0.5">
                                            #{orderDisplayId.substring(0, 12)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                            Tanggal Beli
                                        </p>
                                        <p className="text-xs text-foreground mt-0.5">
                                            {formattedDate}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                                <span className="text-xs text-emerald-600 font-medium">
                                    Pembayaran Lunas
                                </span>
                            </div>
                        </div>

                        {/* Download Counter */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">
                                    Kuota Download
                                </span>
                                <span
                                    className={`font-bold ${isMaxed
                                            ? "text-red-500"
                                            : remaining <= 5
                                                ? "text-amber-500"
                                                : "text-foreground"
                                        }`}
                                >
                                    {count} / {MAX_DOWNLOADS}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="h-2 bg-muted/50 rounded-full overflow-hidden border border-border/30">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ease-out ${isMaxed
                                            ? "bg-red-500"
                                            : remaining <= 5
                                                ? "bg-amber-500"
                                                : "bg-primary"
                                        }`}
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                            </div>

                            <p className="text-xs text-muted-foreground text-center">
                                {isMaxed
                                    ? "Kuota download habis."
                                    : `Sisa ${remaining} download tersedia`}
                            </p>
                        </div>

                        {/* Instructions */}
                        {!isMaxed && (
                            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-1.5">
                                <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                                    <Download className="h-3 w-3" />
                                    File Anda sudah siap.
                                </p>
                                <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
                                    <Copy className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground/60" />
                                    Silakan buat salinan (copy) file sebelum mengedit agar file
                                    asli tetap tersimpan.
                                </p>
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 flex items-start gap-2">
                                <AlertOctagon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}

                        {/* Success message */}
                        {success && (
                            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 flex items-start gap-2">
                                <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                File berhasil dibuka di tab baru.
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6 pt-4">
                        {isMaxed ? (
                            <Button
                                disabled
                                size="lg"
                                className="w-full h-12 rounded-xl bg-muted text-muted-foreground cursor-not-allowed"
                            >
                                <AlertOctagon className="mr-2 h-4 w-4" />
                                Limit Tercapai ({MAX_DOWNLOADS}/{MAX_DOWNLOADS})
                            </Button>
                        ) : (
                            <Button
                                onClick={handleOpenFile}
                                disabled={loading}
                                size="lg"
                                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Buka File
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
