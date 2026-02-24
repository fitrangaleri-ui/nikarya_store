"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShoppingBag,
  ArrowRight,
  Loader2,
  Plus,
  Minus,
  Trash2,
  Eye,
  EyeOff,
  User,
  CreditCard,
  ReceiptText,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Payment config state
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(
    null,
  );
  const [selectedGatewayMethod, setSelectedGatewayMethod] =
    useState<string>("");
  const [selectedManualMethodId, setSelectedManualMethodId] = useState<
    string | null
  >(null);

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
  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

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
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center p-8 bg-card/40 backdrop-blur-sm border border-border/50 rounded-3xl shadow-sm max-w-sm w-full">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Keranjang Kosong
          </h1>
          <p className="text-sm text-muted-foreground mt-2 mb-8">
            Belum ada produk untuk di-checkout. Mari mulai berbelanja!
          </p>
          <Button
            onClick={() => router.push("/products")}
            variant="brand"
            size="lg"
            className="w-full rounded-full h-12"
          >
            Lihat Katalog Produk
          </Button>
        </div>
      </main>
    );
  }

  // ── MAIN CHECKOUT PAGE ──
  return (
    <main className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-10">
      <div className="flex items-center gap-3 mb-8">
        <span className="w-1.5 h-7 bg-primary rounded-full block" />
        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
          Checkout Pesanan
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* ── LEFT: Customer Info Form ── */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-md shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                Informasi Pelanggan
              </h2>
            </div>

            {user ? (
              <div className="space-y-4 bg-background/50 rounded-2xl p-5 border border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Nama Lengkap
                    </label>
                    <p className="text-base text-foreground font-semibold">
                      {displayName || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Alamat Email
                    </label>
                    <p className="text-base text-foreground font-semibold">
                      {displayEmail || "—"}
                    </p>
                  </div>
                </div>
                <div className="pt-2 mt-2 border-t border-border/50">
                  <p className="text-xs font-medium text-primary">
                    ✓ Terhubung dengan akun Anda
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="guest-name"
                      className="text-xs font-semibold text-muted-foreground ml-1"
                    >
                      Nama Lengkap <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="guest-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      className="h-11 rounded-xl border-border/50 bg-background/50 text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="guest-phone"
                      className="text-xs font-semibold text-muted-foreground ml-1"
                    >
                      Nomor HP <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="guest-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="h-11 rounded-xl border-border/50 bg-background/50 text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="guest-email"
                    className="text-xs font-semibold text-muted-foreground ml-1"
                  >
                    Alamat Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="guest-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contoh@email.com"
                    className="h-11 rounded-xl border-border/50 bg-background/50 text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="guest-password"
                    className="text-xs font-semibold text-muted-foreground ml-1"
                  >
                    Kata Sandi <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="guest-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="h-11 rounded-xl border-border/50 bg-background/50 text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] font-medium text-primary pt-0.5 ml-1">
                    Akun akan dibuat otomatis untuk melacak pesanan Anda
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="guest-notes"
                    className="text-xs font-semibold text-muted-foreground ml-1"
                  >
                    Catatan <span className="font-normal">(opsional)</span>
                  </Label>
                  <textarea
                    id="guest-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Pesan khusus untuk penjual..."
                    rows={3}
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-3 py-2.5 text-sm text-foreground font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selection - Gateway */}
          {paymentConfig?.mode === "gateway" &&
            paymentConfig.gateway_methods &&
            paymentConfig.gateway_methods.length > 0 && (
              <div className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-md shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">
                      Metode Pembayaran
                    </h2>
                    {paymentConfig.active_gateway && (
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                        Via {paymentConfig.active_gateway.display_name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {paymentConfig.gateway_methods.map((method) => (
                    <label
                      key={method.code}
                      className={`flex items-center gap-4 rounded-2xl border p-4 cursor-pointer transition-all shadow-sm ${
                        selectedGatewayMethod === method.code
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border/50 bg-background hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gatewayMethod"
                        value={method.code}
                        checked={selectedGatewayMethod === method.code}
                        onChange={() => {
                          setSelectedGatewayMethod(method.code);
                          setError("");
                        }}
                        className="accent-primary w-4 h-4 flex-shrink-0 cursor-pointer"
                      />
                      <span className="text-2xl flex-shrink-0 opacity-80">
                        {method.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground">
                          {method.label}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground mt-0.5 leading-tight">
                          {method.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

          {/* Payment Method Selection - Manual */}
          {paymentConfig?.mode === "manual" &&
            paymentConfig.manual_methods &&
            paymentConfig.manual_methods.length > 0 && (
              <div className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-md shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground tracking-tight">
                    Pilih Rekening Transfer
                  </h2>
                </div>

                <div className="space-y-3">
                  {paymentConfig.manual_methods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 rounded-2xl border p-4 cursor-pointer transition-all shadow-sm ${
                        selectedManualMethodId === method.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border/50 bg-background hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      <input
                        type="radio"
                        name="manualMethod"
                        value={method.id}
                        checked={selectedManualMethodId === method.id}
                        onChange={() => {
                          setSelectedManualMethodId(method.id);
                          setError("");
                        }}
                        className="accent-primary w-4 h-4 flex-shrink-0 cursor-pointer"
                      />
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Logo bank */}
                        <div className="w-10 h-10 rounded-xl bg-white border border-border/50 flex items-center justify-center flex-shrink-0 overflow-hidden p-1.5">
                          {method.logo_url ? (
                            <Image
                              src={method.logo_url}
                              alt={method.provider_name}
                              width={40}
                              height={40}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-lg">
                              {method.type === "bank_transfer" ? "🏦" : "📱"}
                            </span>
                          )}
                        </div>
                        {/* Nama bank — tanpa account_name & account_number */}
                        <p className="text-sm font-bold text-foreground">
                          {method.provider_name}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* ── RIGHT: Order Summary + Button ── */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-md shadow-sm p-6 md:p-8 lg:sticky lg:top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ReceiptText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                Ringkasan Pesanan
              </h2>
            </div>

            <ul className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-muted/30 border border-border/50">
                    {item.thumbnail_url ? (
                      <Image
                        src={item.thumbnail_url}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <p className="text-xs font-bold text-foreground leading-snug line-clamp-2">
                        {item.title}
                      </p>
                      <p className="text-xs font-semibold text-primary mt-1">
                        Rp {Number(item.price).toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="inline-flex items-center bg-background border border-border/60 rounded-full h-7 w-fit shadow-sm">
                        <button
                          type="button"
                          onClick={() => handleDecrease(item.id, item.quantity)}
                          className="w-7 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-l-full transition-colors"
                          title={item.quantity <= 1 ? "Hapus" : "Kurangi"}
                        >
                          {item.quantity <= 1 ? (
                            <Trash2 className="h-3 w-3 text-destructive" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                        </button>
                        <span className="w-6 text-center text-[10px] font-bold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => increaseQuantity(item.id)}
                          className="w-7 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-r-full transition-colors"
                          title="Tambah"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {item.quantity > 1 && (
                        <p className="text-xs font-bold text-foreground">
                          Rp{" "}
                          {(item.price * item.quantity).toLocaleString("id-ID")}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="pt-5 border-t border-border/50 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Jumlah Item
                </span>
                <span className="text-sm font-bold text-foreground">
                  {cartCount} Item
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-sm font-bold text-muted-foreground">
                  Total Bayar
                </span>
                <span className="text-2xl font-black text-primary tracking-tight">
                  Rp {subtotal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 rounded-2xl bg-destructive/10 p-4 text-sm font-semibold text-destructive border border-destructive/20 text-center animate-in fade-in zoom-in-95">
                <p>{error}</p>
                {error.includes("login") && (
                  <button
                    onClick={() => router.push("/login?redirectTo=/checkout")}
                    className="text-primary hover:text-primary/80 font-bold underline transition-colors inline-block mt-2"
                  >
                    Masuk ke akun sekarang
                  </button>
                )}
              </div>
            )}

            {/* Pay button */}
            <div className="space-y-4">
              <Button
                onClick={handleCheckout}
                disabled={loading || cartItems.length === 0}
                variant="brand"
                size="lg"
                className="w-full h-14 rounded-full shadow-[0_4px_14px_0_rgba(13,148,136,0.39)] hover:shadow-[0_6px_20px_rgba(13,148,136,0.23)] hover:-translate-y-0.5 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2.5 h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full px-2">
                    <span>{user ? "Bayar Sekarang" : "Daftar & Bayar"}</span>
                    <div className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center backdrop-blur-sm">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </Button>

              {!user && (
                <p className="text-xs font-semibold text-muted-foreground text-center">
                  Sudah memiliki akun?{" "}
                  <button
                    onClick={() => router.push("/login?redirectTo=/checkout")}
                    className="text-primary hover:text-primary/80 transition-colors ml-1"
                  >
                    Masuk di sini
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
