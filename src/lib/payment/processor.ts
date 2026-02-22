import { createAdminClient } from "@/lib/supabase/admin";
import type {
    PaymentGatewayConfig,
    PaymentRequest,
    PaymentResult,
    PaymentHandler,
} from "./types";
import { midtransHandler } from "./midtrans-handler";
import { duitkuHandler } from "./duitku-handler";
import { getManualPaymentMethods } from "./manual-handler";

// Registry of supported gateway handlers
const handlers: Record<string, PaymentHandler> = {
    midtrans: midtransHandler,
    duitku: duitkuHandler,
};

/**
 * Get the currently active payment configuration from the database.
 */
export async function getActivePaymentConfig(): Promise<PaymentGatewayConfig | null> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("payment_gateway_config")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Failed to fetch active payment config:", error);
        return null;
    }

    return data as PaymentGatewayConfig | null;
}

/**
 * Get the current payment mode from the active config.
 */
export async function getPaymentMode(): Promise<"gateway" | "manual"> {
    const config = await getActivePaymentConfig();
    return (config?.payment_mode as "gateway" | "manual") || "gateway";
}

/**
 * Unified payment processor.
 * Reads active config → selects handler → returns result.
 */
export async function processPayment(
    request: PaymentRequest,
    gatewayMethodCode?: string,
): Promise<PaymentResult> {
    const config = await getActivePaymentConfig();

    if (!config) {
        throw new Error("Konfigurasi pembayaran belum diatur. Hubungi admin.");
    }

    const mode = config.payment_mode as "gateway" | "manual";

    // ── Manual Mode ──
    if (mode === "manual") {
        const methods = await getManualPaymentMethods();
        return {
            mode: "manual",
            manual_methods: methods,
            order_id: request.orderId,
        };
    }

    // ── Gateway Mode ──
    const handler = handlers[config.gateway_name];
    if (!handler) {
        throw new Error(`Gateway "${config.gateway_name}" tidak didukung. Hubungi admin.`);
    }

    if (!config.api_key || !config.secret_key) {
        throw new Error(`Kredensial gateway "${config.display_name}" belum dikonfigurasi. Hubungi admin.`);
    }

    const result = await handler.createTransaction(config, request, gatewayMethodCode);

    return {
        mode: "gateway",
        gateway_name: config.gateway_name,
        transaction_id: result.transaction_id,
        payment_type: result.payment_type,
        payment_code: result.payment_code,
        expiry_time: result.expiry_time,
        redirect_url: result.redirect_url,
        qr_url: result.qr_url,
        order_id: request.orderId,
    };
}
