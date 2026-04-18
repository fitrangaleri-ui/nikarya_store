import { createAdminClient } from "@/lib/supabase/admin";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import { Typography } from "@/components/ui/typography";
import { StickyHeader } from "../sticky-header";
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

  const gatewayCount = configs?.length || 0;
  const manualCount = manualMethods?.length || 0;

  return (
    <div className="w-full max-w-full overflow-x-hidden pb-10">
      {/* ── Sticky Header ── */}
      <StickyHeader
        title="Metode Bayar"
        description={`${gatewayCount} gateway · ${manualCount} metode manual`}
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
            <CreditCardIcon className="h-5 w-5 text-white" />
          </div>
        </div>
      </StickyHeader>

      {/* ── Content ── */}
      <div className="p-4 sm:p-6 md:p-8 space-y-5 md:space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 sm:gap-5 grid-cols-2">
          {/* Gateway Count */}
          <div className="rounded-xl bg-card border border-border px-5 py-5 overflow-hidden hover:border-primary/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <Typography variant="caption" as="span" color="muted" className="font-semibold uppercase tracking-widest">
                Gateway
              </Typography>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCardIcon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <Typography variant="h3" as="p" className="tracking-tight">
              {gatewayCount}
            </Typography>
            <Typography variant="caption" color="muted" className="mt-1">
              {configs?.filter((c: { is_active: boolean }) => c.is_active).length || 0} aktif
            </Typography>
          </div>

          {/* Manual Methods Count */}
          <div className="rounded-xl bg-card border border-border px-5 py-5 overflow-hidden hover:border-primary/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <Typography variant="caption" as="span" color="muted" className="font-semibold uppercase tracking-widest">
                Manual
              </Typography>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCardIcon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <Typography variant="h3" as="p" className="tracking-tight">
              {manualCount}
            </Typography>
            <Typography variant="caption" color="muted" className="mt-1">
              {manualMethods?.filter((m: { is_active: boolean }) => m.is_active).length || 0} aktif
            </Typography>
          </div>
        </div>

        {/* ── Main Form Content ── */}
        <PaymentForm
          configs={configs || []}
          manualMethods={manualMethods || []}
          currentMode={paymentMode}
        />
      </div>
    </div>
  );
}
