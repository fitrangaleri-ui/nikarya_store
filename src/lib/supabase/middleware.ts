import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ===== PERBAIKAN: Tambahkan helper function untuk cek role =====
  async function getUserRole(userId: string): Promise<string | null> {
    try {
      // Gunakan .maybeSingle() untuk handle error lebih baik
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching role:", error);
        return null;
      }

      // Normalize role to uppercase untuk konsistensi
      return profile?.role?.toUpperCase() || null;
    } catch (error) {
      console.error("Exception fetching role:", error);
      return null;
    }
  }

  // Protected routes: /dashboard/* requires authentication
  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Admin routes: /admin/* requires ADMIN role
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }

    // ===== PERBAIKAN: Gunakan helper function =====
    const role = await getUserRole(user.id);

    // Debug log (hapus setelah testing)
    console.log(
      "🔍 Middleware check - User:",
      user.email,
      "Role:",
      role,
      "Path:",
      pathname,
    );

    if (role !== "ADMIN") {
      console.log("❌ Access denied - redirecting to dashboard");
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    console.log("✅ Admin access granted");
  }

  // ===== PERBAIKAN: Redirect logic untuk /login dan /register =====
  if ((pathname === "/login" || pathname === "/register") && user) {
    const redirectTo = request.nextUrl.searchParams.get("redirectTo");

    // Jika ada redirectTo yang spesifik, honor it
    if (redirectTo && redirectTo !== pathname) {
      const url = request.nextUrl.clone();
      url.pathname = redirectTo;
      url.searchParams.delete("redirectTo");
      return NextResponse.redirect(url);
    }

    // Auto-redirect berdasarkan role
    const role = await getUserRole(user.id);

    console.log("🔄 Auto-redirect - User:", user.email, "Role:", role);

    const url = request.nextUrl.clone();
    url.pathname = role === "ADMIN" ? "/admin" : "/dashboard";
    url.searchParams.delete("redirectTo");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
