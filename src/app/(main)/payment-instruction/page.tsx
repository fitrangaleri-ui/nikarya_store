"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Copy, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

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

/** Get human-readable payment method label */
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

/** Get icon for payment method */
function getMethodIcon(data: InstructionData): string {
  if (data.manualMethod)
    return data.manualMethod.type === "bank_transfer" ? "🏦" : "📱";
  const pt = data.paymentType || "";
  if (pt === "bank_transfer" || pt === "echannel") return "🏦";
  if (pt === "qris") return "📲";
  return "📱";
}

/** Get how-to-pay instructions based on payment type and method */
function getHowToPayInstructions(
  data: InstructionData,
): { title: string; steps: string[] }[] {
  const method = data.paymentMethod || "";
  const pt = data.paymentType || "";

  // Manual payment
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

  // VA payments
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

  // QRIS
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

  // GoPay
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

  // ShopeePay
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

/** Determine if payment code is a VA number (copyable text) vs QR/deeplink */
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

  // Fetch instruction data
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

  // Initial fetch
  useEffect(() => {
    if (!orderId) {
      setError("Order ID tidak ditemukan");
      setLoading(false);
      return;
    }
    fetchData();
  }, [orderId, fetchData]);

  // Payment status polling every 4 seconds
  useEffect(() => {
    if (!orderId || !data) return;
    // Don't poll if already paid or expired
    if (data.paymentStatus === "PAID" || data.paymentStatus === "EXPIRED")
      return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/payment-instruction?orderId=${encodeURIComponent(orderId)}`,
        );
        const result = await res.json();
        if (!result.error) {
          setData(result);

          // If payment is confirmed, redirect after a brief delay
          if (result.paymentStatus === "PAID") {
            if (pollRef.current) clearInterval(pollRef.current);
            // Brief delay so user sees the "confirmed" UI
            setTimeout(() => {
              // Redirect to dashboard (auth system handles verified/unverified)
              router.push("/dashboard");
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

  // Live countdown timer
  useEffect(() => {
    if (!data?.paymentDeadline) return;

    const interval = setInterval(() => {
      const deadline = new Date(data.paymentDeadline!).getTime();
      const remaining = Math.max(0, deadline - Date.now());
      setRemainingMs(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
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

  // Loading skeleton
  if (loading) {
    return (
      <main className="mx-auto max-w-lg px-4 py-12">
        <div className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-md p-8 space-y-6 animate-pulse shadow-sm">
          <div className="h-16 w-16 bg-muted rounded-full mx-auto" />
          <div className="h-6 bg-muted rounded-full w-2/3 mx-auto" />
          <div className="h-4 bg-muted rounded-full w-1/2 mx-auto" />
          <div className="h-24 bg-muted/50 rounded-2xl" />
          <div className="h-32 bg-muted/50 rounded-2xl" />
        </div>
      </main>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <main className="mx-auto max-w-lg px-4 py-12">
        <div className="rounded-3xl border border-destructive/20 bg-background/80 backdrop-blur-md p-8 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-destructive/10 mx-auto flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Terjadi Kesalahan
            </h1>
            <p className="text-sm font-medium text-muted-foreground">
              {error || "Data instruksi pembayaran tidak ditemukan."}
            </p>
          </div>
          <Button
            onClick={() => router.push("/")}
            variant="brand"
            className="w-full rounded-full h-12 shadow-sm"
          >
            Kembali ke Beranda
          </Button>
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
      <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        {/* ── Header ── */}
        <div className="relative bg-primary/5 px-6 py-10 text-center border-b border-border/40">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />

          <div className="relative z-10 w-20 h-20 rounded-full bg-background border border-primary/20 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="text-4xl">{methodIcon}</span>
          </div>
          <h1 className="relative z-10 text-2xl font-black text-foreground tracking-tight">
            Instruksi Pembayaran
          </h1>
          <p className="relative z-10 text-sm font-bold text-primary mt-1.5">
            {methodLabel}
          </p>
          <div className="relative z-10 inline-block bg-background/50 border border-border/50 rounded-full px-3 py-1 mt-3">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Order #{data.orderId.split("-")[0]}
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* ── Countdown Timer ── */}
          {!isPaid && data.paymentDeadline && (
            <div
              className={`rounded-2xl p-6 text-center border shadow-sm transition-all ${
                isExpired
                  ? "bg-destructive/5 border-destructive/20"
                  : "bg-background/50 border-border/50"
              }`}
            >
              {isExpired ? (
                <>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <p className="text-base font-bold text-destructive">
                      Waktu Habis
                    </p>
                  </div>
                  <p className="text-sm font-medium text-destructive/80 leading-relaxed">
                    Batas waktu pembayaran telah terlewati. Silakan buat pesanan
                    baru jika masih berminat.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Selesaikan sebelum
                    </p>
                  </div>
                  <p className="text-4xl font-mono font-black text-foreground tracking-wider drop-shadow-sm">
                    {formatCountdown(remainingMs)}
                  </p>
                </>
              )}
            </div>
          )}

          {/* ── Paid status ── */}
          {isPaid && (
            <div className="rounded-2xl bg-primary/10 border border-primary/20 p-6 text-center space-y-3 shadow-sm animate-in zoom-in-95">
              <CheckCircle className="h-10 w-10 text-primary mx-auto" />
              <p className="text-lg font-bold text-primary tracking-tight">
                Pembayaran Dikonfirmasi!
              </p>
              <p className="text-sm font-medium text-primary/80">
                Pesanan Anda sedang diproses. Mengalihkan ke dashboard...
              </p>
            </div>
          )}

          {/* ── Transfer Amount ── */}
          {!isExpired && !isPaid && (
            <div className="rounded-2xl border border-border/50 bg-background/60 p-5 shadow-sm">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Jumlah Tagihan
              </p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-black text-primary tracking-tight">
                  Rp {data.totalAmount.toLocaleString("id-ID")}
                </p>
                <button
                  onClick={() => handleCopy(String(data.totalAmount), "amount")}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                    copiedField === "amount"
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  {copiedField === "amount" ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" /> Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Salin
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] font-medium text-muted-foreground mt-3 leading-relaxed">
                * Pastikan transfer hingga{" "}
                <strong className="text-foreground">3 digit terakhir</strong>{" "}
                agar pembayaran terverifikasi otomatis.
              </p>
            </div>
          )}

          {/* ── VA Number (Gateway - Bank Transfer) ── */}
          {showVA && !isExpired && !isPaid && (
            <div className="rounded-2xl border border-border/50 bg-background/60 p-5 shadow-sm space-y-3">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                {data.paymentType === "echannel"
                  ? "Biller Code & Bill Key"
                  : "Nomor Virtual Account"}
              </p>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xl font-mono font-bold text-foreground tracking-widest break-all">
                  {data.paymentCode}
                </p>
                <button
                  onClick={() => handleCopy(data.paymentCode!, "va")}
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all flex-shrink-0 ${
                    copiedField === "va"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground"
                  }`}
                  title="Salin nomor"
                >
                  {copiedField === "va" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── QR Code (Gateway - QRIS / GoPay) ── */}
          {showQR && !isExpired && !isPaid && (
            <div className="rounded-2xl border border-border/50 bg-background/60 p-6 text-center space-y-4 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Scan QR Code
              </p>
              {data.paymentCode && data.paymentCode.startsWith("http") ? (
                <div className="bg-white p-3 rounded-2xl w-fit mx-auto border border-border/50 shadow-sm inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.paymentCode}
                    alt="QR Code"
                    className="w-48 h-48 rounded-xl object-contain"
                  />
                </div>
              ) : (
                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground font-mono break-all">
                    {data.paymentCode}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Deeplink (ShopeePay) ── */}
          {isDeeplink && !isExpired && !isPaid && (
            <div className="pt-2 text-center">
              <a
                href={data.paymentCode!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full justify-center h-12 items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold px-6 py-2.5 rounded-full shadow-md shadow-primary/20 transition-all active:scale-[0.98]"
              >
                <span>📱</span> Buka Aplikasi ShopeePay
              </a>
            </div>
          )}

          {/* ── Manual Payment Method Details ── */}
          {data.manualMethod && !isExpired && !isPaid && (
            <div className="rounded-2xl border border-border/50 bg-background/60 p-5 space-y-5 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                <div className="w-10 h-10 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center flex-shrink-0 text-lg">
                  {data.manualMethod.type === "bank_transfer" ? "🏦" : "📱"}
                </div>
                <p className="text-base font-bold text-foreground">
                  {data.manualMethod.provider_name}
                </p>
              </div>
              <div className="space-y-4 pt-1">
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    Atas Nama
                  </p>
                  <p className="text-base font-bold text-foreground">
                    {data.manualMethod.account_name}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    {data.manualMethod.type === "bank_transfer"
                      ? "Nomor Rekening"
                      : "Nomor Tujuan"}
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xl font-mono font-bold text-foreground tracking-wider break-all">
                      {data.manualMethod.account_number}
                    </p>
                    <button
                      onClick={() =>
                        handleCopy(data.manualMethod!.account_number, "account")
                      }
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all flex-shrink-0 ${
                        copiedField === "account"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground"
                      }`}
                      title="Salin nomor"
                    >
                      {copiedField === "account" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── How to Pay Instructions ── */}
          {!isExpired && !isPaid && instructions.length > 0 && (
            <div className="space-y-4 pt-2">
              {instructions.map((section, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-muted/20 border border-border/50 p-6 space-y-4"
                >
                  <p className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-primary rounded-full inline-block" />
                    {section.title}
                  </p>
                  <ol className="text-sm font-medium text-muted-foreground space-y-2.5 list-decimal list-outside ml-4 leading-relaxed">
                    {section.steps.map((step, sIdx) => (
                      <li key={sIdx} className="pl-1.5">
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
            <div className="flex items-center justify-center gap-3 text-xs font-semibold text-muted-foreground pt-4 pb-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              Menunggu konfirmasi pembayaran otomatis...
            </div>
          )}

          {/* ── Action Button ── */}
          <div className="pt-4">
            {isPaid ? (
              <Button
                onClick={() => router.push("/dashboard")}
                variant="brand"
                className="w-full rounded-full h-12 shadow-md shadow-primary/20 transition-all active:scale-95"
              >
                Lihat Dashboard
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full rounded-full h-12 border-border/50 bg-transparent text-foreground hover:bg-muted/50 font-bold transition-all active:scale-95"
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
          <div className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-md p-8 space-y-6 animate-pulse shadow-sm">
            <div className="h-16 w-16 bg-muted rounded-full mx-auto" />
            <div className="h-6 bg-muted rounded-full w-2/3 mx-auto" />
            <div className="h-4 bg-muted rounded-full w-1/2 mx-auto" />
            <div className="h-24 bg-muted/50 rounded-2xl" />
            <div className="h-32 bg-muted/50 rounded-2xl" />
          </div>
        </main>
      }
    >
      <PaymentInstructionContent />
    </Suspense>
  );
}
