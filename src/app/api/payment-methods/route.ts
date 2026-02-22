import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
    try {
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("payment_methods")
            .select("code, label, description, enabled_payments")
            .eq("is_active", true)
            .order("sort_order", { ascending: true });

        if (error) {
            console.error("Failed to fetch payment methods:", error);
            return NextResponse.json(
                { error: "Failed to fetch payment methods" },
                { status: 500 },
            );
        }

        return NextResponse.json({ methods: data || [] });
    } catch (err) {
        console.error("Payment methods error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
