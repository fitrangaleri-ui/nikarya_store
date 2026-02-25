import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validatePromo } from "@/lib/promo/validator";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const adminSupabase = createAdminClient();

        // Get current user (optional)
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const body = await request.json();
        const { code, items, email } = body as {
            code: string;
            items: { id: string; quantity: number }[];
            email?: string;
        };

        if (!code || !items || items.length === 0) {
            return NextResponse.json(
                { valid: false, message: "Kode promo dan item keranjang wajib diisi." },
                { status: 400 },
            );
        }

        const result = await validatePromo(adminSupabase, {
            code,
            items,
            userId: user?.id || null,
            email: email || user?.email || null,
        });

        return NextResponse.json(result);
    } catch (err) {
        console.error("Promo validate error:", err);
        return NextResponse.json(
            { valid: false, message: "Terjadi kesalahan server." },
            { status: 500 },
        );
    }
}
