"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const BUCKET = "category-thumbnails";

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function extractFilePath(publicUrl: string): string | null {
    try {
        const marker = `/storage/v1/object/public/${BUCKET}/`;
        const idx = publicUrl.indexOf(marker);
        if (idx === -1) return null;
        return decodeURIComponent(publicUrl.substring(idx + marker.length));
    } catch {
        return null;
    }
}

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

async function safeDeleteStorageFile(
    admin: ReturnType<typeof createAdminClient>,
    filePath: string
) {
    try {
        await admin.storage.from(BUCKET).remove([filePath]);
    } catch {
        // Silently ignore
    }
}

// ─── CREATE ─────────────────────────────────────────────────────────────────

export async function createCategory(formData: FormData) {
    const user = await verifyAdmin();
    if (!user) return { error: "Unauthorized" };

    const admin = createAdminClient();

    const name = formData.get("name") as string;
    if (!name || name.trim().length === 0) {
        return { error: "Nama kategori wajib diisi." };
    }

    const slug = slugify(name);
    const parentId = (formData.get("parent_id") as string) || null;
    const thumbnailFile = formData.get("thumbnail") as File | null;

    let thumbnailUrl: string | null = null;

    if (thumbnailFile && thumbnailFile.size > 0) {
        const fileExt = thumbnailFile.name.split(".").pop();
        const fileName = `${slug}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await admin.storage
            .from(BUCKET)
            .upload(fileName, thumbnailFile, {
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            return { error: `Upload gagal: ${uploadError.message}` };
        }

        const { data: publicUrl } = admin.storage
            .from(BUCKET)
            .getPublicUrl(fileName);

        thumbnailUrl = publicUrl.publicUrl;
    }

    const { error } = await admin.from("categories").insert({
        name: name.trim(),
        slug,
        thumbnail_url: thumbnailUrl,
        parent_id: parentId,
    });

    if (error) {
        if (thumbnailUrl) {
            const filePath = extractFilePath(thumbnailUrl);
            if (filePath) await safeDeleteStorageFile(admin, filePath);
        }
        return { error: error.message };
    }

    revalidatePath("/admin/products");
    return { success: true };
}

// ─── UPDATE ─────────────────────────────────────────────────────────────────

export async function updateCategory(categoryId: string, formData: FormData) {
    const user = await verifyAdmin();
    if (!user) return { error: "Unauthorized" };

    const admin = createAdminClient();

    const name = formData.get("name") as string;
    if (!name || name.trim().length === 0) {
        return { error: "Nama kategori wajib diisi." };
    }

    const slug = slugify(name);
    const parentId = (formData.get("parent_id") as string) || null;
    const thumbnailFile = formData.get("thumbnail") as File | null;
    const existingThumbnail = formData.get("existingThumbnail") as string;

    let thumbnailUrl = existingThumbnail || null;
    let oldFilePath: string | null = null;

    if (thumbnailFile && thumbnailFile.size > 0) {
        const fileExt = thumbnailFile.name.split(".").pop();
        const fileName = `${slug}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await admin.storage
            .from(BUCKET)
            .upload(fileName, thumbnailFile, {
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            return { error: `Upload gagal: ${uploadError.message}` };
        }

        const { data: publicUrl } = admin.storage
            .from(BUCKET)
            .getPublicUrl(fileName);

        if (existingThumbnail) {
            oldFilePath = extractFilePath(existingThumbnail);
        }

        thumbnailUrl = publicUrl.publicUrl;
    }

    const { error } = await admin
        .from("categories")
        .update({
            name: name.trim(),
            slug,
            thumbnail_url: thumbnailUrl,
            parent_id: parentId,
        })
        .eq("id", categoryId);

    if (error) {
        return { error: error.message };
    }

    if (oldFilePath) {
        await safeDeleteStorageFile(admin, oldFilePath);
    }

    revalidatePath("/admin/products");
    return { success: true };
}

// ─── DELETE ─────────────────────────────────────────────────────────────────

export async function deleteCategory(categoryId: string) {
    const user = await verifyAdmin();
    if (!user) return { error: "Unauthorized" };

    const admin = createAdminClient();

    // Check for children
    const { data: children } = await admin
        .from("categories")
        .select("id")
        .eq("parent_id", categoryId)
        .limit(1);

    if (children && children.length > 0) {
        return { error: "Hapus sub-kategori terlebih dahulu sebelum menghapus kategori induk." };
    }

    const { data: category } = await admin
        .from("categories")
        .select("thumbnail_url")
        .eq("id", categoryId)
        .single();

    if (category?.thumbnail_url) {
        const filePath = extractFilePath(category.thumbnail_url);
        if (filePath) {
            await safeDeleteStorageFile(admin, filePath);
        }
    }

    const { error } = await admin
        .from("categories")
        .delete()
        .eq("id", categoryId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/products");
    return { success: true };
}

// ─── DELETE IMAGE ONLY ──────────────────────────────────────────────────────

export async function deleteCategoryImage(categoryId: string) {
    const user = await verifyAdmin();
    if (!user) return { error: "Unauthorized" };

    const admin = createAdminClient();

    const { data: category } = await admin
        .from("categories")
        .select("thumbnail_url")
        .eq("id", categoryId)
        .single();

    if (category?.thumbnail_url) {
        const filePath = extractFilePath(category.thumbnail_url);
        if (filePath) {
            await safeDeleteStorageFile(admin, filePath);
        }
    }

    const { error } = await admin
        .from("categories")
        .update({ thumbnail_url: null })
        .eq("id", categoryId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/products");
    return { success: true };
}
