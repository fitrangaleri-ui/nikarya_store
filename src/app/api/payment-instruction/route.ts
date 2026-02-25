import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/payment-instruction?orderId=CGS-xxx
 * Returns order details + payment info for the instruction page.
 * Works for both gateway (Midtrans Core API / Duitku) and manual payments.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get("orderId");

        if (!orderId) {
            return NextResponse.json(
                { error: "orderId parameter required" },
                { status: 400 },
            );
        }

        const supabase = createAdminClient();

        // Fetch the first order row with this midtrans_order_id
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("midtrans_order_id, total_price, payment_status, payment_deadline, manual_payment_method_id, quantity, payment_code, payment_type, payment_gateway, payment_method, midtrans_transaction_id, discount_amount, original_total, promo_code")
            .eq("midtrans_order_id", orderId)
            .limit(1)
            .maybeSingle();

        if (orderError || !order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 },
            );
        }

        // Calculate grand total across all order rows for this orderId
        const { data: allOrders } = await supabase
            .from("orders")
            .select("total_price, discount_amount, original_total, promo_code")
            .eq("midtrans_order_id", orderId);

        const grandTotal = (allOrders || []).reduce(
            (sum, o) => sum + Number(o.total_price),
            0,
        );

        // Get discount info from first order row (discount is order-level)
        const discountAmount = Number(order.discount_amount || 0);
        const originalTotal = Number(order.original_total || 0);
        const promoCode = order.promo_code || null;

        // Final amount = grand total - discount
        const finalAmount = Math.max(0, grandTotal - discountAmount);

        // Fetch manual payment method if applicable
        let manualMethod = null;
        if (order.manual_payment_method_id) {
            const { data: m } = await supabase
                .from("manual_payment_methods")
                .select("id, type, provider_name, account_name, account_number, logo_url")
                .eq("id", order.manual_payment_method_id)
                .single();
            manualMethod = m;
        }

        return NextResponse.json({
            orderId: order.midtrans_order_id,
            totalAmount: finalAmount,
            originalTotal: originalTotal > 0 ? originalTotal : grandTotal,
            discountAmount,
            promoCode,
            paymentStatus: order.payment_status,
            paymentDeadline: order.payment_deadline,
            paymentGateway: order.payment_gateway,
            paymentMethod: order.payment_method, // gateway method code
            paymentType: order.payment_type,
            paymentCode: order.payment_code, // VA number, QR string, deeplink
            transactionId: order.midtrans_transaction_id,
            manualMethod,
        });
    } catch (err) {
        console.error("Payment instruction error:", err);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 },
        );
    }
}
