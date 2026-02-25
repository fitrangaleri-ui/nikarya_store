import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
    // Quick auth check
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (profile?.role?.toUpperCase() !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "categories") {
        const { data } = await adminSupabase
            .from("categories")
            .select("id, name")
            .order("name");
        return NextResponse.json(data || []);
    }

    if (type === "products") {
        const { data } = await adminSupabase
            .from("products")
            .select("id, title")
            .eq("is_active", true)
            .order("title");
        return NextResponse.json(data || []);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
