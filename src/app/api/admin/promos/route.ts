import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Helper: check if user is admin
async function requireAdmin() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (profile?.role?.toUpperCase() !== "ADMIN") return null;
    return user;
}

// GET — List all promos with usage stats
export async function GET() {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    // Fetch promos
    const { data: promos, error } = await adminSupabase
        .from("promos")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch usage stats for each promo
    const promoIds = (promos || []).map((p) => p.id);

    // Get usage counts and total discounts
    const { data: usageStats } = await adminSupabase
        .from("promo_usages")
        .select("promo_id, discount_amount")
        .in("promo_id", promoIds.length > 0 ? promoIds : ["__none__"]);

    // Get revenue from orders with promo codes
    const promoCodes = (promos || []).map((p) => p.code);
    const { data: revenueData } = await adminSupabase
        .from("orders")
        .select("promo_code, total_price, payment_status")
        .in("promo_code", promoCodes.length > 0 ? promoCodes : ["__none__"])
        .eq("payment_status", "PAID");

    // Build stats map
    const statsMap: Record<
        string,
        { usage_count: number; total_discount: number; total_revenue: number }
    > = {};

    for (const promo of promos || []) {
        const usages = (usageStats || []).filter((u) => u.promo_id === promo.id);
        const revenue = (revenueData || []).filter(
            (o) => o.promo_code === promo.code,
        );

        statsMap[promo.id] = {
            usage_count: usages.length,
            total_discount: usages.reduce(
                (sum, u) => sum + Number(u.discount_amount),
                0,
            ),
            total_revenue: revenue.reduce(
                (sum, o) => sum + Number(o.total_price),
                0,
            ),
        };
    }

    const promosWithStats = (promos || []).map((p) => ({
        ...p,
        stats: statsMap[p.id] || {
            usage_count: 0,
            total_discount: 0,
            total_revenue: 0,
        },
    }));

    return NextResponse.json(promosWithStats);
}

// POST — Create a new promo
export async function POST(request: NextRequest) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const body = await request.json();

    const {
        code,
        name,
        discount_type,
        discount_value,
        max_discount_cap,
        min_order_amount,
        start_date,
        end_date,
        global_usage_limit,
        per_user_usage_limit,
        scope_type,
        scope_ref_id,
        is_active,
    } = body;

    if (!code || !name || !discount_type || !discount_value) {
        return NextResponse.json(
            { error: "Kode, nama, tipe diskon, dan nilai diskon wajib diisi." },
            { status: 400 },
        );
    }

    const { data, error } = await adminSupabase
        .from("promos")
        .insert({
            code: (code as string).toUpperCase().trim(),
            name,
            discount_type,
            discount_value: Number(discount_value),
            max_discount_cap: max_discount_cap ? Number(max_discount_cap) : null,
            min_order_amount: min_order_amount ? Number(min_order_amount) : null,
            start_date: start_date || null,
            end_date: end_date || null,
            global_usage_limit: global_usage_limit
                ? Number(global_usage_limit)
                : null,
            per_user_usage_limit: per_user_usage_limit
                ? Number(per_user_usage_limit)
                : null,
            scope_type: scope_type || "all",
            scope_ref_id: scope_ref_id || null,
            is_active: is_active !== false,
        })
        .select()
        .single();

    if (error) {
        if (error.message?.includes("duplicate") || error.message?.includes("unique")) {
            return NextResponse.json(
                { error: "Kode promo sudah digunakan." },
                { status: 409 },
            );
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}

// PUT — Update a promo
export async function PUT(request: NextRequest) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
        return NextResponse.json(
            { error: "Promo ID wajib diisi." },
            { status: 400 },
        );
    }

    // Normalize code
    if (updateData.code) {
        updateData.code = (updateData.code as string).toUpperCase().trim();
    }

    // Normalize numeric fields
    if (updateData.discount_value !== undefined)
        updateData.discount_value = Number(updateData.discount_value);
    if (updateData.max_discount_cap !== undefined)
        updateData.max_discount_cap = updateData.max_discount_cap
            ? Number(updateData.max_discount_cap)
            : null;
    if (updateData.min_order_amount !== undefined)
        updateData.min_order_amount = updateData.min_order_amount
            ? Number(updateData.min_order_amount)
            : null;
    if (updateData.global_usage_limit !== undefined)
        updateData.global_usage_limit = updateData.global_usage_limit
            ? Number(updateData.global_usage_limit)
            : null;
    if (updateData.per_user_usage_limit !== undefined)
        updateData.per_user_usage_limit = updateData.per_user_usage_limit
            ? Number(updateData.per_user_usage_limit)
            : null;

    // Normalize nullable date fields
    if (updateData.start_date !== undefined)
        updateData.start_date = updateData.start_date || null;
    if (updateData.end_date !== undefined)
        updateData.end_date = updateData.end_date || null;
    if (updateData.scope_ref_id !== undefined)
        updateData.scope_ref_id = updateData.scope_ref_id || null;

    const { data, error } = await adminSupabase
        .from("promos")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        if (error.message?.includes("duplicate") || error.message?.includes("unique")) {
            return NextResponse.json(
                { error: "Kode promo sudah digunakan." },
                { status: 409 },
            );
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// DELETE — Delete a promo
export async function DELETE(request: NextRequest) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Promo ID wajib diisi." },
            { status: 400 },
        );
    }

    const { error } = await adminSupabase.from("promos").delete().eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
