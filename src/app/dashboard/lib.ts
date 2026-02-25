import { Download, Clock, XCircle } from "lucide-react";
import { createElement } from "react";

// ── Status config ──
export const statusConfig: Record<
    string,
    { label: string; color: string; icon: React.ReactNode }
> = {
    PAID: {
        label: "Lunas",
        color:
            "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
        icon: createElement(Download, { className: "h-3 w-3" }),
    },
    PENDING: {
        label: "Menunggu Bayar",
        color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
        icon: createElement(Clock, { className: "h-3 w-3" }),
    },
    PENDING_MANUAL: {
        label: "Menunggu Konfirmasi",
        color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
        icon: createElement(Clock, { className: "h-3 w-3" }),
    },
    EXPIRED: {
        label: "Kadaluarsa",
        color: "bg-red-50 text-red-600 border-red-200 hover:bg-red-50",
        icon: createElement(XCircle, { className: "h-3 w-3" }),
    },
    FAILED: {
        label: "Gagal",
        color: "bg-red-50 text-red-600 border-red-200 hover:bg-red-50",
        icon: createElement(XCircle, { className: "h-3 w-3" }),
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

export async function getDashboardData() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const admin = createAdminClient();

    const { data: roleCheck } = await admin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (roleCheck?.role?.toUpperCase() === "ADMIN") {
        redirect("/admin");
    }

    const { data: profile } = await admin
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

    const { data: orders } = await admin
        .from("orders")
        .select(
            "*, products(title, thumbnail_url, slug, price, discount_price, drive_file_url)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    const allOrders = orders || [];
    const paidOrders = allOrders.filter((o) => o.payment_status === "PAID");
    const totalSpent = paidOrders.reduce(
        (sum, o) => sum + Number(o.total_price),
        0,
    );

    // Deduplicate paid products (one card per unique product)
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
