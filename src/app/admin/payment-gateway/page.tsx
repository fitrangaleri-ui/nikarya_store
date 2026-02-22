import { createAdminClient } from '@/lib/supabase/admin'
import { CreditCard } from 'lucide-react'
import { PaymentForm } from './payment-form'

export const dynamic = 'force-dynamic'

export default async function PaymentGatewayPage() {
    const admin = createAdminClient()

    // Fetch all gateway configs
    const { data: configs } = await admin
        .from('payment_gateway_config')
        .select('*')
        .order('gateway_name')

    // Fetch all manual payment methods
    const { data: manualMethods } = await admin
        .from('manual_payment_methods')
        .select('*')
        .order('sort_order')

    // Determine current payment mode from the active config
    const activeConfig = configs?.find((c: { is_active: boolean }) => c.is_active)
    const paymentMode = activeConfig?.payment_mode || 'gateway'

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-blue-600" />
                    Payment Gateway
                </h1>
                <p className="text-slate-500 mt-1">
                    Atur konfigurasi payment gateway dan metode pembayaran manual.
                </p>
            </div>

            <PaymentForm
                configs={configs || []}
                manualMethods={manualMethods || []}
                currentMode={paymentMode}
            />
        </div>
    )
}
