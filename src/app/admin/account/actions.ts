"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const AVATAR_BUCKET = "avatars";

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

function extractAvatarPath(publicUrl: string): string | null {
    try {
        const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`;
        const idx = publicUrl.indexOf(marker);
        if (idx === -1) return null;
        return decodeURIComponent(publicUrl.substring(idx + marker.length));
    } catch {
        return null;
    }
}

async function safeDeleteFile(
    admin: ReturnType<typeof createAdminClient>,
    filePath: string
) {
    try {
        await admin.storage.from(AVATAR_BUCKET).remove([filePath]);
    } catch {
        // silently ignore
    }
}

export async function updateProfile(formData: FormData) {
    const user = await verifyAdmin();
    if (!user) return { error: "Unauthorized" };

    const admin = createAdminClient();
    const fullName = (formData.get("full_name") as string)?.trim() || "";
    const avatarFile = formData.get("avatar") as File | null;
    const existingAvatar = formData.get("existingAvatar") as string;
    const removeAvatar = formData.get("removeAvatar") === "true";

    let avatarUrl: string | null = existingAvatar || null;
    let oldFilePath: string | null = null;

    // Handle avatar removal
    if (removeAvatar && existingAvatar) {
        oldFilePath = extractAvatarPath(existingAvatar);
        avatarUrl = null;
    }

    // Handle new avatar upload
    if (avatarFile && avatarFile.size > 0) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

        // Ensure bucket exists
        const { data: buckets } = await admin.storage.listBuckets();
        const bucketExists = buckets?.some((b) => b.name === AVATAR_BUCKET);
        if (!bucketExists) {
            await admin.storage.createBucket(AVATAR_BUCKET, { public: true });
        }

        const { error: uploadError } = await admin.storage
            .from(AVATAR_BUCKET)
            .upload(fileName, avatarFile, {
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            return { error: `Upload gagal: ${uploadError.message}` };
        }

        // Remember old avatar for cleanup
        if (existingAvatar) {
            oldFilePath = extractAvatarPath(existingAvatar);
        }

        const { data: publicUrl } = admin.storage
            .from(AVATAR_BUCKET)
            .getPublicUrl(fileName);

        avatarUrl = publicUrl.publicUrl;
    }

    // Update profile
    const { error } = await admin
        .from("profiles")
        .update({
            full_name: fullName,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    if (error) return { error: error.message };

    // Cleanup old avatar
    if (oldFilePath) {
        await safeDeleteFile(admin, oldFilePath);
    }

    revalidatePath("/admin/account");
    return { success: true };
}

export async function changePassword(formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const newPassword = formData.get("new_password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (!newPassword || newPassword.length < 6) {
        return { error: "Password minimal 6 karakter." };
    }

    if (newPassword !== confirmPassword) {
        return { error: "Password tidak cocok." };
    }

    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}
