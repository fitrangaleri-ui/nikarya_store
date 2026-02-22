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
      <main className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <ShoppingBag className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Keranjang Kosong
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Tambahkan produk untuk mulai belanja
          </p>
          <Button
            onClick={() => router.push("/products")}
            size="lg"
            className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-none shadow-none h-11 transition-all active:scale-[0.98]"
          >
            Lihat Produk
          </Button>
        </div>
      </main>
    );
  }

  // ── MAIN CHECKOUT PAGE ──
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground tracking-tight mb-8">
        Checkout
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* ── LEFT: Customer Info Form ── */}
        <div className="space-y-6">
          <div className="rounded-none border border-border bg-background p-6">
            <h2 className="text-lg font-bold text-foreground tracking-tight mb-5">
              Informasi Pelanggan
            </h2>

            {user ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">
                    Nama Lengkap
                  </label>
                  <p className="text-sm text-foreground font-medium">
                    {displayName || "—"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">
                    Alamat Email
                  </label>
                  <p className="text-sm text-foreground font-medium">
                    {displayEmail || "—"}
                  </p>
                </div>
                <p className="text-sm font-medium text-muted-foreground pt-2">
                  Data ini diambil dari akun Anda.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="guest-name"
                    className="text-sm font-semibold text-muted-foreground"
                  >
                    Nama Lengkap <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="guest-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="h-11 rounded-none border-border bg-background text-foreground text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="guest-email"
                    className="text-sm font-semibold text-muted-foreground"
                  >
                    Alamat Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="guest-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contoh@email.com"
                    className="h-11 rounded-none border-border bg-background text-foreground text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="guest-phone"
                    className="text-sm font-semibold text-muted-foreground"
                  >
                    Nomor HP <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="guest-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="h-11 rounded-none border-border bg-background text-foreground text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="guest-password"
                    className="text-sm font-semibold text-muted-foreground"
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
                      className="h-11 rounded-none border-border bg-background text-foreground text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground pt-1">
                    Akun akan dibuat otomatis saat checkout
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="guest-notes"
                    className="text-sm font-semibold text-muted-foreground"
                  >
                    Catatan <span className="font-normal">(opsional)</span>
                  </Label>
                  <textarea
                    id="guest-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan tambahan untuk pesanan"
                    rows={2}
                    className="w-full min-h-[80px] rounded-none border border-border bg-background px-3 py-2 text-sm text-foreground font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Order Summary + Payment + Button ── */}
        <div className="space-y-6">
          {/* ── Order Summary with Cart Editing ── */}
          <div className="rounded-none border border-border bg-background p-6">
            <h2 className="text-lg font-bold text-foreground tracking-tight mb-5">
              Ringkasan Pesanan
            </h2>
            <ul className="divide-y divide-border">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="relative w-14 h-14 flex-shrink-0 rounded-none overflow-hidden bg-muted/30 border border-border">
                    {item.thumbnail_url ? (
                      <Image
                        src={item.thumbnail_url}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                      {item.title}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground mt-1">
                      Rp {Number(item.price).toLocaleString("id-ID")}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => handleDecrease(item.id, item.quantity)}
                        className="w-7 h-7 flex items-center justify-center rounded-none border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title={item.quantity <= 1 ? "Hapus" : "Kurangi"}
                      >
                        {item.quantity <= 1 ? (
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        ) : (
                          <Minus className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <span className="text-sm font-semibold text-foreground w-6 text-center tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-none border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Tambah"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto p-1.5 rounded-none text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Hapus produk"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-foreground whitespace-nowrap self-start pt-0.5">
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">
                Total ({cartCount} item)
              </span>
              <span className="text-lg font-bold text-primary">
                Rp {subtotal.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* ── Payment Method Selection ── */}

          {/* Gateway mode: individual methods */}
          {paymentConfig?.mode === "gateway" &&
            paymentConfig.gateway_methods &&
            paymentConfig.gateway_methods.length > 0 && (
              <div className="rounded-none border border-border bg-background p-6">
                <h2 className="text-lg font-bold text-foreground tracking-tight mb-2">
                  Metode Pembayaran
                </h2>
                {paymentConfig.active_gateway && (
                  <p className="text-sm font-medium text-muted-foreground mb-5">
                    via {paymentConfig.active_gateway.display_name}
                  </p>
                )}
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {paymentConfig.gateway_methods.map((method) => (
                    <label
                      key={method.code}
                      className={`flex items-center gap-4 rounded-none border p-4 cursor-pointer transition-all ${
                        selectedGatewayMethod === method.code
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-background hover:border-primary/50 hover:bg-muted/10"
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
                        className="accent-primary w-4 h-4 flex-shrink-0"
                      />
                      <span className="text-lg flex-shrink-0">
                        {method.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {method.label}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground mt-0.5">
                          {method.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

          {/* Manual mode: manual payment methods */}
          {paymentConfig?.mode === "manual" &&
            paymentConfig.manual_methods &&
            paymentConfig.manual_methods.length > 0 && (
              <div className="rounded-none border border-border bg-background p-6">
                <h2 className="text-lg font-bold text-foreground tracking-tight mb-5">
                  Pilih Metode Pembayaran
                </h2>
                <div className="space-y-3">
                  {paymentConfig.manual_methods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 rounded-none border p-4 cursor-pointer transition-all ${
                        selectedManualMethodId === method.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-background hover:border-primary/50 hover:bg-muted/10"
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
                        className="accent-primary w-4 h-4 flex-shrink-0"
                      />
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-xl flex-shrink-0">
                          {method.type === "bank_transfer" ? "🏦" : "📱"}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {method.provider_name}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground mt-0.5">
                            {method.account_name} • {method.account_number}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

          {/* Error message */}
          {error && (
            <div className="rounded-none bg-destructive/10 p-4 text-sm font-medium text-destructive border border-destructive/20 space-y-1.5">
              <p>{error}</p>
              {error.includes("login") && (
                <button
                  onClick={() => router.push("/login?redirectTo=/checkout")}
                  className="text-primary hover:text-primary/80 font-bold underline transition-colors block"
                >
                  Login sekarang →
                </button>
              )}
            </div>
          )}

          {/* Pay button */}
          <div className="space-y-4 pt-2">
            <Button
              onClick={handleCheckout}
              disabled={loading || cartItems.length === 0}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-none shadow-none h-11 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  {user ? "Bayar Sekarang" : "Daftar & Bayar"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {!user && (
              <p className="text-sm font-semibold text-muted-foreground text-center">
                Sudah punya akun?{" "}
                <button
                  onClick={() => router.push("/login?redirectTo=/checkout")}
                  className="text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  Masuk di sini
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
