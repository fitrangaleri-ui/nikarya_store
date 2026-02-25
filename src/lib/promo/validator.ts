import { SupabaseClient } from "@supabase/supabase-js";

export interface PromoValidationInput {
    code: string;
    items: { id: string; quantity: number }[];
    userId?: string | null;
    email?: string | null;
}

export interface PromoValidationResult {
    valid: boolean;
    message: string;
    promoId?: string;
    code?: string;
    discountType?: "percentage" | "fixed";
    discountValue?: number;
    discountAmount?: number;
    eligibleSubtotal?: number;
    finalTotal?: number;
}

interface PromoRow {
    id: string;
    code: string;
    name: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    max_discount_cap: number | null;
    min_order_amount: number | null;
    start_date: string | null;
    end_date: string | null;
    global_usage_limit: number | null;
    per_user_usage_limit: number | null;
    scope_type: "all" | "category" | "product";
    scope_ref_id: string | null;
    is_active: boolean;
}

interface ProductRow {
    id: string;
    price: number;
    category_id: string | null;
}

/**
 * Core promo validation logic used by both the preview API and checkout backend.
 * `adminSupabase` must be a service-role client to bypass RLS.
 */
export async function validatePromo(
    adminSupabase: SupabaseClient,
    input: PromoValidationInput,
): Promise<PromoValidationResult> {
    const fail = (msg: string): PromoValidationResult => ({
        valid: false,
        message: msg,
    });

    // 1. Fetch promo
    const { data: promo, error: promoError } = await adminSupabase
        .from("promos")
        .select("*")
        .eq("code", input.code.toUpperCase().trim())
        .maybeSingle();

    if (promoError || !promo) {
        return fail("Kode promo tidak ditemukan.");
    }

    const p = promo as PromoRow;

    // 2. Active check
    if (!p.is_active) {
        return fail("Kode promo sudah tidak aktif.");
    }

    // 3. Date range check
    const now = new Date();
    if (p.start_date && new Date(p.start_date) > now) {
        return fail("Kode promo belum berlaku.");
    }
    if (p.end_date && new Date(p.end_date) < now) {
        return fail("Kode promo sudah kedaluwarsa.");
    }

    // 4. Global usage limit
    if (p.global_usage_limit !== null) {
        const { count } = await adminSupabase
            .from("promo_usages")
            .select("*", { count: "exact", head: true })
            .eq("promo_id", p.id);

        if ((count ?? 0) >= p.global_usage_limit) {
            return fail("Kuota penggunaan promo sudah habis.");
        }
    }

    // 5. Per-user usage limit
    if (p.per_user_usage_limit !== null) {
        let query = adminSupabase
            .from("promo_usages")
            .select("*", { count: "exact", head: true })
            .eq("promo_id", p.id);

        if (input.userId) {
            query = query.eq("user_id", input.userId);
        } else if (input.email) {
            query = query.eq("guest_email", input.email);
        }

        const { count } = await query;

        if ((count ?? 0) >= p.per_user_usage_limit) {
            return fail("Anda sudah mencapai batas penggunaan promo ini.");
        }
    }

    // 6. Fetch products from DB (need price + category_id for scope)
    const productIds = input.items.map((i) => i.id);
    const { data: products } = await adminSupabase
        .from("products")
        .select("id, price, category_id")
        .in("id", productIds)
        .eq("is_active", true);

    if (!products || products.length === 0) {
        return fail("Produk di keranjang tidak valid.");
    }

    const qtyMap = new Map(input.items.map((i) => [i.id, i.quantity]));

    // Calculate full subtotal
    const fullSubtotal = (products as ProductRow[]).reduce(
        (sum, prod) => sum + Number(prod.price) * (qtyMap.get(prod.id) || 1),
        0,
    );

    // 7. Scope eligibility — determine eligible subtotal
    let eligibleSubtotal = 0;

    if (p.scope_type === "all") {
        eligibleSubtotal = fullSubtotal;
    } else if (p.scope_type === "category" && p.scope_ref_id) {
        eligibleSubtotal = (products as ProductRow[])
            .filter((prod) => prod.category_id === p.scope_ref_id)
            .reduce(
                (sum, prod) => sum + Number(prod.price) * (qtyMap.get(prod.id) || 1),
                0,
            );
    } else if (p.scope_type === "product" && p.scope_ref_id) {
        const target = (products as ProductRow[]).find(
            (prod) => prod.id === p.scope_ref_id,
        );
        if (target) {
            eligibleSubtotal =
                Number(target.price) * (qtyMap.get(target.id) || 1);
        }
    }

    if (eligibleSubtotal === 0) {
        return fail("Tidak ada produk yang memenuhi syarat promo ini.");
    }

    // 8. Minimum order check (against full subtotal)
    if (p.min_order_amount && fullSubtotal < Number(p.min_order_amount)) {
        return fail(
            `Minimum belanja Rp ${Number(p.min_order_amount).toLocaleString("id-ID")} untuk menggunakan promo ini.`,
        );
    }

    // 9. Calculate discount
    let discountAmount = 0;

    if (p.discount_type === "fixed") {
        discountAmount = Math.min(Number(p.discount_value), eligibleSubtotal);
    } else {
        // percentage
        discountAmount = eligibleSubtotal * (Number(p.discount_value) / 100);
        if (p.max_discount_cap !== null) {
            discountAmount = Math.min(discountAmount, Number(p.max_discount_cap));
        }
    }

    // Clamp to eligible subtotal
    discountAmount = Math.min(discountAmount, eligibleSubtotal);
    // Round to remove floating point noise
    discountAmount = Math.round(discountAmount);

    const finalTotal = Math.max(0, fullSubtotal - discountAmount);

    return {
        valid: true,
        message: "Promo berhasil diterapkan!",
        promoId: p.id,
        code: p.code,
        discountType: p.discount_type,
        discountValue: Number(p.discount_value),
        discountAmount,
        eligibleSubtotal,
        finalTotal,
    };
}
