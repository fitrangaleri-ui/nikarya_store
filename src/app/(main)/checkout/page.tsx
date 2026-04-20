"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShoppingBagIcon,
  ArrowRightIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
  TicketIcon,
  XMarkIcon,
  LockClosedIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CheckBadgeIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";

interface ManualMethod {
  id: string;
  type: string;
  provider_name: string;
  account_name: string;
  account_number: string;
  logo_url: string | null;
}

interface GatewayMethod {
  code: string;
  label: string;
  description: string;
  icon: string;
}

interface PaymentConfig {
  mode: "gateway" | "manual";
  active_gateway?: { name: string; display_name: string };
  gateway_methods?: GatewayMethod[];
  manual_methods?: ManualMethod[];
}

export default function CheckoutPage() {
  const {
    cartItems,
    subtotal,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Payment config state
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [selectedGatewayMethod, setSelectedGatewayMethod] = useState<string>("");
  const [selectedManualMethodId, setSelectedManualMethodId] = useState<string | null>(null);

  // Promo code state
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
    message: string;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const prevCartKey = useRef("");

  // Validate promo code
  const validatePromo = useCallback(
    async (code: string, silent = false) => {
      if (!code.trim()) return;
      if (!silent) setPromoLoading(true);
      setPromoError("");
      setPromoSuccess("");

      try {
        const res = await fetch("/api/promo/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            items: cartItems.map((i) => ({ id: i.id, quantity: i.quantity })),
            email: email || undefined,
          }),
        });

        const data = await res.json();

        if (data.valid) {
          setAppliedPromo({
            code: data.code,
            discountAmount: data.discountAmount,
            message: data.message,
          });
          setPromoSuccess(data.message);
          setPromoInput("");
        } else {
          // Auto-revalidation failed — remove promo
          if (silent) {
            setAppliedPromo(null);
            setPromoError("Promo tidak lagi berlaku untuk keranjang ini.");
          } else {
            setPromoError(data.message || "Kode promo tidak valid.");
          }
        }
      } catch {
        if (!silent) setPromoError("Gagal memvalidasi promo.");
      } finally {
        if (!silent) setPromoLoading(false);
      }
    },
    [cartItems, email],
  );

  // Auto-revalidate promo when cart changes
  useEffect(() => {
    const key = cartItems.map((i) => `${i.id}:${i.quantity}`).join(",");
    if (prevCartKey.current && key !== prevCartKey.current && appliedPromo) {
      validatePromo(appliedPromo.code, true);
    }
    prevCartKey.current = key;
  }, [cartItems, appliedPromo, validatePromo]);

  const handleApplyPromo = () => {
    validatePromo(promoInput);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError("");
    setPromoSuccess("");
  };

  const discountedTotal = appliedPromo
    ? Math.max(0, subtotal - appliedPromo.discountAmount)
    : subtotal;

  // Fetch payment config
  useEffect(() => {
    fetch("/api/payment-config")
      .then((res) => res.json())
      .then((data: PaymentConfig) => {
        setPaymentConfig(data);
        if (data.mode === "gateway" && data.gateway_methods?.length) {
          setSelectedGatewayMethod(data.gateway_methods[0].code);
        }
      })
      .catch(() => {
        /* silent */
      });
  }, []);

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  const displayEmail = user?.email || "";

  const handleDecrease = (id: string, quantity: number) => {
    if (quantity <= 1) {
      removeFromCart(id);
    } else {
      decreaseQuantity(id);
    }
  };

  const handleCheckout = async () => {
    setError("");

    if (!user) {
      if (!name.trim()) {
        setError("Nama lengkap wajib diisi");
        return;
      }
      if (!email.trim()) {
        setError("Email wajib diisi");
        return;
      }
      if (!phone.trim()) {
        setError("Nomor HP wajib diisi");
        return;
      }
      if (!password.trim()) {
        setError("Password wajib diisi untuk membuat akun");
        return;
      }
      if (password.length < 6) {
        setError("Password minimal 6 karakter");
        return;
      }
    }

    if (cartItems.length === 0) {
      setError("Keranjang kosong");
      return;
    }

    if (paymentConfig?.mode === "manual" && !selectedManualMethodId) {
      setError("Pilih metode pembayaran terlebih dahulu");
      return;
    }

    if (paymentConfig?.mode === "gateway" && !selectedGatewayMethod) {
      setError("Pilih metode pembayaran terlebih dahulu");
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        items: cartItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
        paymentMethod: selectedGatewayMethod || undefined,
        promoCode: appliedPromo?.code || undefined,
      };

      if (paymentConfig?.mode === "manual" && selectedManualMethodId) {
        payload.manualPaymentMethodId = selectedManualMethodId;
      }

      if (!user) {
        payload.customerInfo = {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: password,
          notes: notes.trim() || undefined,
        };
      }

      const res = await fetch("/api/checkout-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requireLogin) {
          setError("Email sudah terdaftar. Silakan login terlebih dahulu.");
          return;
        }
        setError(data.error || "Gagal membuat order");
        return;
      }

      clearCart();

      if (data.redirect_url && data.gateway_name === "duitku") {
        window.location.href = data.redirect_url;
      } else {
        router.push(`/payment-instruction?orderId=${data.midtrans_order_id}`);
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // ── EMPTY CART STATE ──
  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />

        <div className="flex flex-col items-center justify-center text-center p-8 glass rounded-xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
            <ShoppingBagIcon className="h-8 w-8 text-primary" />
          </div>
          <Typography variant="h4" as="h1" className="tracking-tight">
            Keranjang Kosong
          </Typography>
          <Typography variant="body-sm" color="muted" className="mt-2 mb-8 font-medium">
            Belum ada produk untuk di-checkout. Mari mulai berbelanja!
          </Typography>
          <Button
            onClick={() => router.push("/products")}
            variant="brand"
            size="lg"
            className="w-full h-12"
          >
            Lihat Katalog Produk
          </Button>
        </div>
      </main>
    );
  }

  // ── MAIN CHECKOUT PAGE ──
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[20%] right-[-5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />

      <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-12 relative z-10 animate-in fade-in duration-700">
        <div className="flex items-center gap-3 mb-10">
          <span className="w-1.5 h-8 bg-gradient-to-b from-primary to-secondary-foreground rounded-full block" />
          <Typography variant="h2" as="h1" className="tracking-tight">
            Checkout Pesanan
          </Typography>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* ── LEFT: Customer Info Form ── */}
          <div className="space-y-8">

            {/* Informasi Pelanggan */}
            <div className="glass rounded-xl overflow-hidden animate-in fade-in slide-in-from-left duration-500">
              {/* Login-style Header Banner */}
              <div className="relative bg-gradient-to-br from-primary to-secondary-foreground px-6 py-6 overflow-hidden">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute bottom-[-10px] left-[10%] h-16 w-16 rounded-full bg-white/5 pointer-events-none" />
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <Typography variant="h5" className="text-white leading-tight">
                      Informasi Pelanggan
                    </Typography>
                    <Typography variant="body-xs" className="text-white/80 font-medium tracking-wide">
                      Lengkapi data diri untuk keperluan akses pesanan
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                {user ? (
                  <div className="rounded-2xl bg-background/50 border border-border/40 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/40">
                      <div className="flex items-center gap-3 px-4 py-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <UserCircleIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <Typography variant="caption" as="p" color="muted" className="font-bold uppercase tracking-widest text-[10px]">
                            Nama Lengkap
                          </Typography>
                          <Typography variant="body-sm" as="p" className="font-semibold truncate">
                            {displayName || "—"}
                          </Typography>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <EnvelopeIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <Typography variant="caption" as="p" color="muted" className="font-bold uppercase tracking-widest text-[10px]">
                            Alamat Email
                          </Typography>
                          <Typography variant="body-sm" as="p" className="font-semibold truncate">
                            {displayEmail || "—"}
                          </Typography>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2.5 bg-primary/5 border-t border-border/40">
                      <Typography variant="body-xs" as="p" className="text-primary font-bold">
                        ✓ Terhubung dengan akun aktif
                      </Typography>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Grid Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nama */}
                      <div className="relative group">
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center transition-colors group-focus-within:bg-primary/10">
                            <UserCircleIcon className="h-4 w-4 text-primary" />
                          </div>
                          <Input
                            id="guest-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nama Lengkap Anda *"
                            className="pl-14 h-12 rounded-lg bg-background/80 border-border focus-visible:ring-primary/20 transition-all text-sm font-medium"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="relative group">
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center transition-colors group-focus-within:bg-primary/10">
                            <PhoneIcon className="h-4 w-4 text-primary" />
                          </div>
                          <Input
                            id="guest-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            onFocus={() => setIsPhoneFocused(true)}
                            onBlur={() => setIsPhoneFocused(false)}
                            placeholder="Nomor WhatsApp Aktif *"
                            className="pl-14 h-12 rounded-lg bg-background/80 border-border focus-visible:ring-primary/20 transition-all text-sm font-medium"
                          />
                        </div>
                        {isPhoneFocused && (
                          <div className="mt-2 py-2 px-4 bg-primary rounded-lg text-white text-[10px] flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                            <InformationCircleIcon className="h-3.5 w-3.5 shrink-0" />
                            <Typography variant="caption" className="text-primary-foreground font-normal leading-tight">
                              Gunakan nomor WhatsApp aktif untuk menerima notifikasi pesanan Anda
                            </Typography>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="relative group">
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center transition-colors group-focus-within:bg-primary/10">
                          <EnvelopeIcon className="h-4 w-4 text-primary" />
                        </div>
                        <Input
                          id="guest-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Alamat Email Valid *"
                          className="pl-14 h-12 rounded-lg bg-background/80 border-border focus-visible:ring-primary/20 transition-all text-sm font-medium"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="relative group">
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center transition-colors group-focus-within:bg-primary/10">
                          <LockClosedIcon className="h-4 w-4 text-primary" />
                        </div>
                        <Input
                          id="guest-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Buat Password Akun (Min. 6 Karakter) *"
                          className="pl-14 pr-12 h-12 rounded-lg bg-background/80 border-border focus-visible:ring-primary/20 transition-all text-sm font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Catatan */}
                    <div className="relative group">
                      <div className="relative">
                        <div className="absolute left-4 top-6 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                          <DocumentTextIcon className="h-4 w-4 text-primary" />
                        </div>
                        <textarea
                          id="guest-notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Catatan tambahan untuk pesanan (opsional)..."
                          rows={3}
                          className="w-full pl-14 pr-4 py-3 rounded-lg bg-background/80 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium outline-none resize-none"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                      <Typography variant="body-xs" className="font-semibold text-primary">
                        Info: Akun akan dibuat otomatis untuk memudahkan Anda melacak status pesanan di masa mendatang.
                      </Typography>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Selection - Gateway / Manual */}
            <div className="glass rounded-xl overflow-hidden animate-in fade-in slide-in-from-left duration-500 delay-100">
              <div className="relative bg-gradient-to-br from-primary to-secondary-foreground px-6 py-6 overflow-hidden">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute bottom-[-10px] left-[15%] h-16 w-16 rounded-full bg-white/5 pointer-events-none" />
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <CreditCardIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <Typography variant="h5" className="text-white leading-tight">
                      Metode Pembayaran
                    </Typography>
                    {paymentConfig?.mode === "manual" && (
                      <Typography variant="body-xs" className="text-white/80 font-medium tracking-wide">
                        Pilih Rekening Tujuan Transfer
                      </Typography>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                {/* Gateway Choice */}
                {paymentConfig?.mode === "gateway" && (
                  <div className="space-y-4">
                    {paymentConfig.active_gateway && (
                      <div className="flex items-center gap-2 mb-4 px-2">
                        <span className="w-1.5 h-4 bg-primary/40 rounded-full" />
                        <Typography variant="caption" className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                          Otomatis melalui {paymentConfig.active_gateway.display_name}
                        </Typography>
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                      {paymentConfig.gateway_methods?.map((method) => (
                        <label
                          key={method.code}
                          className={`flex flex-col gap-0 rounded-xl border p-4 cursor-pointer transition-all ${selectedGatewayMethod === method.code
                            ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                            : "border-border/50 bg-background/50 hover:border-primary/30 hover:bg-primary/5"
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <input
                              type="radio"
                              name="gatewayMethod"
                              checked={selectedGatewayMethod === method.code}
                              onChange={() => setSelectedGatewayMethod(method.code)}
                              className="accent-primary w-4 h-4 flex-shrink-0 cursor-pointer"
                            />
                            <span className="text-2xl opacity-90">{method.icon}</span>
                            <div className="min-w-0 flex-1">
                              <Typography variant="body-sm" className="font-bold tracking-tight">
                                {method.label}
                              </Typography>
                              <Typography variant="caption" color="muted" className="mt-0.5 leading-tight font-medium">
                                {method.description}
                              </Typography>
                            </div>
                          </div>

                          {selectedGatewayMethod === method.code && (
                            <div className="mt-4 py-2 px-4 bg-primary rounded-lg text-white text-[10px] flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                              <CheckBadgeIcon className="h-3.5 w-3.5 shrink-0" />
                              <Typography variant="caption" className="text-primary-foreground font-normal leading-tight">
                                Pembayaran melalui {method.label}
                              </Typography>
                            </div>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual Choice */}
                {paymentConfig?.mode === "manual" && (
                  <div className="grid grid-cols-1 gap-3">
                    {paymentConfig.manual_methods?.map((method) => (
                      <label
                        key={method.id}
                        className={`flex flex-col gap-0 rounded-xl border p-4 cursor-pointer transition-all ${selectedManualMethodId === method.id
                          ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                          : "border-border/50 bg-background/50 hover:border-primary/30 hover:bg-primary/5"
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            name="manualMethod"
                            checked={selectedManualMethodId === method.id}
                            onChange={() => setSelectedManualMethodId(method.id)}
                            className="accent-primary w-4 h-4 flex-shrink-0 cursor-pointer"
                          />
                          <div className="w-10 h-10 rounded-full bg-white border border-border/50 flex items-center justify-center flex-shrink-0 overflow-hidden p-1.5">
                            {method.logo_url ? (
                              <Image src={method.logo_url} alt={method.provider_name} width={40} height={40} className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-lg">{method.type === "bank_transfer" ? "🏦" : "📱"}</span>
                            )}
                          </div>
                          <Typography variant="body-sm" className="font-bold tracking-tight">
                            {method.provider_name}
                          </Typography>
                        </div>

                        {selectedManualMethodId === method.id && (
                          <div className="mt-4 py-2 px-4 bg-primary rounded-lg text-white text-[10px] flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                            <CheckBadgeIcon className="h-3.5 w-3.5 shrink-0" />
                            <Typography variant="caption" className="text-primary-foreground font-normal leading-tight">
                              Pembayaran melalui bank/dompet digital {method.provider_name}
                            </Typography>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Order Summary + Button ── */}
          <div className="space-y-6">
            <div className="glass rounded-xl overflow-hidden lg:sticky lg:top-24 animate-in fade-in zoom-in-95 duration-500 delay-200">
              <div className="relative bg-gradient-to-br from-primary to-secondary-foreground px-6 py-6 overflow-hidden">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 pointer-events-none" />
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <ClipboardDocumentListIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <Typography variant="h5" className="text-white leading-tight">
                      Ringkasan
                    </Typography>
                    <Typography variant="body-xs" className="text-white/80 font-medium tracking-wide">
                      Tinjau kembali rincian pesanan Anda
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                {/* Cart Items */}
                <ul className="space-y-4 mb-8">
                  {cartItems.map((item) => (
                    <li key={item.id} className="flex gap-4 group">
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-sm overflow-hidden bg-background/50 border border-border/60 transition-transform group-hover:scale-105 duration-300">
                        {item.thumbnail_url ? (
                          <Image src={item.thumbnail_url} alt={item.title} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ShoppingBagIcon className="h-5 w-5 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <Typography variant="body-xs" className="font-bold leading-snug line-clamp-2">
                          {item.title}
                        </Typography>
                        <div className="flex items-center justify-between mt-2">
                          <Typography variant="body-xs" color="primary" className="font-bold font-mono">
                            Rp {Number(item.price).toLocaleString("id-ID")}
                          </Typography>
                          <div className="flex items-center gap-2 px-2 py-0.5 bg-primary/5 rounded-full border border-primary/10">
                            <Typography variant="caption" className="font-black text-primary text-[10px] font-mono">
                              {item.quantity}x
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Promo Code Style */}
                <div className="pt-6 border-t border-border/40 mb-6">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 animate-in zoom-in-95">
                      <div className="flex items-center gap-2">
                        <Typography variant="body-sm" color="primary" className="font-black uppercase">
                          {appliedPromo.code}
                        </Typography>
                        <Typography variant="caption" className="font-bold text-primary/60 font-mono">
                          −Rp {appliedPromo.discountAmount.toLocaleString("id-ID")}
                        </Typography>
                      </div>
                      <button onClick={handleRemovePromo} className="h-7 w-7 rounded-full hover:bg-destructive/10 flex items-center justify-center transition-colors">
                        <XMarkIcon className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value.toUpperCase());
                          setPromoError("");
                        }}
                        placeholder="Masukkan Kode Promo"
                        className="h-11 rounded-lg text-sm flex-1 bg-background/50 border-border"
                        onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                      />
                      <Button
                        variant="brand"
                        className="h-11 rounded-full px-6 font-bold"
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoInput.trim()}
                      >
                        {promoLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : "Apply"}
                      </Button>
                    </div>
                  )}

                  {promoError && (
                    <div className="flex items-center gap-1.5 mt-2.5 px-1">
                      <ExclamationTriangleIcon className="h-3.5 w-3.5 text-destructive" />
                      <Typography variant="body-xs" color="destructive" className="font-bold">
                        {promoError}
                      </Typography>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="pt-6 border-t border-border/40 mb-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <Typography variant="body-sm" color="muted" className="font-medium">Subtotal Produk</Typography>
                    <Typography variant="body-sm" className="font-bold font-mono">Rp {subtotal.toLocaleString("id-ID")}</Typography>
                  </div>
                  {appliedPromo && (
                    <div className="flex items-center justify-between">
                      <Typography variant="body-sm" color="primary" className="font-medium">Voucher ({appliedPromo.code})</Typography>
                      <Typography variant="body-sm" color="primary" className="font-bold font-mono">−Rp {appliedPromo.discountAmount.toLocaleString("id-ID")}</Typography>
                    </div>
                  )}
                  <div className="pt-4 border-t border-dashed border-border/40 flex items-end justify-between">
                    <Typography variant="body-sm" color="muted" className="font-medium">Total Bayar</Typography>
                    <Typography variant="h3" color="primary" className="tracking-tight leading-none font-mono">
                      Rp {discountedTotal.toLocaleString("id-ID")}
                    </Typography>
                  </div>
                </div>

                {/* Submit Panel */}
                <div className="space-y-4">
                  {error && (
                    <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4 animate-in fade-in zoom-in-95">
                      <div className="flex items-start gap-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <Typography variant="body-sm" color="destructive" className="font-bold">
                          {error}
                        </Typography>
                      </div>
                      {error.includes("login") && (
                        <button onClick={() => router.push("/login?redirectTo=/checkout")} className="mt-2 text-primary font-bold underline text-xs block">
                          Klik di sini untuk Masuk
                        </button>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={handleCheckout}
                    disabled={loading || cartItems.length === 0}
                    variant="brand"
                    size="lg"
                    className="w-full h-14 rounded-full hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Typography variant="body-base" className="text-primary-foreground">
                        {user ? "Bayar Sekarang" : "Daftar & Bayar"}
                      </Typography>
                    )}
                  </Button>

                  {!user && (
                    <Typography variant="body-xs" color="muted" className="font-bold text-center pt-2">
                      Sudah punya akun?{" "}
                      <button onClick={() => router.push("/login?redirectTo=/checkout")} className="text-primary hover:underline ml-1">Masuk Sekarang</button>
                    </Typography>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main >
  );
}
