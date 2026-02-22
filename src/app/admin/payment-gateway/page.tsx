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
      {/* ── Header ── */}
      <div className="w-full pr-4">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="w-1.5 h-8 md:h-9 bg-primary rounded-full block flex-shrink-0" />
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground flex items-center gap-3 truncate">
            <div className="hidden sm:flex w-10 h-10 rounded-2xl bg-primary/10 items-center justify-center flex-shrink-0">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            Metode Bayar
          </h1>
        </div>
        <p className="mt-1.5 text-sm font-medium text-muted-foreground ml-5 sm:ml-[4.5rem]">
          Atur konfigurasi payment gateway dan rekening/e-wallet manual.
        </p>
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
