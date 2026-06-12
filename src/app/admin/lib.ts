import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Cache user role checks for admin for 30 seconds
export const getCachedAdminRole = unstable_cache(
  async (userId: string) => {
    const admin = createAdminClient();
    const { data: roleCheck } = await admin
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
    return roleCheck?.role?.toUpperCase() || null;
  },
  ["admin-role-check"],
  { revalidate: 30 }
);

// Server-side strict access validation for admin panel
export async function validateAdminAccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const role = await getCachedAdminRole(user.id);
  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  return user;
}

// Cache admin dashboard stats for 15 seconds
export const getAdminDashboardStats = unstable_cache(
  async () => {
    const admin = createAdminClient();
    const [
      { count: productsCount },
      { count: ordersCount },
      { count: customersCount },
      { data: paidOrders },
      { data: recentOrders },
      { data: recentProducts },
    ] = await Promise.all([
      admin.from("products").select("*", { count: "exact", head: true }),
      admin.from("orders").select("*", { count: "exact", head: true }),
      admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "USER"),
      admin.from("orders").select("total_price").eq("payment_status", "PAID"),
      admin
        .from("orders")
        .select("*, profiles(email, full_name), products(title)")
        .order("created_at", { ascending: false })
        .limit(5),
      admin
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const totalRevenue =
      paidOrders?.reduce((acc, order) => acc + Number(order.total_price), 0) || 0;

    return {
      productsCount: productsCount || 0,
      ordersCount: ordersCount || 0,
      customersCount: customersCount || 0,
      totalRevenue,
      recentOrders: recentOrders || [],
      recentProducts: recentProducts || [],
    };
  },
  ["admin-dashboard-stats"],
  { revalidate: 15, tags: ["admin-stats"] }
);
