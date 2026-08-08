"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Typography } from "@/components/ui/typography";
import { Download, MessageCircle, Copy, Check, QrCode, Wallet } from "lucide-react";

interface ModalPaymentProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = "qris" | "shopeepay" | "dana";

export function ModalPayment({ isOpen, onClose }: ModalPaymentProps) {
  const [activeTab, setActiveTab] = useState<PaymentMethod>("qris");
  const [copied, setCopied] = useState(false);
  const shopeePayNumber = "085155201380";
  const danaNumber = "083805560918";

  const waLink = "https://wa.me/6285175070016?text=Halo%20Admin%20Nikarya%20Store%2C%20saya%20ingin%20melakukan%20konfirmasi%20pembayaran%20untuk%20pembelian%20produk%20Envelope%20Series.";

  const handleCopyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        showCloseButton={false}
        className="!w-[calc(100vw-2rem)] !max-w-[calc(100vw-2rem)] p-4 overflow-hidden rounded-2xl border border-border/50 bg-card sm:!w-full sm:!max-w-md sm:p-6"
      >
        <DialogTitle className="sr-only">Metode Pembayaran</DialogTitle>
        <div className="relative -mx-4 -mt-4 mb-3 w-[calc(100%+2rem)] rounded-t-2xl bg-gradient-to-br from-[#01696f] to-[#0c4e54] px-6 py-5 text-white sm:-mx-6 sm:-mt-6 sm:w-[calc(100%+3rem)] sm:px-6">
          <div className="flex w-full flex-col items-center text-center leading-tight pr-12 sm:pr-14">
            <Typography variant="h4" as="h2" className="w-full text-center text-xl font-bold text-white uppercase">
              Metode Pembayaran
            </Typography>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup popup pembayaran"
            className="absolute right-4 top-1/2 flex h-8 w-8 shrink-0 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95 sm:right-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <Typography className="mb-3 text-center text-xs leading-normal text-muted-foreground sm:mb-4">
          Pilih metode pembayaran yang paling memudahkan Anda untuk bertransaksi.
        </Typography>

        {/* Tab Selector */}
        <div className="mt-0 flex gap-1 rounded-xl bg-muted p-1">
          <button
            onClick={() => setActiveTab("qris")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all duration-300 ${activeTab === "qris"
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <QrCode className="size-4" />
            QRIS
          </button>
          <button
            onClick={() => setActiveTab("shopeepay")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all duration-300 ${activeTab === "shopeepay"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Wallet className="size-4" />
            ShopeePay
          </button>
          <button
            onClick={() => setActiveTab("dana")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all duration-300 ${activeTab === "dana"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Wallet className="size-4" />
            DANA
          </button>
        </div>

        {/* Content Tabs */}
        <div className="flex min-h-[280px] flex-col items-center justify-center py-4">
          {activeTab === "qris" && (
            <div className="flex w-full flex-col items-center space-y-3 animate-in fade-in duration-300">
              <div className="relative flex h-[210px] w-[210px] items-center justify-center rounded-xl border border-border/30 bg-white p-4 sm:h-[220px] sm:w-[220px]">
                <Image
                  src="/banks/my-qris.jpg"
                  alt="QRIS Code"
                  width={188}
                  height={188}
                  priority
                  className="object-contain"
                />
              </div>
              <Typography variant="body-xs" color="muted" className="px-2 text-center text-[12px] leading-relaxed">
                Scan kode QR di atas menggunakan aplikasi M-Banking atau E-Wallet pilihan Anda.
              </Typography>
            </div>
          )}

          {activeTab === "shopeepay" && (
            <div className="flex w-full flex-col items-center space-y-5 animate-in fade-in duration-300">
              <div className="relative w-44 h-16 flex items-center justify-center">
                <Image
                  src="/banks/shopeepay.png"
                  alt="ShopeePay Logo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              <div className="w-full rounded-xl border border-border/30 bg-muted/40 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-semibold">Nomor E-Wallet:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-mono font-bold text-foreground">{shopeePayNumber}</span>
                    <button
                      onClick={() => handleCopyNumber(shopeePayNumber)}
                      className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
                      title="Salin Nomor"
                    >
                      {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-border/40 pt-3">
                  <span className="text-xs text-muted-foreground font-semibold">Atas Nama:</span>
                  <span className="text-sm font-bold text-foreground">Ahmad Fitran Randika</span>
                </div>
              </div>

              <Typography variant="body-xs" color="muted" className="px-2 text-center text-[12px] leading-relaxed">
                Silakan lakukan transfer ke nomor ShopeePay di atas sebesar nominal pesanan Anda.
              </Typography>
            </div>
          )}

          {activeTab === "dana" && (
            <div className="flex w-full flex-col items-center space-y-5 animate-in fade-in duration-300">
              <div className="relative w-36 h-16 flex items-center justify-center">
                <Image
                  src="/banks/dana.png"
                  alt="DANA Logo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              <div className="w-full rounded-xl border border-border/30 bg-muted/40 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-semibold">Nomor E-Wallet:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-mono font-bold text-foreground">{danaNumber}</span>
                    <button
                      onClick={() => handleCopyNumber(danaNumber)}
                      className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
                      title="Salin Nomor"
                    >
                      {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-border/40 pt-3">
                  <span className="text-xs text-muted-foreground font-semibold">Atas Nama:</span>
                  <span className="text-sm font-bold text-foreground">Ahmad Fitran Randika</span>
                </div>
              </div>

              <Typography variant="body-xs" color="muted" className="px-2 text-center text-[12px] leading-relaxed">
                Silakan lakukan transfer ke nomor DANA di atas sebesar nominal pesanan Anda.
              </Typography>
            </div>
          )}
        </div>

        {/* Footer info & WA link */}
        <div className="space-y-4 border-t border-border/50 pt-4">
          <Typography variant="body-xs" color="muted" className="px-2 text-center text-[12px] leading-relaxed">
            Setelah transfer berhasil, simpan bukti pembayaran dan klik tombol di bawah untuk konfirmasi ke WhatsApp admin.
          </Typography>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-2">
            {activeTab === "qris" && (
              <a
                href="/banks/my-qris.jpg"
                download="qris-nikaryastore.jpg"
                className="w-full sm:flex-1"
              >
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-full flex items-center justify-center gap-2 hover:bg-muted"
                >
                  <Download className="size-4" />
                  Download QR
                </Button>
              </a>
            )}

            <Button
              variant="brand"
              className="w-full sm:flex-1 h-11 rounded-full bg-[#128c7e] hover:bg-[#0e6e63] text-white border-none flex items-center justify-center gap-2"
              asChild
            >
              <Link href={waLink} target="_blank" rel="noopener noreferrer">
                <img src="/icon/whatsapp.svg" alt="WhatsApp" className="size-4 shrink-0 brightness-0 invert" />
                Konfirmasi via WhatsApp
              </Link>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
