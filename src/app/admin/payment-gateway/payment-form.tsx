"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import {
  saveGatewayConfig,
  setActiveGateway,
  setPaymentMode,
  saveManualMethod,
  deleteManualMethod,
  toggleManualMethod,
} from "./actions";
import {
  BoltIcon,
  BanknotesIcon,
  TrashIcon,
  PlusIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

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
  "h-11 rounded-sm border border-border/70 bg-background/50 px-4 py-2 text-sm text-foreground font-semibold placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background outline-none transition-all box-border";

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
    <div className="space-y-5 md:space-y-6">
      {/* ── Status Messages ── */}
      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive flex items-center gap-2.5 animate-in fade-in zoom-in-95">
          <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm font-bold text-primary flex items-center gap-2.5 animate-in fade-in zoom-in-95">
          <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* ══════════════════════════════════════
          SECTION 1: Payment Mode Toggle
         ══════════════════════════════════════ */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-primary px-5 py-4 md:px-7 md:py-5 border-b border-primary-bg/20">
          <Typography variant="h6" as="h2" className="text-white font-bold">
            Mode Pembayaran
          </Typography>
        </div>
        <div className="p-5 md:p-7">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => handleModeChange("gateway")}
              disabled={isPending}
              className={`flex-1 flex items-center justify-center gap-2.5 rounded-sm border px-4 py-3.5 text-sm font-bold transition-all ${
                mode === "gateway"
                  ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/20"
                  : "border-border/50 bg-background/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <BoltIcon className="h-5 w-5" />
              Gateway Mode
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("manual")}
              disabled={isPending}
              className={`flex-1 flex items-center justify-center gap-2.5 rounded-sm border px-4 py-3.5 text-sm font-bold transition-all ${
                mode === "manual"
                  ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/20"
                  : "border-border/50 bg-background/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <BanknotesIcon className="h-5 w-5" />
              Manual Mode
            </button>
          </div>
          <Typography variant="caption" color="muted" className="font-medium mt-4">
            {mode === "gateway"
              ? "💳 Pembayaran diproses otomatis melalui payment gateway (Midtrans / Duitku)."
              : "🏦 Pembayaran manual — pelanggan melakukan transfer dan konfirmasi secara manual."}
          </Typography>
        </div>
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
                className={`flex items-center gap-2.5 rounded-sm border px-5 py-3 text-sm font-bold transition-all ${
                  activeTab === config.gateway_name
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border/50 bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {config.display_name}
                {config.is_active && (
                  <Badge className="bg-primary text-primary-foreground border-transparent text-[10px] px-2 py-0.5 rounded-full shadow-none ml-1">
                    Aktif
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {/* Gateway Config Form */}
          {currentConfig && (
            <form action={handleSaveGateway} className="space-y-5">
              <input type="hidden" name="id" value={currentConfig.id} />
              <input
                type="hidden"
                name="gateway_name"
                value={currentConfig.gateway_name}
              />

              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="bg-primary px-5 py-4 md:px-7 md:py-5 border-b border-primary-bg/20 flex items-center justify-between">
                  <Typography variant="h6" as="h2" className="text-white font-bold">
                    Konfigurasi {currentConfig.display_name}
                  </Typography>
                  {currentConfig.is_active ? (
                    <Badge className="bg-white/15 text-white border border-white/20 px-3 py-1 rounded-full font-bold shadow-none text-xs">
                      ✅ Gateway Aktif
                    </Badge>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetActive(currentConfig.id)}
                      disabled={isPending}
                      className="rounded-full border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white font-bold shadow-none transition-all h-9 px-4"
                    >
                      Jadikan Aktif
                    </Button>
                  )}
                </div>

                <div className="p-5 md:p-7 space-y-5">
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
                  <div className="pt-5 border-t border-border/40 space-y-5">
                    <div className="flex items-center justify-between">
                      <Typography variant="body-sm" className="font-black">
                        API Keys
                      </Typography>
                      <Badge
                        variant="outline"
                        className="rounded-full border-border/50 bg-muted/40 text-muted-foreground text-[10px] font-semibold shadow-none"
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
                    <Typography variant="caption" color="muted" className="text-right pt-4 border-t border-border/40 font-medium block">
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
                    </Typography>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                variant="brand"
                size="lg"
                className="w-full h-12 rounded-full font-black active:scale-[0.98] transition-all"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Konfigurasi"
                )}
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
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="bg-primary px-5 py-4 md:px-7 md:py-5 border-b border-primary-bg/20 flex items-center justify-between">
              <Typography variant="h6" as="h2" className="text-white font-bold">
                Metode Pembayaran Manual
              </Typography>
              <Button
                type="button"
                onClick={() => {
                  setEditingMethod(null);
                  setShowManualForm(true);
                }}
                variant="outline"
                className="rounded-full border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white font-bold shadow-none transition-all h-9 px-4 gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Tambah Rekening
              </Button>
            </div>

            <div className="p-5 md:p-7">
              {/* Methods List */}
              {manualMethods.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <BanknotesIcon className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <Typography variant="body-sm" color="muted" className="font-semibold">
                    Belum ada metode pembayaran manual.
                  </Typography>
                  <Typography variant="caption" color="muted" className="mt-1">
                    Klik tombol &quot;Tambah Rekening&quot; di atas untuk menambahkan.
                  </Typography>
                </div>
              ) : (
                <div className="space-y-3">
                  {manualMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                        method.is_active
                          ? "border-border bg-background/60"
                          : "border-border/30 bg-muted/20 opacity-70"
                      }`}
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white border border-border/50 flex items-center justify-center overflow-hidden p-1.5">
                        {method.logo_url ? (
                          <Image
                            src={method.logo_url}
                            alt={method.provider_name}
                            width={40}
                            height={40}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <BanknotesIcon className="h-6 w-6 text-muted-foreground/40" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                          <Typography variant="body-sm" className="font-bold truncate">
                            {method.provider_name}
                          </Typography>
                          <Badge
                            variant="outline"
                            className={`w-fit text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-none border ${
                              method.type === "bank_transfer"
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-accent/50 text-accent-foreground border-accent-foreground/20"
                            }`}
                          >
                            {method.type === "bank_transfer"
                              ? "Bank Transfer"
                              : "E-Wallet"}
                          </Badge>
                        </div>
                        <Typography variant="caption" color="muted" className="font-medium mt-1">
                          {method.account_name} —{" "}
                          <span className="font-mono text-foreground font-bold">
                            {method.account_number}
                          </span>
                        </Typography>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleManualMethod(method.id, method.is_active)
                          }
                          disabled={isPending}
                          className="p-2 rounded-full hover:bg-muted/80 transition-colors"
                          title={method.is_active ? "Nonaktifkan" : "Aktifkan"}
                        >
                          <Badge
                            className={
                              method.is_active
                                ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-full shadow-none font-bold px-3 py-1 cursor-pointer"
                                : "bg-muted text-muted-foreground border border-border/50 hover:bg-muted/80 rounded-full shadow-none font-bold px-3 py-1 cursor-pointer"
                            }
                          >
                            {method.is_active ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                          onClick={() => {
                            setEditingMethod(method);
                            setShowManualForm(true);
                          }}
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteManualMethod(method.id)}
                          disabled={isPending}
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
          className={`flex-1 flex items-center justify-center gap-2 rounded-sm border px-4 py-3.5 text-sm font-bold transition-all ${
            environment === "sandbox"
              ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/20"
              : "border-border/50 bg-background/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          🧪 Sandbox
        </button>
        <button
          type="button"
          onClick={() => setEnvironment("production")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-sm border px-4 py-3.5 text-sm font-bold transition-all ${
            environment === "production"
              ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/20"
              : "border-border/50 bg-background/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          🚀 Production
        </button>
      </div>
      {environment === "production" && (
        <Typography variant="caption" color="destructive" className="font-bold ml-1 flex items-center gap-1.5">
          <ExclamationCircleIcon className="h-3, w-3" />
          Perhatian: Mode production akan memproses tagihan &amp; pembayaran nyata.
        </Typography>
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
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="bg-primary px-5 py-4 md:px-7 md:py-5 border-b border-primary-bg/20">
        <Typography variant="h6" as="h3" className="text-white font-bold">
          {method ? "Edit Metode Pembayaran" : "Tambah Metode Pembayaran"}
        </Typography>
      </div>

      <div className="p-5 md:p-7 space-y-5">

      {method && <input type="hidden" name="id" value={method.id} />}

      {/* Type selector */}
      <div className="space-y-2.5">
        <Label className="text-foreground font-bold">Tipe Provider</Label>
        <input type="hidden" name="type" value={type} />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setType("bank_transfer")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-sm border px-4 py-3.5 text-sm font-bold transition-all ${
              type === "bank_transfer"
                ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/20"
                : "border-border/50 bg-background/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            🏦 Bank Transfer
          </button>
          <button
            type="button"
            onClick={() => setType("ewallet")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-sm border px-4 py-3.5 text-sm font-bold transition-all ${
              type === "ewallet"
                ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/20"
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
          variant="brand"
          className="flex-1 h-12 rounded-full font-black transition-all active:scale-[0.98]"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : method ? (
            "Simpan Perubahan"
          ) : (
            "Tambahkan Sekarang"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-border/50 text-muted-foreground font-bold hover:bg-muted/50 hover:text-foreground h-12 rounded-full sm:w-32 transition-all"
        >
          Batal
        </Button>
      </div>
      </div>
    </form>
  );
}
