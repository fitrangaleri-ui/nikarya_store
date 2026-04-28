import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MAX_DOWNLOADS } from "@/lib/constants";

/**
 * GET /api/download/[orderId]/file
 *
 * Proxy route that redirects to the Google Drive file
 * without exposing the raw drive_file_url in JavaScript context.
 *
 * Flow:
 * 1. Authenticate user
 * 2. Verify order ownership & payment status
 * 3. Check download quota
 * 4. Redirect to Google Drive URL (302)
 *
 * Note: download_count increment is handled by the pre-flight route
 * (/api/download/[orderId]) which is called via fetch() before this
 * route is opened via window.open().
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const supabase = await createClient();

    // 1. Check session
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch order
    const adminClient = createAdminClient();
    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .select("*, products(drive_file_url, title)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    // 3. Validate ownership
    if (order.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden — bukan order Anda" },
        { status: 403 }
      );
    }

    // 4. Validate payment
    if (order.payment_status !== "PAID") {
      return NextResponse.json(
        { error: "Pembayaran belum selesai" },
        { status: 403 }
      );
    }

    // 5. Validate quota
    const currentCount = order.download_count || 0;
    if (currentCount > MAX_DOWNLOADS) {
      return NextResponse.json(
        {
          error: `Batas download tercapai (maksimal ${MAX_DOWNLOADS}x)`,
          download_count: currentCount,
          remaining: 0,
          max: MAX_DOWNLOADS,
        },
        { status: 403 }
      );
    }

    // 6. Get drive URL
    const product = order.products as {
      drive_file_url: string | null;
      title: string;
    } | null;
    const driveUrl = product?.drive_file_url;

    if (!driveUrl) {
      return NextResponse.json(
        { error: "File tidak tersedia. Hubungi admin." },
        { status: 404 }
      );
    }

    // 7. Redirect to Google Drive — download_count sudah di-increment
    //    oleh pre-flight route (/api/download/[orderId])
    const response = NextResponse.redirect(driveUrl);
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  } catch (err: unknown) {
    console.error("Download file proxy error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
