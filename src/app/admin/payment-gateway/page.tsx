import { createAdminClient } from "@/lib/supabase/admin";
import { CreditCard } from "lucide-react";
import { PaymentForm } from "./payment-form";

export const dynamic = "force-dynamic";

export default async function PaymentGatewayPage() {
  const admin = createAdminClient();

  // Fetch all gateway configs
  const { data: configs } = await admin
    .from("payment_gateway_config")
    .select("*")
    .order("gateway_name");

  // Fetch all manual payment methods
  const { data: manualMethods } = await admin
    .from("manual_payment_methods")
    .select("*")
    .order("sort_order");

  // Determine current payment mode from the active config
  const activeConfig = configs?.find(
    (c: { is_active: boolean }) => c.is_active,
  );
  const paymentMode = activeConfig?.payment_mode || "gateway";

  return (
    // PENGUNCIAN UTAMA: Cegah overflow horizontal di perangkat seluler
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-full overflow-hidden pb-10">
      {/* ── Header — Primary banner ── */}
      <div className="relative rounded-3xl overflow-hidden bg-primary px-6 py-8 md:px-10 shadow-lg shadow-primary/20 w-full">
        <div aria-hidden className="absolute -top-10 -right-10 w-64 h-64 rounded-full pointer-events-none blur-[80px]" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div aria-hidden className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full pointer-events-none blur-[60px]" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)" }} />
        <div aria-hidden className="absolute inset-0 rounded-3xl pointer-events-none" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-white/15 text-primary-foreground text-[11px] font-bold uppercase tracking-[-0.005em] mb-3">
              <CreditCard className="w-3 h-3" />
              Pengaturan
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-primary-foreground leading-tight tracking-tight">
              Metode Bayar
            </h1>
            <p className="mt-1.5 text-sm text-primary-foreground/70 leading-relaxed">
              Atur konfigurasi payment gateway dan rekening/e-wallet manual.
            </p>
          </div>

          <div className="hidden md:flex shrink-0 w-14 h-14 rounded-2xl bg-white/15 items-center justify-center border border-white/20">
            <CreditCard className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
      </div>

      {/* ── Konten / Form Utama ── */}
      {/* Pembungkus w-full digunakan agar child (PaymentForm) ikut mengunci pada lebar device */}
      <div className="w-full relative">
        <PaymentForm
          configs={configs || []}
          manualMethods={manualMethods || []}
          currentMode={paymentMode}
        />
      </div>
    </div>
  );
}
