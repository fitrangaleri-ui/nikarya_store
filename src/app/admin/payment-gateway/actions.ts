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

// ── Fetch all gateway configs ──
export async function getGatewayConfigs() {
    const admin = createAdminClient();
    const { data, error } = await admin
        .from("payment_gateway_config")
        .select("*")
        .order("gateway_name");

    if (error) return { configs: [], error: error.message };
    return { configs: data || [] };
}

// ── Fetch all manual payment methods ──
export async function getManualMethods() {
    const admin = createAdminClient();
    const { data, error } = await admin
        .from("manual_payment_methods")
        .select("*")
        .order("sort_order");

    if (error) return { methods: [], error: error.message };
    return { methods: data || [] };
}

// ── Save/update gateway credentials ──
export async function saveGatewayConfig(formData: FormData) {
    const user = await verifyAdmin();
    if (!user) return { error: "Unauthorized" };

    const admin = createAdminClient();

    const id = formData.get("id") as string;
    const gatewayName = formData.get("gateway_name") as string;
    const displayName = formData.get("display_name") as string;
    const apiKey = formData.get("api_key") as string;
    const secretKey = formData.get("secret_key") as string;
    const merchantId = (formData.get("merchant_id") as string) || null;
    const environment = formData.get("environment") as string;

    if (!gatewayName || !displayName) {
        return { error: "Nama gateway wajib diisi." };
    }

    if (!["sandbox", "production"].includes(environment)) {
        return { error: "Environment harus sandbox atau production." };
    }

    const updateData = {
        gateway_name: gatewayName,
        display_name: displayName,
        api_key: apiKey,
        secret_key: secretKey,
        merchant_id: merchantId,
        environment,
        updated_at: new Date().toISOString(),
    };

    if (id) {
        const { error } = await admin
            .from("payment_gateway_config")
            .update(updateData)
            .eq("id", id);
        if (error) return { error: error.message };
    } else {
        const { error } = await admin
            .from("payment_gateway_config")
            .insert({ ...updateData, is_active: false, payment_mode: "gateway" });
        if (error) return { error: error.message };
    }

    revalidatePath("/admin/payment-gateway");
    return { success: true };
}

// ── Set active gateway ──
export async function setActiveGateway(gatewayId: string) {
    const user = await verifyAdmin();
    if (!user) return { error: "Unauthorized" };

    const admin = createAdminClient();

    // First get the current payment_mode from active config
    const { data: current } = await admin
        .from("payment_gateway_config")
        .select("payment_mode")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

    const currentMode = current?.payment_mode || "gateway";

    // Deactivate all
    await admin
        .from("payment_gateway_config")
        .update({ is_active: false });

    // Activate selected and preserve payment_mode
    const { error } = await admin
        .from("payment_gateway_config")
        .update({ is_active: true, payment_mode: currentMode })
        .eq("id", gatewayId);

    if (error) return { error: error.message };

    revalidatePath("/admin/payment-gateway");
    return { success: true };
}

// ── Set payment mode (gateway / manual) ──
export async function setPaymentMode(mode: string) {
    const user = await verifyAdmin();
    if (!user) return { error: "Unauthorized" };

    if (!["gateway", "manual"].includes(mode)) {
        return { error: "Mode harus gateway atau manual." };
    }

    const admin = createAdminClient();

    // Update all configs to reflect the global mode
    const { error } = await admin
        .from("payment_gateway_config")
        .update({ payment_mode: mode, updated_at: new Date().toISOString() })
        .neq("id", "00000000-0000-0000-0000-000000000000"); // update all rows

    if (error) return { error: error.message };

    revalidatePath("/admin/payment-gateway");
    return { success: true };
}

// ── Save manual payment method ──
export async function saveManualMethod(formData: FormData) {
    const user = await verifyAdmin();
    if (!user) return { error: "Unauthorized" };

    const admin = createAdminClient();

    const id = (formData.get("id") as string) || null;
    const type = formData.get("type") as string;
    const providerName = formData.get("provider_name") as string;
    const accountName = formData.get("account_name") as string;
    const accountNumber = formData.get("account_number") as string;
    const logoUrl = (formData.get("logo_url") as string) || null;
    const sortOrder = parseInt(formData.get("sort_order") as string) || 0;

    if (!type || !providerName || !accountName || !accountNumber) {
        return { error: "Semua field wajib diisi." };
    }

    if (!["bank_transfer", "ewallet"].includes(type)) {
        return { error: "Tipe harus bank_transfer atau ewallet." };
    }

    const methodData = {
        type,
        provider_name: providerName,
        account_name: accountName,
        account_number: accountNumber,
        logo_url: logoUrl,
        sort_order: sortOrder,
        updated_at: new Date().toISOString(),
    };

    if (id) {
        const { error } = await admin
            .from("manual_payment_methods")
            .update(methodData)
            .eq("id", id);
        if (error) return { error: error.message };
    } else {
        const { error } = await admin
            .from("manual_payment_methods")
            .insert({ ...methodData, is_active: true });
        if (error) return { error: error.message };
    }

    revalidatePath("/admin/payment-gateway");
    return { success: true };
}

// ── Delete manual payment method ──
export async function deleteManualMethod(id: string) {
    const user = await verifyAdmin();
    if (!user) return { error: "Unauthorized" };

    const admin = createAdminClient();

    const { error } = await admin
        .from("manual_payment_methods")
        .delete()
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/payment-gateway");
    return { success: true };
}

// ── Toggle manual payment method active status ──
export async function toggleManualMethod(id: string, isActive: boolean) {
    const user = await verifyAdmin();
    if (!user) return { error: "Unauthorized" };

    const admin = createAdminClient();

    const { error } = await admin
        .from("manual_payment_methods")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/payment-gateway");
    return { success: true };
}
