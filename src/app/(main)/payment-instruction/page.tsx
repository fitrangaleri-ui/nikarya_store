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
        <div className="rounded-none border border-border bg-background p-6 space-y-5 animate-pulse">
          <div className="h-6 bg-muted rounded-none w-3/4 mx-auto" />
          <div className="h-4 bg-muted rounded-none w-1/2 mx-auto" />
          <div className="h-20 bg-muted/50 rounded-none" />
          <div className="h-32 bg-muted/50 rounded-none" />
        </div>
      </main>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <main className="mx-auto max-w-lg px-4 py-12">
        <div className="rounded-none border border-destructive/20 bg-background p-6 text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              Terjadi Kesalahan
            </h1>
            <p className="text-sm font-medium text-muted-foreground">
              {error || "Data tidak ditemukan"}
            </p>
          </div>
          <Button
            onClick={() => router.push("/")}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-none shadow-none h-11 transition-all active:scale-[0.98]"
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
    <main className="mx-auto max-w-lg px-4 py-8">
      <div className="rounded-none border border-border bg-background overflow-hidden">
        {/* ── Header ── */}
        <div className="bg-primary px-6 py-8 text-center">
          <div className="w-14 h-14 rounded-full bg-background/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">{methodIcon}</span>
          </div>
          <h1 className="text-xl font-bold text-primary-foreground tracking-tight">
            Instruksi Pembayaran
          </h1>
          <p className="text-sm font-medium text-primary-foreground/90 mt-1.5">
            {methodLabel}
          </p>
          <p className="text-xs font-medium text-primary-foreground/70 mt-1">
            Order #{data.orderId}
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* ── Countdown Timer ── */}
          {!isPaid && data.paymentDeadline && (
            <div
              className={`rounded-none p-5 text-center border ${
                isExpired
                  ? "bg-destructive/10 border-destructive/20"
                  : "bg-muted/20 border-border"
              }`}
            >
              {isExpired ? (
                <>
                  <div className="flex items-center justify-center gap-2 mb-1.5">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <p className="text-sm font-bold text-destructive">
                      Pembayaran Kedaluwarsa
                    </p>
                  </div>
                  <p className="text-sm font-medium text-destructive/80">
                    Batas waktu pembayaran telah habis. Silakan buat pesanan
                    baru.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 mb-2.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      Selesaikan pembayaran dalam
                    </p>
                  </div>
                  <p className="text-3xl font-mono font-bold text-foreground tracking-wider">
                    {formatCountdown(remainingMs)}
                  </p>
                </>
              )}
            </div>
          )}

          {/* ── Paid status ── */}
          {isPaid && (
            <div className="rounded-none bg-primary/10 border border-primary/20 p-5 text-center space-y-2">
              <CheckCircle className="h-8 w-8 text-primary mx-auto" />
              <p className="text-base font-bold text-primary tracking-tight">
                Pembayaran Dikonfirmasi!
              </p>
              <p className="text-sm font-medium text-primary/80">
                Mengalihkan ke dashboard...
              </p>
            </div>
          )}

          {/* ── Transfer Amount ── */}
          {!isExpired && !isPaid && (
            <div className="rounded-none border border-border bg-background p-5">
              <p className="text-sm font-semibold text-muted-foreground mb-1.5">
                Jumlah Pembayaran
              </p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-extrabold text-primary tracking-tight">
                  Rp {data.totalAmount.toLocaleString("id-ID")}
                </p>
                <button
                  onClick={() => handleCopy(String(data.totalAmount), "amount")}
                  className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-bold transition-colors"
                >
                  {copiedField === "amount" ? (
                    <>
                      <CheckCircle className="h-4 w-4" /> Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Salin
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs font-medium text-muted-foreground mt-3">
                * Transfer sesuai jumlah di atas agar pembayaran terverifikasi
                otomatis.
              </p>
            </div>
          )}

          {/* ── VA Number (Gateway - Bank Transfer) ── */}
          {showVA && !isExpired && !isPaid && (
            <div className="rounded-none border border-border bg-background p-5 space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">
                {data.paymentType === "echannel"
                  ? "Biller Code & Bill Key"
                  : "Nomor Virtual Account"}
              </p>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xl font-mono font-bold text-foreground tracking-wider break-all">
                  {data.paymentCode}
                </p>
                <button
                  onClick={() => handleCopy(data.paymentCode!, "va")}
                  className="p-2 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Salin nomor"
                >
                  {copiedField === "va" ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── QR Code (Gateway - QRIS / GoPay) ── */}
          {showQR && !isExpired && !isPaid && (
            <div className="rounded-none border border-border bg-background p-5 text-center space-y-4">
              <p className="text-sm font-semibold text-muted-foreground">
                Scan QR Code untuk Bayar
              </p>
              {data.paymentCode && data.paymentCode.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.paymentCode}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto rounded-none border border-border"
                />
              ) : (
                <div className="bg-muted/20 rounded-none p-4">
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
                className="inline-flex w-full justify-center h-11 items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold px-6 py-2.5 rounded-none transition-all active:scale-[0.98]"
              >
                <span>📱</span> Buka Aplikasi ShopeePay
              </a>
            </div>
          )}

          {/* ── Manual Payment Method Details ── */}
          {data.manualMethod && !isExpired && !isPaid && (
            <div className="rounded-none border border-border bg-background p-5 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-border pb-3">
                <span className="text-xl">
                  {data.manualMethod.type === "bank_transfer" ? "🏦" : "📱"}
                </span>
                <p className="text-base font-bold text-foreground">
                  {data.manualMethod.provider_name}
                </p>
              </div>
              <div className="space-y-4 pt-1">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">
                    Atas Nama
                  </p>
                  <p className="text-base font-bold text-foreground">
                    {data.manualMethod.account_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">
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
                      className="p-2 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Salin nomor"
                    >
                      {copiedField === "account" ? (
                        <CheckCircle className="h-4 w-4 text-primary" />
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
                  className="rounded-none bg-muted/20 border border-border p-5 space-y-3"
                >
                  <p className="text-sm font-bold text-foreground tracking-tight">
                    {section.title}
                  </p>
                  <ol className="text-sm font-medium text-muted-foreground space-y-2 list-decimal list-inside leading-relaxed">
                    {section.steps.map((step, sIdx) => (
                      <li key={sIdx}>{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}

          {/* ── Polling indicator ── */}
          {!isPaid && !isExpired && (
            <div className="flex items-center justify-center gap-2.5 text-sm font-medium text-muted-foreground pt-4 pb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              Menunggu konfirmasi pembayaran...
            </div>
          )}

          {/* ── Action Button ── */}
          <div className="pt-2">
            {isPaid ? (
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-none shadow-none h-11 transition-all active:scale-[0.98]"
              >
                Lihat Dashboard
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-none shadow-none h-11 transition-all active:scale-[0.98]"
              >
                {isExpired ? "Kembali ke Beranda" : "Selesai"}
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
          <div className="rounded-none border border-border bg-background p-6 space-y-5 animate-pulse">
            <div className="h-6 bg-muted rounded-none w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded-none w-1/2 mx-auto" />
            <div className="h-20 bg-muted/50 rounded-none" />
          </div>
        </main>
      }
    >
      <PaymentInstructionContent />
    </Suspense>
  );
}
