"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  saveGatewayConfig,
  setActiveGateway,
  setPaymentMode,
  saveManualMethod,
  deleteManualMethod,
  toggleManualMethod,
} from "./actions";
import {
  CheckCircle,
  AlertCircle,
  Zap,
  HandCoins,
  Trash2,
  Plus,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

type GatewayConfig = {
  id: string;
  gateway_name: string;
  display_name: string;
  api_key: string;
  secret_key: string;
  merchant_id: string | null;
  environment: string;
  is_active: boolean;
  payment_mode: string;
  webhook_url: string | null;
  updated_at: string;
};

type ManualMethod = {
  id: string;
  type: string;
  provider_name: string;
  account_name: string;
  account_number: string;
  logo_url: string | null;
  is_active: boolean;
  sort_order: number;
};

interface PaymentFormProps {
  configs: GatewayConfig[];
  manualMethods: ManualMethod[];
  currentMode: string;
}

// Common Style Variable untuk Input
const inputClass =
  "h-11 rounded-2xl border border-border/50 bg-background/50 px-4 py-2 text-sm text-foreground font-semibold placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm";

export function PaymentForm({
  configs,
  manualMethods,
  currentMode,
}: PaymentFormProps) {
  const [mode, setMode] = useState(currentMode);
  const [activeTab, setActiveTab] = useState<string>(
    configs.find((c) => c.is_active)?.gateway_name ||
      configs[0]?.gateway_name ||
      "midtrans",
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Manual method form state
  const [showManualForm, setShowManualForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ManualMethod | null>(null);

  function showMessage(msg: string, isError = false) {
    if (isError) {
      setError(msg);
      setSuccess(null);
    } else {
      setSuccess(msg);
      setError(null);
    }
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 3000);
  }

  // ── Handle mode toggle ──
  function handleModeChange(newMode: string) {
    setMode(newMode);
    startTransition(async () => {
      const result = await setPaymentMode(newMode);
      if (result?.error) showMessage(result.error, true);
      else
        showMessage(
          `Mode pembayaran berhasil diubah ke ${newMode === "gateway" ? "Gateway" : "Manual"}`,
        );
    });
  }

  // ── Handle gateway save ──
  function handleSaveGateway(formData: FormData) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await saveGatewayConfig(formData);
      if (result?.error) showMessage(result.error, true);
      else showMessage("Konfigurasi gateway berhasil disimpan!");
    });
  }

  // ── Handle set active gateway ──
  function handleSetActive(gatewayId: string) {
    startTransition(async () => {
      const result = await setActiveGateway(gatewayId);
      if (result?.error) showMessage(result.error, true);
      else showMessage("Gateway aktif berhasil diubah!");
    });
  }

  // ── Handle manual method save ──
  function handleSaveManualMethod(formData: FormData) {
    startTransition(async () => {
      const result = await saveManualMethod(formData);
      if (result?.error) showMessage(result.error, true);
      else {
        showMessage("Metode pembayaran manual berhasil disimpan!");
        setShowManualForm(false);
        setEditingMethod(null);
      }
    });
  }

  // ── Handle delete manual method ──
  function handleDeleteManualMethod(id: string) {
    if (!confirm("Hapus metode pembayaran ini?")) return;
    startTransition(async () => {
      const result = await deleteManualMethod(id);
      if (result?.error) showMessage(result.error, true);
      else showMessage("Metode pembayaran berhasil dihapus!");
    });
  }

  // ── Handle toggle manual method ──
  function handleToggleManualMethod(id: string, currentActive: boolean) {
    startTransition(async () => {
      const result = await toggleManualMethod(id, !currentActive);
      if (result?.error) showMessage(result.error, true);
      else
        showMessage(
          `Metode ${!currentActive ? "diaktifkan" : "dinonaktifkan"}!`,
        );
    });
  }

  const currentConfig = configs.find((c) => c.gateway_name === activeTab);

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      {/* ── Status Messages ── */}
      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive flex items-center gap-2.5 animate-in fade-in zoom-in-95">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm font-bold text-green-600 flex items-center gap-2.5 animate-in fade-in zoom-in-95">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* ══════════════════════════════════════
          SECTION 1: Payment Mode Toggle
         ══════════════════════════════════════ */}
      <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-1.5 h-6 bg-primary rounded-full block flex-shrink-0" />
          <h2 className="text-xl font-black text-foreground tracking-tight">
            Mode Pembayaran
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => handleModeChange("gateway")}
            disabled={isPending}
            className={`flex-1 flex items-center justify-center gap-2.5 rounded-2xl border px-4 py-3.5 text-sm font-bold transition-all ${
              mode === "gateway"
                ? "border-primary/50 bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                : "border-border/50 bg-background/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <Zap className="h-5 w-5" />
            Gateway Mode
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("manual")}
            disabled={isPending}
            className={`flex-1 flex items-center justify-center gap-2.5 rounded-2xl border px-4 py-3.5 text-sm font-bold transition-all ${
              mode === "manual"
                ? "border-amber-500/40 bg-amber-500/10 text-amber-600 shadow-sm ring-1 ring-amber-500/20"
                : "border-border/50 bg-background/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <HandCoins className="h-5 w-5" />
            Manual Mode
          </button>
        </div>
        <p className="text-[13px] font-medium text-muted-foreground mt-4 ml-1">
          {mode === "gateway"
            ? "💳 Pembayaran diproses otomatis melalui payment gateway (Midtrans / Duitku)."
            : "🏦 Pembayaran manual — pelanggan melakukan transfer dan konfirmasi secara manual."}
        </p>
      </div>

      {/* ══════════════════════════════════════
          SECTION 2: Gateway Mode Panel
         ══════════════════════════════════════ */}
      {mode === "gateway" && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Gateway Tabs */}
          <div className="flex flex-wrap gap-2.5">
            {configs.map((config) => (
              <button
                key={config.gateway_name}
                type="button"
                onClick={() => setActiveTab(config.gateway_name)}
                className={`flex items-center gap-2.5 rounded-2xl border px-5 py-3 text-sm font-bold transition-all ${
                  activeTab === config.gateway_name
                    ? "border-primary/50 bg-primary/10 text-primary shadow-sm"
                    : "border-border/40 bg-card/60 backdrop-blur-md text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {config.display_name}
                {config.is_active && (
                  <Badge className="bg-primary text-primary-foreground border-transparent text-[10px] px-2 py-0.5 rounded-full shadow-sm ml-1">
                    Aktif
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {/* Gateway Config Form */}
          {currentConfig && (
            <form action={handleSaveGateway} className="space-y-4">
              <input type="hidden" name="id" value={currentConfig.id} />
              <input
                type="hidden"
                name="gateway_name"
                value={currentConfig.gateway_name}
              />

              <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-primary rounded-full block flex-shrink-0" />
                    <h2 className="text-xl font-black text-foreground tracking-tight">
                      Konfigurasi {currentConfig.display_name}
                    </h2>
                  </div>
                  {currentConfig.is_active ? (
                    <Badge className="bg-green-500/10 text-green-600 border border-green-500/20 px-3 py-1.5 rounded-full font-bold shadow-none text-xs">
                      ✅ Gateway Aktif
                    </Badge>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetActive(currentConfig.id)}
                      disabled={isPending}
                      className="rounded-xl border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 hover:text-primary font-bold shadow-none transition-all h-9 px-4"
                    >
                      Jadikan Aktif
                    </Button>
                  )}
                </div>

                <div className="space-y-2.5">
                  <Label
                    htmlFor="display_name"
                    className="text-foreground font-bold"
                  >
                    Nama Tampilan
                  </Label>
                  <Input
                    id="display_name"
                    name="display_name"
                    defaultValue={currentConfig.display_name}
                    required
                    placeholder="Contoh: Midtrans"
                    className={inputClass}
                  />
                </div>

                {/* Environment Toggle */}
                <EnvironmentToggle defaultValue={currentConfig.environment} />

                {/* API Keys */}
                <div className="pt-4 border-t border-border/40 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-foreground">
                      API Keys
                    </h3>
                    <Badge
                      variant="outline"
                      className="rounded-full border-border/50 bg-muted/40 text-muted-foreground text-[10px] font-semibold"
                    >
                      🔒 Tersimpan aman
                    </Badge>
                  </div>

                  <div className="space-y-2.5">
                    <Label
                      htmlFor="api_key"
                      className="text-foreground font-bold"
                    >
                      API Key / Client Key
                    </Label>
                    <Input
                      id="api_key"
                      name="api_key"
                      type="password"
                      defaultValue={currentConfig.api_key}
                      placeholder="Client key..."
                      className={`font-mono ${inputClass}`}
                    />
                  </div>

                  <div className="space-y-2.5">
                    <Label
                      htmlFor="secret_key"
                      className="text-foreground font-bold"
                    >
                      Secret Key / Server Key
                    </Label>
                    <Input
                      id="secret_key"
                      name="secret_key"
                      type="password"
                      defaultValue={currentConfig.secret_key}
                      placeholder="Server key..."
                      className={`font-mono ${inputClass}`}
                    />
                  </div>

                  <div className="space-y-2.5">
                    <Label
                      htmlFor="merchant_id"
                      className="text-foreground font-bold"
                    >
                      Merchant ID{" "}
                      <span className="text-muted-foreground/60 font-medium text-xs ml-1">
                        (Opsional)
                      </span>
                    </Label>
                    <Input
                      id="merchant_id"
                      name="merchant_id"
                      defaultValue={currentConfig.merchant_id || ""}
                      placeholder="Merchant ID..."
                      className={`font-mono ${inputClass}`}
                    />
                  </div>
                </div>

                {/* Last Updated */}
                {currentConfig.updated_at && (
                  <p className="text-[11px] font-medium text-muted-foreground text-right pt-2 border-t border-border/40">
                    Diperbarui:{" "}
                    {new Date(currentConfig.updated_at).toLocaleDateString(
                      "id-ID",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-sm active:scale-[0.98] transition-all"
                disabled={isPending}
              >
                {isPending ? "Menyimpan..." : "Simpan Konfigurasi"}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          SECTION 3: Manual Mode Panel
         ══════════════════════════════════════ */}
      {mode === "manual" && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 bg-amber-500 rounded-full block flex-shrink-0" />
                <h2 className="text-xl font-black text-foreground tracking-tight">
                  Metode Pembayaran Manual
                </h2>
              </div>
              <Button
                type="button"
                onClick={() => {
                  setEditingMethod(null);
                  setShowManualForm(true);
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm rounded-2xl gap-2 h-10 px-4 transition-all active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                Tambah Rekening
              </Button>
            </div>

            {/* Methods List */}
            {manualMethods.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border/50 bg-background/30 p-10 text-center">
                <p className="text-sm font-bold text-foreground">
                  Belum ada metode pembayaran manual.
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-1.5">
                  Klik tombol "Tambah Rekening" di atas untuk menambahkan.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {manualMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                      method.is_active
                        ? "border-border/50 bg-background/60 shadow-sm"
                        : "border-border/30 bg-muted/20 opacity-70"
                    }`}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white border border-border/50 flex items-center justify-center overflow-hidden shadow-sm p-1.5">
                      {method.logo_url ? (
                        <Image
                          src={method.logo_url}
                          alt={method.provider_name}
                          width={40}
                          height={40}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xl">
                          {method.type === "bank_transfer" ? "🏦" : "📱"}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                        <p className="text-sm font-bold text-foreground truncate">
                          {method.provider_name}
                        </p>
                        <Badge
                          variant="outline"
                          className={`w-fit text-[10px] px-2 py-0.5 rounded-full font-bold shadow-none border ${
                            method.type === "bank_transfer"
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                          }`}
                        >
                          {method.type === "bank_transfer"
                            ? "Bank Transfer"
                            : "E-Wallet"}
                        </Badge>
                      </div>
                      <p className="text-[12px] font-medium text-muted-foreground mt-1">
                        {method.account_name} —{" "}
                        <span className="font-mono text-foreground font-bold">
                          {method.account_number}
                        </span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleManualMethod(method.id, method.is_active)
                        }
                        disabled={isPending}
                        className="p-2 rounded-xl hover:bg-muted/80 transition-colors"
                        title={method.is_active ? "Nonaktifkan" : "Aktifkan"}
                      >
                        {method.is_active ? (
                          <ToggleRight className="h-6 w-6 text-green-500 drop-shadow-sm" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMethod(method);
                          setShowManualForm(true);
                        }}
                        className="p-2 rounded-xl hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteManualMethod(method.id)}
                        disabled={isPending}
                        className="p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Add/Edit Manual Method Form ── */}
          {showManualForm && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <ManualMethodForm
                method={editingMethod}
                onSubmit={handleSaveManualMethod}
                onCancel={() => {
                  setShowManualForm(false);
                  setEditingMethod(null);
                }}
                isPending={isPending}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Environment Toggle Sub-Component ──
function EnvironmentToggle({ defaultValue }: { defaultValue: string }) {
  const [environment, setEnvironment] = useState(defaultValue);

  return (
    <div className="space-y-3">
      <Label className="text-foreground font-bold">Environment Gateway</Label>
      <input type="hidden" name="environment" value={environment} />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setEnvironment("sandbox")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 text-sm font-bold transition-all ${
            environment === "sandbox"
              ? "border-orange-500/40 bg-orange-500/10 text-orange-600 shadow-sm ring-1 ring-orange-500/20"
              : "border-border/50 bg-background/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          🧪 Sandbox
        </button>
        <button
          type="button"
          onClick={() => setEnvironment("production")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 text-sm font-bold transition-all ${
            environment === "production"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 shadow-sm ring-1 ring-emerald-500/20"
              : "border-border/50 bg-background/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          🚀 Production
        </button>
      </div>
      {environment === "production" && (
        <p className="text-[11px] text-orange-600 font-bold ml-1 flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3" />
          Perhatian: Mode production akan memproses tagihan & pembayaran nyata.
        </p>
      )}
    </div>
  );
}

// ── Manual Method Form Sub-Component ──
function ManualMethodForm({
  method,
  onSubmit,
  onCancel,
  isPending,
}: {
  method: ManualMethod | null;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [type, setType] = useState(method?.type || "bank_transfer");

  return (
    <form
      action={onSubmit}
      className="rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8 shadow-sm space-y-5 relative"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="w-1.5 h-5 bg-primary rounded-full block flex-shrink-0" />
        <h3 className="text-lg font-black text-foreground">
          {method ? "Edit Metode Pembayaran" : "Tambah Metode Pembayaran"}
        </h3>
      </div>

      {method && <input type="hidden" name="id" value={method.id} />}

      {/* Type selector */}
      <div className="space-y-2.5">
        <Label className="text-foreground font-bold">Tipe Provider</Label>
        <input type="hidden" name="type" value={type} />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setType("bank_transfer")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 text-sm font-bold transition-all ${
              type === "bank_transfer"
                ? "border-blue-500/40 bg-blue-500/10 text-blue-600 shadow-sm ring-1 ring-blue-500/20"
                : "border-border/50 bg-background/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            🏦 Bank Transfer
          </button>
          <button
            type="button"
            onClick={() => setType("ewallet")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 text-sm font-bold transition-all ${
              type === "ewallet"
                ? "border-purple-500/40 bg-purple-500/10 text-purple-600 shadow-sm ring-1 ring-purple-500/20"
                : "border-border/50 bg-background/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            📱 E-Wallet
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="provider_name" className="text-foreground font-bold">
          {type === "bank_transfer" ? "Nama Bank" : "Nama Provider"}
        </Label>
        <Input
          id="provider_name"
          name="provider_name"
          defaultValue={method?.provider_name || ""}
          required
          placeholder={
            type === "bank_transfer"
              ? "Contoh: BCA, BNI, Mandiri"
              : "Contoh: GoPay, OVO, Dana"
          }
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2.5">
          <Label htmlFor="account_name" className="text-foreground font-bold">
            {type === "bank_transfer" ? "Nama Pemilik Rekening" : "Nama Akun"}
          </Label>
          <Input
            id="account_name"
            name="account_name"
            defaultValue={method?.account_name || ""}
            required
            placeholder="Sesuai buku tabungan/akun"
            className={inputClass}
          />
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="account_number" className="text-foreground font-bold">
            {type === "bank_transfer" ? "Nomor Rekening" : "Nomor HP / ID"}
          </Label>
          <Input
            id="account_number"
            name="account_number"
            defaultValue={method?.account_number || ""}
            required
            placeholder={
              type === "bank_transfer" ? "1234567890" : "08xxxxxxxxxx"
            }
            className={`font-mono ${inputClass}`}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2.5">
          <Label htmlFor="logo_url" className="text-foreground font-bold">
            URL Logo / QR Code{" "}
            <span className="text-muted-foreground/60 font-medium text-xs ml-1">
              (Opsional)
            </span>
          </Label>
          <Input
            id="logo_url"
            name="logo_url"
            defaultValue={method?.logo_url || ""}
            placeholder="https://..."
            className={inputClass}
          />
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="sort_order" className="text-foreground font-bold">
            Urutan Tampilan
          </Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={method?.sort_order || 0}
            className={`sm:max-w-32 ${inputClass}`}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-primary/10">
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-black flex-1 h-12 rounded-2xl shadow-sm transition-all active:scale-[0.98]"
          disabled={isPending}
        >
          {isPending
            ? "Menyimpan..."
            : method
              ? "Simpan Perubahan"
              : "Tambahkan Sekarang"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-primary/20 text-muted-foreground font-bold hover:bg-primary/10 hover:text-primary hover:border-primary/30 h-12 rounded-2xl sm:w-32 transition-all"
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
