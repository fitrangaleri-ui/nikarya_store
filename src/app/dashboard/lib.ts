import { getDashboardStatusMeta } from "./status-badge";

// ── Status config ──
export const statusConfig: Record<
    string,
    { label: string; color: string }
> = {
    PAID: {
        label: getDashboardStatusMeta("PAID").label,
        color: "border-primary/20 bg-primary/10 text-primary",
    },
    PENDING: {
        label: getDashboardStatusMeta("PENDING").label,
        color: "border-warning/20 bg-warning/10 text-warning",
    },
    PENDING_MANUAL: {
        label: getDashboardStatusMeta("PENDING_MANUAL").label,
        color: "border-warning/20 bg-warning/10 text-warning",
    },
    EXPIRED: {
        label: getDashboardStatusMeta("EXPIRED").label,
        color: "border-destructive/20 bg-destructive/10 text-destructive",
    },
    FAILED: {
        label: getDashboardStatusMeta("FAILED").label,
        color: "border-destructive/20 bg-destructive/10 text-destructive",
    },
};

export function formatCurrency(amount: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(date: string) {
    return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export function formatDateTime(date: string) {
    return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ── Shared auth + data fetch ──
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";

// Cache user role checks for 60 seconds
export const getCachedUserRole = unstable_cache(
    async (userId: string) => {
        const admin = createAdminClient();
        const { data: roleCheck } = await admin
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .maybeSingle();
        return roleCheck?.role?.toUpperCase() || null;
    },
    ["user-role"],
    { revalidate: 60 }
);

// Lightweight access validation (not cached because auth status is dynamic)
export async function validateDashboardAccess() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const role = await getCachedUserRole(user.id);
    if (role === "ADMIN") {
        redirect("/admin");
    }

    return user;
}

// Cache profile queries for 30 seconds
export const getDashboardProfileData = unstable_cache(
    async (userId: string) => {
        const admin = createAdminClient();
        const { data: profile } = await admin
            .from("profiles")
            .select("full_name, email, phone")
            .eq("id", userId)
            .single();
        return profile || null;
    },
    ["dashboard-profile"],
    { revalidate: 30 }
);

// Cache overview stats for 30 seconds
export const getDashboardOverviewData = unstable_cache(
    async (userId: string) => {
        const admin = createAdminClient();
        const { data: orders } = await admin
            .from("orders")
            .select("id, payment_status, total_price, product_id")
            .eq("user_id", userId);

        const allOrders = orders || [];
        const paidOrders = allOrders.filter((o) => o.payment_status === "PAID");
        const totalSpent = paidOrders.reduce(
            (sum, o) => sum + Number(o.total_price),
            0,
        );

        const paidProductIds = new Set<string>();
        for (const order of paidOrders) {
            paidProductIds.add(order.product_id);
        }
        const uniquePaidProductsCount = paidProductIds.size;

        return {
            allOrdersCount: allOrders.length,
            paidOrdersCount: paidOrders.length,
            totalSpent,
            uniquePaidProductsCount,
        };
    },
    ["dashboard-overview"],
    { revalidate: 30 }
);

// Cache user's paid products for 30 seconds
export const getDashboardProductsData = unstable_cache(
    async (userId: string) => {
        const admin = createAdminClient();
        const { data: orders } = await admin
            .from("orders")
            .select("id, created_at, download_count, midtrans_order_id, product_id, payment_status, products(title, thumbnail_url, slug)")
            .eq("user_id", userId)
            .eq("payment_status", "PAID")
            .order("created_at", { ascending: false });

        const paidOrders = orders || [];

        // Deduplicate paid products (one card per unique product)
        const paidProductMap = new Map<string, (typeof paidOrders)[0]>();
        for (const order of paidOrders) {
            const pid = order.product_id;
            if (!paidProductMap.has(pid)) {
                paidProductMap.set(pid, order);
            }
        }
        const uniquePaidProducts = Array.from(paidProductMap.values());

        return uniquePaidProducts;
    },
    ["dashboard-products"],
    { revalidate: 30 }
);

// Cache order history for 30 seconds
export const getDashboardOrdersData = unstable_cache(
    async (userId: string) => {
        const admin = createAdminClient();
        const { data: orders } = await admin
            .from("orders")
            .select("id, midtrans_order_id, created_at, total_price, payment_status, products(title)")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        return orders || [];
    },
    ["dashboard-orders"],
    { revalidate: 30 }
);

// Retain legacy getDashboardData for backward compatibility (in case it is needed by subroutes not yet migrated)
export async function getDashboardData() {
    const user = await validateDashboardAccess();
    const profile = await getDashboardProfileData(user.id);
    const admin = createAdminClient();

    const { data: orders } = await admin
        .from("orders")
        .select(
            "*, products(title, thumbnail_url, slug, price, discount_price)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    const allOrders = orders || [];
    const paidOrders = allOrders.filter((o) => o.payment_status === "PAID");
    const totalSpent = paidOrders.reduce(
        (sum, o) => sum + Number(o.total_price),
        0,
    );

    const paidProductMap = new Map<string, (typeof allOrders)[0]>();
    for (const order of paidOrders) {
        const pid = order.product_id;
        if (!paidProductMap.has(pid)) {
            paidProductMap.set(pid, order);
        }
    }
    const uniquePaidProducts = Array.from(paidProductMap.values());

    return {
        user,
        profile,
        allOrders,
        paidOrders,
        totalSpent,
        uniquePaidProducts,
    };
}
