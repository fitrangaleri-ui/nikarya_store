"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Copy, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";

interface ManualMethodInfo {
  id: string;
  type: string;
  provider_name: string;
  account_name: string;
  account_number: string;
  logo_url: string | null;
}

interface InstructionData {
  orderId: string;
  totalAmount: number;
  originalTotal: number;
  discountAmount: number;
  promoCode: string | null;
  paymentStatus: string;
  paymentDeadline: string | null;
  paymentGateway: string | null;
  paymentMethod: string | null;
  paymentType: string | null;
  paymentCode: string | null;
  transactionId: string | null;
  manualMethod: ManualMethodInfo | null;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getMethodLabel(data: InstructionData): string {
  if (data.manualMethod) return data.manualMethod.provider_name;
  const method = data.paymentMethod || data.paymentType || "";
  const labels: Record<string, string> = {
    bca_va: "BCA Virtual Account",
    bni_va: "BNI Virtual Account",
    bri_va: "BRI Virtual Account",
    echannel: "Mandiri Virtual Account",
    qris: "QRIS",
    gopay: "GoPay",
    shopeepay: "ShopeePay",
  };
  return labels[method] || data.paymentType || "Pembayaran";
}

function getMethodIcon(data: InstructionData): string {
  if (data.manualMethod)
    return data.manualMethod.type === "bank_transfer" ? "🏦" : "📱";
  const pt = data.paymentType || "";
  if (pt === "bank_transfer" || pt === "echannel") return "🏦";
  if (pt === "qris") return "📲";
  return "📱";
}

function getHowToPayInstructions(
  data: InstructionData,
): { title: string; steps: string[] }[] {
  const method = data.paymentMethod || "";
  const pt = data.paymentType || "";

  if (data.manualMethod) {
    if (data.manualMethod.type === "bank_transfer") {
      return [
        {
          title: "Cara Transfer Bank",
          steps: [
            `Buka aplikasi mobile banking atau ATM ${data.manualMethod.provider_name}`,
            "Pilih menu Transfer",
            `Masukkan nomor rekening: ${data.manualMethod.account_number}`,
            `Pastikan nama penerima: ${data.manualMethod.account_name}`,
            `Masukkan jumlah transfer sesuai total`,
            "Konfirmasi dan selesaikan transfer",
            "Simpan bukti transfer sebagai referensi",
          ],
        },
      ];
    }
    return [
      {
        title: "Cara Pembayaran E-Wallet",
        steps: [
          `Buka aplikasi ${data.manualMethod.provider_name}`,
          `Transfer ke nomor: ${data.manualMethod.account_number}`,
          `Masukkan jumlah sesuai total`,
          "Konfirmasi pembayaran",
          "Simpan bukti pembayaran",
        ],
      },
    ];
  }

  if (pt === "bank_transfer" || pt === "echannel") {
    const bankName =
      method === "bca_va"
        ? "BCA"
        : method === "bni_va"
          ? "BNI"
          : method === "bri_va"
            ? "BRI"
            : "Mandiri";

    const mobileSteps = [
      `Buka aplikasi ${bankName} Mobile Banking`,
      pt === "echannel"
        ? "Pilih menu Bayar → Multipayment"
        : "Pilih menu Transfer → Virtual Account",
      pt === "echannel"
        ? "Masukkan Biller Code dan Bill Key yang tertera di atas"
        : "Masukkan nomor Virtual Account yang tertera di atas",
      "Periksa kembali detail pembayaran",
      "Masukkan PIN untuk konfirmasi",
      "Pembayaran selesai",
    ];

    const atmSteps = [
      `Masukkan kartu ATM ${bankName} dan PIN Anda`,
      pt === "echannel"
        ? "Pilih menu Bayar/Beli → Multipayment"
        : "Pilih Transfer → Virtual Account",
      pt === "echannel"
        ? "Masukkan Biller Code dan Bill Key"
        : "Masukkan nomor Virtual Account",
      "Konfirmasi detail pembayaran",
      "Simpan struk sebagai bukti",
    ];

    return [
      { title: `Mobile Banking ${bankName}`, steps: mobileSteps },
      { title: `ATM ${bankName}`, steps: atmSteps },
    ];
  }

  if (pt === "qris") {
    return [
      {
        title: "Cara Bayar QRIS",
        steps: [
          "Buka aplikasi e-wallet atau mobile banking yang mendukung QRIS",
          "Pilih menu Scan QR atau QRIS",
          "Scan QR code yang tertera di atas",
          "Periksa detail pembayaran",
          "Konfirmasi pembayaran",
        ],
      },
    ];
  }

  if (pt === "gopay") {
    return [
      {
        title: "Cara Bayar GoPay",
        steps: [
          "Buka aplikasi Gojek atau GoPay",
          "Pilih menu Bayar atau Scan QR",
          "Scan QR code yang tertera di atas",
          "Periksa detail pembayaran",
          "Konfirmasi pembayaran dengan PIN",
        ],
      },
    ];
  }

  if (pt === "shopeepay") {
    return [
      {
        title: "Cara Bayar ShopeePay",
        steps: [
          "Buka aplikasi Shopee",
          "Tap ShopeePay di halaman utama",
          "Gunakan link pembayaran atau scan QR",
          "Periksa detail pembayaran",
          "Konfirmasi pembayaran",
        ],
      },
    ];
  }

  return [
    {
      title: "Petunjuk Pembayaran",
      steps: [
        "Lakukan pembayaran sesuai metode yang dipilih",
        "Pastikan jumlah transfer sesuai",
        "Simpan bukti pembayaran",
      ],
    },
  ];
}

function isVAPayment(data: InstructionData): boolean {
  const pt = data.paymentType || "";
  return pt === "bank_transfer" || pt === "echannel";
}

function isQRPayment(data: InstructionData): boolean {
  const pt = data.paymentType || "";
  return pt === "qris" || pt === "gopay";
}

function PaymentInstructionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  const [data, setData] = useState<InstructionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(
        `/api/payment-instruction?orderId=${encodeURIComponent(orderId)}`,
      );
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
        if (result.paymentDeadline) {
          const deadline = new Date(result.paymentDeadline).getTime();
          setRemainingMs(Math.max(0, deadline - Date.now()));
        }
      }
    } catch {
      setError("Gagal memuat instruksi pembayaran");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) {
      setError("Order ID tidak ditemukan");
      setLoading(false);
      return;
    }
    fetchData();
  }, [orderId, fetchData]);

  useEffect(() => {
    if (!orderId || !data) return;
    if (data.paymentStatus === "PAID" || data.paymentStatus === "EXPIRED") return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/payment-instruction?orderId=${encodeURIComponent(orderId)}`,
        );
        const result = await res.json();
        if (!result.error) {
          setData(result);
          if (result.paymentStatus === "PAID") {
            if (pollRef.current) clearInterval(pollRef.current);
            setTimeout(async () => {
              const supabase = createClient();
              const { data: { user } } = await supabase.auth.getUser();
              if (user && !user.email_confirmed_at) {
                const emailParam = user.email ? `?email=${encodeURIComponent(user.email)}` : "";
                router.push(`/confirm-email${emailParam}`);
              } else if (!user) {
                const guestEmail = result.guestEmail || "";
                const emailParam = guestEmail ? `?email=${encodeURIComponent(guestEmail)}` : "";
                router.push(`/confirm-email${emailParam}`);
              } else {
                router.push("/dashboard");
              }
            }, 2000);
          } else if (result.paymentStatus === "EXPIRED") {
            if (pollRef.current) clearInterval(pollRef.current);
          }
        }
      } catch {
        // silent — will retry on next interval
      }
    }, 4000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [orderId, data?.paymentStatus, router, data]);

  useEffect(() => {
    if (!data?.paymentDeadline) return;
    const interval = setInterval(() => {
      const deadline = new Date(data.paymentDeadline!).getTime();
      const remaining = Math.max(0, deadline - Date.now());
      setRemainingMs(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [data?.paymentDeadline]);

  const isExpired = remainingMs <= 0 && !!data?.paymentDeadline;
  const isPaid = data?.paymentStatus === "PAID";

  const handleCopy = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const instructions = useMemo(() => {
    if (!data) return [];
    return getHowToPayInstructions(data);
  }, [data]);

  // ── Loading skeleton ──
  if (loading) {
    return (
      <main className="mx-auto max-w-lg px-4 py-12">
        <div className="w-full bg-background/95 backdrop-blur-2xl border border-border/50 shadow-2xl shadow-black/20 rounded-3xl overflow-hidden animate-pulse">
          <div className="h-36 bg-primary/20" />
          <div className="p-6 space-y-4">
            <div className="h-20 bg-muted/50 rounded-2xl" />
            <div className="h-16 bg-muted/50 rounded-2xl" />
            <div className="h-28 bg-muted/50 rounded-2xl" />
            <div className="h-32 bg-muted/50 rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  // ── Error state ──
  if (error || !data) {
    return (
      <main className="mx-auto max-w-lg px-4 py-12">
        <div className="w-full bg-background/95 backdrop-blur-2xl border border-border/50 shadow-2xl shadow-black/20 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          {/* Header */}
          <div className="relative bg-primary px-6 pt-6 pb-5 overflow-hidden">
            <div aria-hidden className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none blur-[60px]" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)" }} />
            <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-xl shrink-0">
                ⚠️
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-primary-foreground leading-tight tracking-tight">
                  Terjadi Kesalahan
                </h1>
                <p className="mt-0.5 text-xs text-primary-foreground/70">
                  Data pembayaran tidak dapat dimuat.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 space-y-5">
            <div className="rounded-2xl bg-muted/30 border border-border/40 px-4 py-4 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              </div>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                {error || "Data instruksi pembayaran tidak ditemukan."}
              </p>
            </div>
            <Button onClick={() => router.push("/")} variant="brand" size="lg" className="w-full rounded-full">
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const methodLabel = getMethodLabel(data);
  const methodIcon = getMethodIcon(data);
  const showVA = isVAPayment(data) && data.paymentCode;
  const showQR = isQRPayment(data) && data.paymentCode;
  const isDeeplink = data.paymentType === "shopeepay" && data.paymentCode;

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <div className="w-full bg-background/95 backdrop-blur-2xl border border-border/50 shadow-2xl shadow-black/20 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">

        {/* ── Header Banner ── */}
        <div className="relative bg-primary px-6 pt-6 pb-5 overflow-hidden">
          <div aria-hidden className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none blur-[60px]" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div aria-hidden className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full pointer-events-none blur-[50px]" style={{ background: "rgba(255,255,255,0.05)" }} />
          <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)" }} />
          <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white/15 text-primary-foreground text-[10px] font-bold uppercase tracking-[-0.005em] mb-3">
              💳 Instruksi Pembayaran
            </span>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-2xl shrink-0">
                {methodIcon}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-primary-foreground leading-tight tracking-tight">
                  {methodLabel}
                </h1>
                <p className="mt-0.5 text-xs text-primary-foreground/70">
                  Order #{data.orderId.split("-")[0]}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* ── Paid status ── */}
          {isPaid && (
            <div className="rounded-2xl bg-primary/5 border border-primary/20 px-4 py-4 flex items-start gap-3 animate-in zoom-in-95">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-primary">Pembayaran Dikonfirmasi!</p>
                <p className="text-xs text-primary/70 mt-0.5">
                  Pesanan Anda sedang diproses. Mengalihkan...
                </p>
              </div>
            </div>
          )}

          {/* ── Countdown Timer ── */}
          {!isPaid && data.paymentDeadline && (
            <div className={`rounded-2xl border overflow-hidden ${isExpired ? "border-red-500/20" : "border-border/40"}`}>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isExpired ? "bg-red-500/10" : "bg-primary/10"}`}>
                  {isExpired
                    ? <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    : <Clock className="h-3.5 w-3.5 text-primary" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-bold uppercase tracking-[-0.005em] ${isExpired ? "text-red-500" : "text-muted-foreground"}`}>
                    {isExpired ? "Waktu Habis" : "Selesaikan Sebelum"}
                  </p>
                  {isExpired ? (
                    <p className="text-xs font-medium text-red-500/80 mt-0.5 leading-relaxed">
                      Batas waktu pembayaran telah terlewati. Silakan buat pesanan baru jika masih berminat.
                    </p>
                  ) : (
                    <p className="text-2xl font-mono font-black text-foreground tracking-wider mt-0.5">
                      {formatCountdown(remainingMs)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Transfer Amount ── */}
          {!isExpired && !isPaid && (
            <div className="rounded-2xl bg-muted/30 border border-border/40 overflow-hidden">
              <div className="px-4 pt-3 pb-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[-0.005em] mb-2">
                  Jumlah Tagihan
                </p>
                {data.discountAmount > 0 && (
                  <div className="space-y-1.5 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Subtotal</span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        Rp {data.originalTotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-primary">
                        Diskon {data.promoCode ? `(${data.promoCode})` : ""}
                      </span>
                      <span className="text-xs font-semibold text-primary">
                        -Rp {data.discountAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="h-px bg-border/40" />
                  </div>
                )}
                <div className="flex items-center justify-between py-1">
                  <p className="text-2xl font-black text-primary tracking-tight">
                    Rp {data.totalAmount.toLocaleString("id-ID")}
                  </p>
                  <button
                    onClick={() => handleCopy(String(data.totalAmount), "amount")}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${copiedField === "amount"
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                      }`}
                  >
                    {copiedField === "amount" ? (
                      <><CheckCircle className="h-3.5 w-3.5" /> Tersalin</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" /> Salin</>
                    )}
                  </button>
                </div>
                <p className="text-[10px] font-medium text-muted-foreground pb-3 leading-relaxed">
                  * Pastikan transfer hingga{" "}
                  <strong className="text-foreground">3 digit terakhir</strong>{" "}
                  agar pembayaran terverifikasi otomatis.
                </p>
              </div>
            </div>
          )}

          {/* ── VA Number (Gateway - Bank Transfer) ── */}
          {showVA && !isExpired && !isPaid && (
            <div className="rounded-2xl bg-muted/30 border border-border/40 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[-0.005em]">
                  {data.paymentType === "echannel" ? "Biller Code & Bill Key" : "Nomor Virtual Account"}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <p className="text-xl font-mono font-bold text-foreground tracking-[-0.005em] break-all">
                  {data.paymentCode}
                </p>
                <button
                  onClick={() => handleCopy(data.paymentCode!, "va")}
                  className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all flex-shrink-0 ${copiedField === "va"
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 hover:bg-primary/20 text-primary"
                    }`}
                  title="Salin nomor"
                >
                  {copiedField === "va" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* ── QR Code (Gateway - QRIS / GoPay) ── */}
          {showQR && !isExpired && !isPaid && (
            <div className="rounded-2xl bg-muted/30 border border-border/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/40">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[-0.005em]">
                  Scan QR Code
                </p>
              </div>
              <div className="px-4 py-4 flex justify-center">
                {data.paymentCode && data.paymentCode.startsWith("http") ? (
                  <div className="bg-white p-3 rounded-2xl border border-border/50 shadow-sm inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.paymentCode}
                      alt="QR Code"
                      className="w-48 h-48 rounded-xl object-contain"
                    />
                  </div>
                ) : (
                  <div className="bg-background/60 rounded-xl p-4 w-full">
                    <p className="text-sm text-muted-foreground font-mono break-all text-center">
                      {data.paymentCode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Deeplink (ShopeePay) ── */}
          {isDeeplink && !isExpired && !isPaid && (
            <a
              href={data.paymentCode!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-full shadow-md transition-all active:scale-[0.98]"
            >
              <span>📱</span> Buka Aplikasi ShopeePay
            </a>
          )}

          {/* ── Manual Payment Method Details ── */}
          {data.manualMethod && !isExpired && !isPaid && (
            <div className="rounded-2xl bg-muted/30 border border-border/40 overflow-hidden">
              {/* Provider header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
                {data.manualMethod.logo_url ? (
                  <div className="w-7 h-7 rounded-lg bg-white border border-border/50 flex items-center justify-center flex-shrink-0 overflow-hidden p-0.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.manualMethod.logo_url}
                      alt={data.manualMethod.provider_name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm">
                    {data.manualMethod.type === "bank_transfer" ? "🏦" : "📱"}
                  </div>
                )}
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[-0.005em]">
                  {data.manualMethod.provider_name}
                </p>
              </div>

              {/* Account name */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[-0.005em] text-muted-foreground">
                    Atas Nama
                  </p>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {data.manualMethod.account_name}
                  </p>
                </div>
              </div>

              {/* Account number */}
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[-0.005em] text-muted-foreground">
                    {data.manualMethod.type === "bank_transfer" ? "Nomor Rekening" : "Nomor Tujuan"}
                  </p>
                  <p className="text-xl font-mono font-bold text-foreground tracking-wider mt-0.5 break-all">
                    {data.manualMethod.account_number}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(data.manualMethod!.account_number, "account")}
                  className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all flex-shrink-0 ${copiedField === "account"
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 hover:bg-primary/20 text-primary"
                    }`}
                  title="Salin nomor"
                >
                  {copiedField === "account" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* ── How to Pay Instructions ── */}
          {!isExpired && !isPaid && instructions.length > 0 && (
            <div className="space-y-3">
              {instructions.map((section, idx) => (
                <div key={idx} className="rounded-2xl bg-muted/30 border border-border/40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full inline-block shrink-0" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[-0.005em]">
                      {section.title}
                    </p>
                  </div>
                  <ol className="px-4 py-3 space-y-2 list-decimal list-outside ml-4">
                    {section.steps.map((step, sIdx) => (
                      <li key={sIdx} className="text-sm font-medium text-muted-foreground leading-relaxed pl-1">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}

          {/* ── Polling indicator ── */}
          {!isPaid && !isExpired && (
            <div className="flex items-center justify-center gap-3 text-xs font-semibold text-muted-foreground py-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
              </span>
              Menunggu konfirmasi pembayaran otomatis...
            </div>
          )}

          {/* ── Action Button ── */}
          <div className="pt-2 pb-1">
            {isPaid ? (
              <Button
                onClick={async () => {
                  const supabase = createClient();
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user && !user.email_confirmed_at) {
                    const emailParam = user.email ? `?email=${encodeURIComponent(user.email)}` : "";
                    router.push(`/confirm-email${emailParam}`);
                  } else if (!user) {
                    router.push("/confirm-email");
                  } else {
                    router.push("/dashboard");
                  }
                }}
                variant="brand"
                size="lg"
                className="w-full rounded-full"
              >
                Lanjutkan
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                size="lg"
                className="w-full rounded-full border-border/50 bg-transparent text-foreground hover:bg-muted/50 font-bold transition-all active:scale-95"
              >
                {isExpired ? "Kembali ke Beranda" : "Selesai (Bayar Nanti)"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentInstructionPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-lg px-4 py-12">
          <div className="w-full bg-background/95 backdrop-blur-2xl border border-border/50 shadow-2xl shadow-black/20 rounded-3xl overflow-hidden animate-pulse">
            <div className="h-36 bg-primary/20" />
            <div className="p-6 space-y-4">
              <div className="h-20 bg-muted/50 rounded-2xl" />
              <div className="h-16 bg-muted/50 rounded-2xl" />
              <div className="h-28 bg-muted/50 rounded-2xl" />
              <div className="h-32 bg-muted/50 rounded-2xl" />
            </div>
          </div>
        </main>
      }
    >
      <PaymentInstructionContent />
    </Suspense>
  );
}
