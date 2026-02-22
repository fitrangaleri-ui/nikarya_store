"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const admin = createAdminClient();
    const { data: profile } = await admin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (profile?.role?.toUpperCase() !== "ADMIN") return null;
    return user;
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

type ImportRow = {
    title: string;
    description?: string;
    price: number;
    category?: string;
    product_code?: string;
    sku?: string;
    badge?: string;
    tags?: string;
    original_price?: number;
    discount_percent?: number;
    discount_price?: number;
    thumbnail_url?: string;
    drive_file_url?: string;
    demo_link?: string;
    is_active?: boolean;
};

export async function importProducts(rows: ImportRow[]) {
    const user = await verifyAdmin();
    if (!user) return { error: "Unauthorized" };

    if (!rows || rows.length === 0) {
        return { error: "Tidak ada data untuk diimpor." };
    }

    const admin = createAdminClient();

    // Fetch all categories for mapping name → id
    const { data: categories } = await admin
        .from("categories")
        .select("id, name");
    const catMap = new Map(
        (categories || []).map((c) => [c.name.toLowerCase().trim(), c.id])
    );

    const insertPayload = rows.map((row) => {
        const categoryId = row.category
            ? catMap.get(row.category.toLowerCase().trim()) || null
            : null;

        return {
            title: row.title.trim(),
            slug: slugify(row.title),
            description: row.description?.trim() || null,
            price: Number(row.price) || 0,
            category_id: categoryId,
            product_code: row.product_code?.trim() || null,
            sku: row.sku?.trim() || null,
            badge: row.badge?.trim() || null,
            tags: row.tags
                ? row.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                : null,
            original_price: row.original_price ? Number(row.original_price) : null,
            discount_percent: row.discount_percent
                ? Number(row.discount_percent)
                : null,
            discount_price: row.discount_price ? Number(row.discount_price) : null,
            thumbnail_url: row.thumbnail_url?.trim() || null,
            drive_file_url: row.drive_file_url?.trim() || null,
            demo_link: row.demo_link?.trim() || null,
            is_active: row.is_active !== false,
        };
    });

    const { error, data } = await admin
        .from("products")
        .insert(insertPayload)
        .select("id");

    if (error) {
        return { error: `Import gagal: ${error.message}` };
    }

    revalidatePath("/admin/products");
    return { success: true, count: data?.length || 0 };
}

export async function exportProducts() {
    const user = await verifyAdmin();
    if (!user) return { error: "Unauthorized" };

    const admin = createAdminClient();

    const { data: products, error } = await admin
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });

    if (error) {
        return { error: error.message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (products || []).map((p: any) => ({
        title: p.title,
        description: p.description || "",
        price: p.price,
        category: p.categories?.name || "",
        product_code: p.product_code || "",
        sku: p.sku || "",
        badge: p.badge || "",
        tags: (p.tags || []).join(", "),
        original_price: p.original_price || "",
        discount_percent: p.discount_percent || "",
        discount_price: p.discount_price || "",
        thumbnail_url: p.thumbnail_url || "",
        drive_file_url: p.drive_file_url || "",
        demo_link: p.demo_link || "",
        is_active: p.is_active ? "true" : "false",
    }));

    return { success: true, data: rows };
}
