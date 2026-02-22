// Shared types for the unified payment gateway abstraction layer

export interface PaymentGatewayConfig {
    id: string;
    gateway_name: string; // "midtrans" | "duitku"
    display_name: string;
    api_key: string;
    secret_key: string;
    merchant_id: string | null;
    environment: string; // "sandbox" | "production"
    is_active: boolean;
    payment_mode: string; // "gateway" | "manual"
    webhook_url: string | null;
    updated_at: string;
}

export interface ManualPaymentMethod {
    id: string;
    type: "bank_transfer" | "ewallet";
    provider_name: string;
    account_name: string;
    account_number: string;
    logo_url: string | null;
    is_active: boolean;
    sort_order: number;
}

export interface PaymentRequest {
    orderId: string;
    grossAmount: number;
    items: Array<{
        id: string;
        price: number;
        quantity: number;
        name: string;
    }>;
    customer: {
        email: string;
        firstName: string;
        phone?: string;
    };
    paymentMethod?: string; // gateway method code (e.g. "bca_va", "qris", "gopay")
}

/** Result returned by a gateway handler's createTransaction */
export interface GatewayTransactionResult {
    transaction_id?: string;
    payment_type?: string;
    payment_code?: string; // VA number, QR string, or deeplink URL
    expiry_time?: string; // ISO datetime from gateway
    redirect_url?: string; // For Duitku / GoPay deeplink
    qr_url?: string; // QR image URL if available
    // Legacy Snap fields (kept for Duitku compat)
    token?: string;
}

export interface PaymentResult {
    mode: "gateway" | "manual";
    // Gateway mode fields
    gateway_name?: string;
    transaction_id?: string;
    payment_type?: string;
    payment_code?: string;
    expiry_time?: string;
    redirect_url?: string;
    qr_url?: string;
    // Manual mode fields
    manual_methods?: ManualPaymentMethod[];
    // Common
    order_id: string;
}

export interface PaymentHandler {
    name: string;
    createTransaction(
        config: PaymentGatewayConfig,
        request: PaymentRequest,
        gatewayMethodCode?: string,
    ): Promise<GatewayTransactionResult>;
}
