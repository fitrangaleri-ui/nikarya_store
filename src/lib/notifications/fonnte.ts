import { createAdminClient } from "@/lib/supabase/admin";

interface AdminOrderNotification {
    orderId: string;
    customerName: string;
    totalPayment: number;
    paymentMethod?: string | null;
}

interface CustomerManualPaymentNotification {
    orderId: string;
    customerName: string;
    customerPhone?: string | null;
    totalPayment: number;
    manualPaymentMethodId?: string | null;
}

interface ManualPaymentMethodDetails {
    id: string;
    type: "bank_transfer" | "ewallet";
    provider_name: string;
    account_name: string;
    account_number: string;
}

const FONNTE_SEND_URL = "https://api.fonnte.com/send";
const ADMIN_ORDERS_URL = "https://customgaleri-store.com/admin/orders";
const FONNTE_TIMEOUT_MS = 5_000;

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
});

function normalizeWhatsAppNumber(phone?: string | null) {
    const digitsOnly = phone?.replace(/\D/g, "") || "";

    if (!digitsOnly) return "";
    if (digitsOnly.startsWith("0")) return `62${digitsOnly.slice(1)}`;
    if (digitsOnly.startsWith("8")) return `62${digitsOnly}`;

    return digitsOnly;
}

function buildAdminOrderNotificationMessage({
    orderId,
    customerName,
    totalPayment,
    paymentMethod,
}: AdminOrderNotification) {
    return [
        "Pesanan baru berhasil dibuat.",
        "",
        `Order ID: ${orderId}`,
        `Customer Name: ${customerName}`,
        `Total Payment: ${rupiahFormatter.format(totalPayment)}`,
        `Payment Method: ${paymentMethod || "Belum dipilih"}`,
        "",
        `Admin Orders: ${ADMIN_ORDERS_URL}`,
    ].join("\n");
}

function buildCustomerManualPaymentMessage({
    orderId,
    customerName,
    totalPayment,
    method,
}: CustomerManualPaymentNotification & { method: ManualPaymentMethodDetails }) {
    return [
        `Halo ${customerName}, terima kasih sudah berbelanja di Customgaleri Store.`,
        "",
        `Order ID: ${orderId}`,
        `Total Tagihan: ${rupiahFormatter.format(totalPayment)}`,
        "",
        "Instruksi Transfer:",
        `Nama Bank: ${method.provider_name}`,
        `No Rekening: ${method.account_number}`,
        `Atas Nama: ${method.account_name}`,
        "",
        "Silakan balas pesan ini dengan melampirkan bukti transfer setelah pembayaran selesai.",
    ].join("\n");
}

async function sendFonnteMessage(target: string, message: string) {
    try {
        const token = process.env.FONNTE_TOKEN;

        if (!token || !target) {
            console.error(
                "Fonnte notification skipped: FONNTE_TOKEN or target WhatsApp number is not configured.",
            );
            return;
        }

        const payload = new FormData();
        payload.append("target", target);
        payload.append("message", message);
        payload.append("delay", "2");

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), FONNTE_TIMEOUT_MS);

        try {
            const response = await fetch(FONNTE_SEND_URL, {
                method: "POST",
                headers: {
                    Authorization: token,
                },
                body: payload,
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => "");
                console.error(
                    "Fonnte notification failed:",
                    response.status,
                    errorText,
                );
                return false;
            }

            const result = await response.json().catch(() => null);
            if (result && typeof result === "object" && "status" in result && !result.status) {
                console.error("Fonnte notification rejected:", result);
                return false;
            }

            return true;
        } finally {
            clearTimeout(timeout);
        }
    } catch (error) {
        console.error("Fonnte notification error:", error);
        return false;
    }
}

export async function notifyAdminNewOrder(
    notification: AdminOrderNotification,
) {
    const target = normalizeWhatsAppNumber(process.env.WHATSAPP_NUMBER);
    await sendFonnteMessage(
        target,
        buildAdminOrderNotificationMessage(notification),
    );
}

export async function notifyCustomerManualPaymentOrder({
    manualPaymentMethodId,
    customerPhone,
    ...notification
}: CustomerManualPaymentNotification) {
    try {
        const target = normalizeWhatsAppNumber(customerPhone);

        if (!target) {
            console.error(
                "Customer manual payment notification skipped: customer phone number is not available.",
            );
            return;
        }

        if (!manualPaymentMethodId) {
            console.error(
                "Customer manual payment notification skipped: manual payment method id is not available.",
            );
            return;
        }

        const supabase = createAdminClient();
        const { data: method, error } = await supabase
            .from("manual_payment_methods")
            .select("id, type, provider_name, account_name, account_number")
            .eq("id", manualPaymentMethodId)
            .eq("is_active", true)
            .single();

        if (error || !method) {
            console.error(
                "Customer manual payment notification skipped: manual payment method lookup failed.",
                error,
            );
            return;
        }

        await sendFonnteMessage(
            target,
            buildCustomerManualPaymentMessage({
                ...notification,
                manualPaymentMethodId,
                customerPhone,
                method: method as ManualPaymentMethodDetails,
            }),
        );
    } catch (error) {
        console.error("Customer manual payment notification error:", error);
    }
}
