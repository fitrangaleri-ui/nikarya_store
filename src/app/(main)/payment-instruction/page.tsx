"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
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

function getMethodIcon(data: InstructionData) {
  if (data.manualMethod) {
    if (data.manualMethod.type === "bank_transfer") return <BanknotesIcon className="h-6 w-6" />;
    return <DevicePhoneMobileIcon className="h-6 w-6" />;
  }
  const pt = data.paymentType || "";
  if (pt === "bank_transfer" || pt === "echannel") return <BanknotesIcon className="h-6 w-6" />;
  if (pt === "qris") return <DevicePhoneMobileIcon className="h-6 w-6" />;
  return <CreditCardIcon className="h-6 w-6" />;
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
          title: "INSTRUKSI PEMBAYARAN",
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

function LoadingSkeleton() {
  return (
    <div className="min-h-80 flex flex-col items-center justify-start bg-background py-10 md:py-20 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="w-full max-w-[920px] glass rounded-xl overflow-hidden">
        <div className="h-40 bg-muted/40 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border/30">
          <div className="px-4 py-8 space-y-6">
            <div className="h-20 bg-muted/20 rounded-xl animate-pulse" />
            <div className="h-32 bg-muted/20 rounded-xl animate-pulse" />
            <div className="h-32 bg-muted/20 rounded-xl animate-pulse" />
          </div>
          <div className="px-4 py-8 space-y-6 bg-muted/5">
            <div className="h-64 bg-muted/20 rounded-xl animate-pulse" />
            <div className="h-12 bg-muted/20 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
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
                const guestEmail = (result as any).guestEmail || "";
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
        // silent
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

  if (loading) return <LoadingSkeleton />;

  const methodLabel = getMethodLabel(data!);
  const methodIcon = getMethodIcon(data!);
  const showVA = isVAPayment(data!) && data!.paymentCode;
  const showQR = isQRPayment(data!) && data!.paymentCode;
  const isDeeplink = data!.paymentType === "shopeepay" && data!.paymentCode;

  return (
    <div className="flex flex-col items-center justify-start bg-background py-10 md:py-10 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-[920px] glass rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        {error || !data ? (
          <div className="max-w-[480px] mx-auto">
            {/* Error Header */}
            <div className="relative bg-gradient-to-br from-destructive to-destructive/80 px-4 pt-9 pb-8 overflow-hidden">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 pointer-events-none" />
              <div className="relative z-10">
                <Typography variant="h3" className="text-white">Terjadi Kesalahan</Typography>
                <Typography variant="body-sm" className="text-white/70 mt-1 capitalize">{error || "Data tidak ditemukan"}</Typography>
              </div>
            </div>
            <div className="p-4 py-8">
              <Button onClick={() => router.push("/")} variant="brand" size="lg" className="w-full rounded-xl">
                Kembali ke Beranda
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Header Banner ── (Full Width) */}
            <div className={`relative bg-gradient-to-br transition-all duration-500 ${isPaid ? "from-green-500 to-green-600" : "from-primary to-secondary-foreground"} px-4 pt-9 pb-8 overflow-hidden`}>
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute bottom-[-20px] left-[15%] h-32 w-32 rounded-full bg-white/5 pointer-events-none" />

              <div className="relative z-10 flex flex-col items-start text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                    {isPaid ? <CheckCircleIcon className="h-7 w-7 text-white" /> : methodIcon}
                  </div>
                  <div>
                    <Typography variant="h4" className="text-white leading-tight">
                      {isPaid ? "Selesai!" : methodLabel}
                    </Typography>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <Typography variant="body-xs" className="text-white/70 font-medium shrink-0">
                        Order #{data.orderId.split("-")[0].toUpperCase()}
                      </Typography>
                      {!isPaid && data.paymentDeadline && (
                        <Badge variant="destructive" className="font-mono text-[11px] gap-2 px-3 py-1 ring-4 ring-destructive/10">
                          <ClockIcon className="h-3.5 w-3.5" />
                          <span className="font-sans font-bold uppercase text-[10px] opacity-90 border-r border-white/20 pr-2 leading-none">
                            {isExpired ? "Waktu Habis" : "Selesaikan Dalam"}
                          </span>
                          <span className="leading-none">{isExpired ? "00:00:00" : formatCountdown(remainingMs)}</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border/30">
              {/* ── Left Column: Payment Summary ── */}
              <div className="px-4 py-9 space-y-8">
                {/* PAID STATUS */}
                {isPaid && (
                  <div className="text-center space-y-5 py-12 animate-in fade-in slide-in-from-bottom-4">
                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
                      <CheckCircleIcon className="w-10 h-10 text-green-500" />
                    </div>
                    <Typography variant="h4" className="font-bold">Pembayaran Diterima!</Typography>
                    <Typography variant="body-base" color="muted" className="max-w-[300px] mx-auto">
                      Pesanan Anda sedang diproses dan Anda akan segera dialihkan ke dashboard.
                    </Typography>
                    <Button
                      onClick={() => router.push("/dashboard")}
                      variant="brand"
                      size="lg"
                      className="w-full"
                    >
                      Buka Dashboard
                    </Button>
                  </div>
                )}

                {!isPaid && (
                  <>
                    <div className="space-y-6">

                      {/* Amount Section */}
                      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                        <div className="bg-primary px-6 py-4 border-b border-primary-bg/10 flex items-center justify-between">
                          <Typography variant="caption" className="text-white font-black uppercase ">Total Tagihan</Typography>
                          <CreditCardIcon className="w-4 h-4 text-white/50" />
                        </div>
                        <div className="px-6 py-6 space-y-5">
                          {data.discountAmount > 0 && (
                            <div className="space-y-2.5 border-b border-border/30 pb-5">
                              <div className="flex justify-between items-center text-xs">
                                <Typography variant="body-xs" color="muted" className="font-medium text-muted-foreground">Subtotal</Typography>
                                <Typography variant="body-xs" className="font-bold">Rp {data.originalTotal.toLocaleString("id-ID")}</Typography>
                              </div>
                              <div className="flex justify-between items-center text-primary text-xs">
                                <Typography variant="body-xs" className="font-bold">Diskon Promo</Typography>
                                <Typography variant="body-xs" className="font-black">-Rp {data.discountAmount.toLocaleString("id-ID")}</Typography>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                              <Typography variant="h3" color="primary" className="font-black tracking-tight leading-none">
                                Rp {data.totalAmount.toLocaleString("id-ID")}
                              </Typography>
                              <Typography variant="caption" color="muted" className="font-medium">Sudah termasuk pajak & biaya</Typography>
                            </div>
                            <button
                              onClick={() => handleCopy(String(data.totalAmount), "amount")}
                              className={`flex items-center rounded-sm gap-2 px-4 py-2.5 text-xs font-bold transition-all duration-300 ${copiedField === "amount" ? "bg-green-500 text-white" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
                            >
                              {copiedField === "amount" ? <CheckCircleIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
                              {copiedField === "amount" ? "Tersalin" : "Salin"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* VA / QR Section */}
                      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                        <div className="bg-primary px-6 py-4 border-b border-primary-bg/10 flex items-center justify-between">
                          <Typography variant="caption" className="text-white font-black uppercase ">Detail rekening</Typography>
                          <MagnifyingGlassIcon className="w-4 h-4 text-white/50" />
                        </div>
                        <div className="px-6 py-6">
                          {data.paymentCode && !showQR && !isDeeplink && (
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 min-w-0 space-y-1">
                                <Typography variant="caption" color="muted" className="font-bold block tracking-wide uppercase text-[10px]">
                                  {data.paymentType === "echannel" ? "Bill Key" : "Nomor Virtual Account"}
                                </Typography>
                                <Typography variant="h4" className="font-mono font-black break-all text-foreground/90 leading-none">{data.paymentCode}</Typography>
                                {(data as any).accountName && (
                                  <Typography variant="caption" color="muted" className="font-medium">A/N: {(data as any).accountName}</Typography>
                                )}
                              </div>
                              <button
                                onClick={() => handleCopy(data.paymentCode!, "code")}
                                className={`flex items-center rounded-sm gap-2 px-4 py-2.5 text-xs font-bold transition-all duration-300 ${copiedField === "code" ? "bg-green-500 text-white" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
                              >
                                {copiedField === "code" ? <CheckCircleIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
                                {copiedField === "code" ? "Tersalin" : "Salin"}
                              </button>
                            </div>
                          )}

                          {showQR && (
                            <div className="flex flex-col items-center gap-5 py-2">
                              <div className="p-3 bg-white border-2 border-primary/10 rounded-xl group transition-all hover:border-primary/30">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={data.paymentCode!} alt="QR Code" className="w-48 h-48 object-contain transition-transform group-hover:scale-[1.02]" />
                              </div>
                              <Typography variant="caption" color="muted" className="font-bold uppercase  flex items-center gap-2">
                                <MagnifyingGlassIcon className="w-4 h-4" /> Scan Dengan Aplikasi
                              </Typography>
                            </div>
                          )}

                          {isDeeplink && (
                            <Button asChild variant="brand" size="lg" className="w-full">
                              <a href={data.paymentCode!} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                                <span>Buka Aplikasi</span>
                                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                              </a>
                            </Button>
                          )}

                          {data.manualMethod && (
                            <div className="space-y-5">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0 space-y-1">
                                  <Typography variant="h4" className="font-mono font-black leading-none">{data.manualMethod.account_number}</Typography>
                                  <Typography variant="caption" color="muted" className="font-medium">A/N: {data.manualMethod.account_name}</Typography>
                                </div>
                                <button
                                  onClick={() => handleCopy(data.manualMethod!.account_number, "manual")}
                                  className={`flex items-center rounded-sm gap-2 px-4 py-2.5 text-xs font-bold transition-all duration-300 ${copiedField === "manual" ? "bg-green-500 text-white" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
                                >
                                  {copiedField === "manual" ? <CheckCircleIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
                                  {copiedField === "manual" ? "Tersalin" : "Salin"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ── Right Column: Instructions & Actions ── */}
              <div className="px-4 py-9 space-y-8 bg-muted/5 backdrop-blur-sm">
                {!isPaid && !isExpired && (
                  <>
                    <div className="space-y-6">

                      <div className="space-y-4">
                        {instructions.map((section, idx) => (
                          <div key={idx} className="rounded-xl border border-border bg-card overflow-hidden group transition-all hover:border-primary/30">
                            <div className="px-6 py-4 bg-primary border-b border-primary-bg/10 flex items-center gap-3">
                              <Typography variant="body-sm" className="text-white font-black tracking-wide">{section.title}</Typography>
                            </div>
                            <div className="px-7 py-6">
                              <ul className="space-y-4 list-decimal list-outside text-[13px] text-muted-foreground/80 font-semibold marker:text-primary marker:font-black">
                                {section.steps.map((step, sIdx) => (
                                  <li key={sIdx} className="leading-relaxed pl-1">{step}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 space-y-5">
                      {/* Polling */}
                      <div className="flex items-center gap-3 px-2 py-3 rounded-full bg-primary/5 border border-primary/10">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                        </span>
                        <Typography variant="caption" color="primary" className="font-bold italic tracking-wide">Menunggu konfirmasi otomatis...</Typography>
                      </div>

                      <div className="flex flex-col gap-3.5">
                        <Button
                          onClick={() => router.push("/dashboard")}
                          variant="brand"
                          size="lg"
                          className="w-full h-14 font-black tracking-tight"
                        >
                          Cek Status Pesanan
                        </Button>
                        <Button
                          onClick={() => router.push("/")}
                          variant="outline"
                          size="lg"
                          className="w-full h-14 border-border/60 hover:bg-muted/50 font-bold"
                        >
                          Selesai & Bayar Nanti
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {isExpired && (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 space-y-6">
                    <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center animate-bounce">
                      <ExclamationTriangleIcon className="h-12 w-12 text-destructive" />
                    </div>
                    <div className="space-y-2">
                      <Typography variant="h4" className="font-black text-destructive">Waktu Pembayaran Habis</Typography>
                      <Typography variant="body-base" color="muted" className="max-w-[280px] mx-auto font-medium">Batas waktu telah habis. Silakan buat pesanan baru untuk melanjutkan.</Typography>
                    </div>
                    <Button onClick={() => router.push("/")} variant="brand" size="lg" className="w-full h-14">Cari Produk Lain</Button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentInstructionPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PaymentInstructionContent />
    </Suspense>
  );
}
