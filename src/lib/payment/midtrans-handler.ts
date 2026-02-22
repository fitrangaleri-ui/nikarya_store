import type { PaymentGatewayConfig, PaymentRequest, PaymentHandler, GatewayTransactionResult } from "./types";

/**
 * Maps our frontend method codes to Midtrans Core API payment_type + bank/provider.
 */
function resolveChargeParams(methodCode: string): { payment_type: string; additional: Record<string, unknown> } {
    switch (methodCode) {
        case "bca_va":
            return { payment_type: "bank_transfer", additional: { bank_transfer: { bank: "bca" } } };
        case "bni_va":
            return { payment_type: "bank_transfer", additional: { bank_transfer: { bank: "bni" } } };
        case "bri_va":
            return { payment_type: "bank_transfer", additional: { bank_transfer: { bank: "bri" } } };
        case "echannel":
            return {
                payment_type: "echannel",
                additional: {
                    echannel: {
                        bill_info1: "Payment:",
                        bill_info2: "Online Purchase",
                    },
                },
            };
        case "qris":
            return { payment_type: "qris", additional: {} };
        case "gopay":
            return { payment_type: "gopay", additional: {} };
        case "shopeepay":
            return { payment_type: "shopeepay", additional: {} };
        default:
            // Fallback: use the code as payment_type directly
            return { payment_type: methodCode, additional: {} };
    }
}

/**
 * Extracts the payment code (VA number, QR string, deeplink) from a Midtrans charge response.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPaymentCode(response: any, paymentType: string): { code: string; qr_url?: string } {
    // VA numbers
    if (response.va_numbers?.length) {
        return { code: response.va_numbers[0].va_number };
    }
    // Mandiri Bill Payment (echannel)
    if (response.bill_key) {
        return { code: `${response.biller_code} ${response.bill_key}` };
    }
    // Permata VA
    if (response.permata_va_number) {
        return { code: response.permata_va_number };
    }
    // QRIS
    if (paymentType === "qris" && response.actions?.length) {
        const generateAction = response.actions.find((a: { name: string }) => a.name === "generate-qr-code");
        return {
            code: response.qr_string || "",
            qr_url: generateAction?.url || undefined,
        };
    }
    // GoPay
    if (paymentType === "gopay" && response.actions?.length) {
        const qrAction = response.actions.find((a: { name: string }) => a.name === "generate-qr-code");
        const deeplinkAction = response.actions.find((a: { name: string }) => a.name === "deeplink-redirect");
        return {
            code: deeplinkAction?.url || "",
            qr_url: qrAction?.url || undefined,
        };
    }
    // ShopeePay
    if (paymentType === "shopeepay" && response.actions?.length) {
        const deeplinkAction = response.actions.find((a: { name: string }) => a.name === "deeplink-redirect");
        return { code: deeplinkAction?.url || "" };
    }
    return { code: "" };
}

/**
 * Midtrans Core API handler.
 * Uses POST /v2/charge instead of Snap API.
 */
export const midtransHandler: PaymentHandler = {
    name: "midtrans",

    async createTransaction(
        config: PaymentGatewayConfig,
        request: PaymentRequest,
        gatewayMethodCode?: string,
    ): Promise<GatewayTransactionResult> {
        const methodCode = gatewayMethodCode || request.paymentMethod || "qris";
        const { payment_type, additional } = resolveChargeParams(methodCode);

        const isProduction = config.environment === "production";
        const baseUrl = isProduction
            ? "https://api.midtrans.com"
            : "https://api.sandbox.midtrans.com";

        const chargePayload = {
            payment_type,
            transaction_details: {
                order_id: request.orderId,
                gross_amount: request.grossAmount,
            },
            item_details: request.items.map((item) => ({
                id: item.id,
                price: item.price,
                quantity: item.quantity,
                name: item.name.substring(0, 50),
            })),
            customer_details: {
                email: request.customer.email,
                first_name: request.customer.firstName,
                phone: request.customer.phone || undefined,
            },
            ...additional,
        };

        const response = await fetch(`${baseUrl}/v2/charge`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Basic ${Buffer.from(config.secret_key + ":").toString("base64")}`,
            },
            body: JSON.stringify(chargePayload),
        });

        const data = await response.json();

        if (!response.ok || (data.status_code && !["200", "201"].includes(data.status_code))) {
            console.error("Midtrans Core API error:", data);
            throw new Error(data.status_message || "Midtrans charge failed");
        }

        const { code, qr_url } = extractPaymentCode(data, payment_type);

        return {
            transaction_id: data.transaction_id,
            payment_type: data.payment_type,
            payment_code: code,
            expiry_time: data.expiry_time,
            qr_url,
        };
    },
};
