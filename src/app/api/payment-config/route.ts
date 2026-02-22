import { NextResponse } from "next/server";
import { getActivePaymentConfig } from "@/lib/payment/processor";
import { getManualPaymentMethods } from "@/lib/payment/manual-handler";

/**
 * Gateway-specific payment method definitions.
 * Each method has a code (sent to the gateway handler) and display info.
 */
const MIDTRANS_METHODS = [
    { code: "bca_va", label: "BCA Virtual Account", description: "Transfer via BCA VA", icon: "🏦" },
    { code: "bni_va", label: "BNI Virtual Account", description: "Transfer via BNI VA", icon: "🏦" },
    { code: "bri_va", label: "BRI Virtual Account", description: "Transfer via BRI VA", icon: "🏦" },
    { code: "echannel", label: "Mandiri Virtual Account", description: "Transfer via Mandiri Bill Payment", icon: "🏦" },
    { code: "qris", label: "QRIS", description: "Scan QR untuk bayar", icon: "📲" },
    { code: "gopay", label: "GoPay", description: "Bayar dengan GoPay", icon: "📱" },
    { code: "shopeepay", label: "ShopeePay", description: "Bayar dengan ShopeePay", icon: "📱" },
];

const DUITKU_METHODS = [
    { code: "BC", label: "BCA Virtual Account", description: "Transfer via BCA VA", icon: "🏦" },
    { code: "M2", label: "Mandiri Virtual Account", description: "Transfer via Mandiri VA", icon: "🏦" },
    { code: "I1", label: "BNI Virtual Account", description: "Transfer via BNI VA", icon: "🏦" },
    { code: "BR", label: "BRI Virtual Account", description: "Transfer via BRI VA", icon: "🏦" },
    { code: "SP", label: "QRIS", description: "Scan QR untuk bayar", icon: "📲" },
    { code: "OV", label: "OVO", description: "Bayar dengan OVO", icon: "📱" },
    { code: "DA", label: "DANA", description: "Bayar dengan DANA", icon: "📱" },
    { code: "SA", label: "ShopeePay", description: "Bayar dengan ShopeePay", icon: "📱" },
];

/**
 * Public endpoint returning the active payment mode and configuration.
 * Used by the checkout page to determine its behavior.
 */
export async function GET() {
    try {
        const config = await getActivePaymentConfig();

        if (!config) {
            return NextResponse.json({
                mode: "gateway",
                active_gateway: null,
                gateway_methods: [],
                manual_methods: [],
            });
        }

        const mode = config.payment_mode as "gateway" | "manual";
        const response: Record<string, unknown> = { mode };

        if (mode === "gateway") {
            response.active_gateway = {
                name: config.gateway_name,
                display_name: config.display_name,
            };

            // Return gateway-specific methods
            if (config.gateway_name === "midtrans") {
                response.gateway_methods = MIDTRANS_METHODS;
            } else if (config.gateway_name === "duitku") {
                response.gateway_methods = DUITKU_METHODS;
            } else {
                response.gateway_methods = [];
            }
        } else {
            const methods = await getManualPaymentMethods();
            response.manual_methods = methods;
        }

        return NextResponse.json(response);
    } catch (err) {
        console.error("Payment config error:", err);
        return NextResponse.json(
            { error: "Failed to fetch payment config" },
            { status: 500 },
        );
    }
}
