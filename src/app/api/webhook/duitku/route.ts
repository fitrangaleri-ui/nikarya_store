import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

/**
 * Duitku callback/webhook handler.
 * Called by Duitku when a payment status changes.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            merchantCode,
            amount,
            merchantOrderId,
            resultCode,
            signature: receivedSignature,
        } = body;

        // 1. Fetch Duitku config from DB
        const supabase = createAdminClient();
        const { data: config } = await supabase
            .from("payment_gateway_config")
            .select("secret_key, merchant_id")
            .eq("gateway_name", "duitku")
            .limit(1)
            .maybeSingle();

        if (!config) {
            console.error("Duitku webhook: no config found");
            return NextResponse.json({ error: "Config not found" }, { status: 500 });
        }

        const apiKey = config.secret_key;

        // 2. Verify signature: MD5(merchantCode + amount + merchantOrderId + apiKey)
        const expectedSignature = crypto
            .createHash("md5")
            .update(`${merchantCode}${amount}${merchantOrderId}${apiKey}`)
            .digest("hex");

        if (receivedSignature !== expectedSignature) {
            console.error("Duitku webhook: invalid signature");
            return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
        }

        // 3. Determine payment status
        // Duitku resultCode: "00" = success, "01" = pending, "02" = failed/cancelled
        let paymentStatus: string = "PENDING";

        if (resultCode === "00") {
            paymentStatus = "PAID";
        } else if (resultCode === "02") {
            paymentStatus = "FAILED";
        }

        // 4. Update order in DB
        const { error } = await supabase
            .from("orders")
            .update({ payment_status: paymentStatus })
            .eq("midtrans_order_id", merchantOrderId);

        if (error) {
            console.error("Duitku webhook: update failed", error);
            return NextResponse.json({ error: "Update failed" }, { status: 500 });
        }

        console.log(`Duitku webhook: order ${merchantOrderId} → ${paymentStatus}`);

        return NextResponse.json({ status: "ok" });
    } catch (err: unknown) {
        console.error("Duitku webhook error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
