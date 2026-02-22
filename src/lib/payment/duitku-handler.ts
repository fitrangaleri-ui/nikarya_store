import crypto from "crypto";
import type { PaymentGatewayConfig, PaymentRequest, PaymentHandler, GatewayTransactionResult } from "./types";

const DUITKU_SANDBOX_URL = "https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry";
const DUITKU_PRODUCTION_URL = "https://passport.duitku.com/webapi/api/merchant/v2/inquiry";

/**
 * Duitku gateway handler.
 * Calls Duitku API using DB credentials.
 * Returns a redirect URL for the payment page.
 */
export const duitkuHandler: PaymentHandler = {
    name: "duitku",

    async createTransaction(
        config: PaymentGatewayConfig,
        request: PaymentRequest,
    ) {
        const merchantCode = config.merchant_id || "";
        const apiKey = config.secret_key; // Duitku uses API key as secret
        const timestamp = Date.now().toString();

        // Duitku signature: MD5(merchantCode + orderId + amount + apiKey)
        const signature = crypto
            .createHash("md5")
            .update(`${merchantCode}${request.orderId}${request.grossAmount}${apiKey}`)
            .digest("hex");

        const baseUrl = config.environment === "production"
            ? DUITKU_PRODUCTION_URL
            : DUITKU_SANDBOX_URL;

        // Determine callback and return URLs
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const payload = {
            merchantCode,
            paymentAmount: request.grossAmount,
            merchantOrderId: request.orderId,
            productDetails: request.items.map((i) => i.name).join(", ").substring(0, 255),
            email: request.customer.email,
            customerVaName: request.customer.firstName,
            phoneNumber: request.customer.phone || "",
            callbackUrl: `${appUrl}/api/webhook/duitku`,
            returnUrl: `${appUrl}/dashboard`,
            signature,
            timestamp,
            expiryPeriod: 1440, // 24 hours
        };

        const response = await fetch(baseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Duitku API error: ${response.status} - ${text}`);
        }

        const result = await response.json();

        if (result.statusCode !== "00") {
            throw new Error(`Duitku error: ${result.statusMessage || "Unknown error"}`);
        }

        return {
            redirect_url: result.paymentUrl,
            token: result.reference, // Duitku reference as token
        };
    },
};
