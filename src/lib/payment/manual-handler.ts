import { createAdminClient } from "@/lib/supabase/admin";
import type { ManualPaymentMethod } from "./types";

/**
 * Manual payment handler.
 * Returns active manual payment methods from the database.
 */
export async function getManualPaymentMethods(): Promise<ManualPaymentMethod[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("manual_payment_methods")
        .select("id, type, provider_name, account_name, account_number, logo_url, is_active, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

    if (error) {
        console.error("Failed to fetch manual payment methods:", error);
        return [];
    }

    return (data || []) as ManualPaymentMethod[];
}
