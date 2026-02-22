"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

// --- 1. Login dengan Email & Password ---
export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirectTo") as string | null;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Cek Role setelah login berhasil
  if (data.user) {
    return await handleRoleRedirect(data.user.id, redirectTo);
  }

  redirect(redirectTo || "/dashboard");
}

// --- 2. Register User Baru ---
export async function register(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  // Dapatkan URL origin untuk link verifikasi email
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      // Link verifikasi akan mengarah ke endpoint ini
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // JANGAN redirect di sini.
  // Kembalikan status sukses ke halaman Register agar bisa menampilkan pesan
  return { success: true };
}

// --- 3. Login with Google ---
// Menerima parameter optional 'redirectTo' dari halaman Login
export async function loginWithGoogle(redirectTo: string | null = null) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  // Membangun URL callback dengan parameter 'next'
  const callbackUrl = new URL(`${origin}/auth/callback`);
  if (redirectTo) {
    callbackUrl.searchParams.set("next", redirectTo);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Google Login Error:", error);
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

// --- 4. Logout ---
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// --- Helper Function: Cek Role & Redirect ---
async function handleRoleRedirect(userId: string, redirectTo: string | null) {
  const adminClient = createAdminClient();

  // Ambil data profile user untuk cek role
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    redirect(redirectTo || "/dashboard");
  }

  const normalizedRole = profile?.role?.toUpperCase();

  // Jika ADMIN -> Paksa ke /admin
  if (normalizedRole === "ADMIN") {
    redirect("/admin");
  }

  // Jika USER BIASA -> Ke halaman tujuan (redirectTo) atau Dashboard
  redirect(redirectTo || "/dashboard");
}

// --- 5. Forgot Password (Kirim Email) - UPDATED ---
export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  // Ambil origin (domain saat ini)
  const headersList = await headers();
  const origin = headersList.get("origin");

  // PENTING: Tambahkan parameter ?next=/reset-password
  // Ini memberitahu Route Handler (/auth/confirm) untuk redirect user ke halaman reset
  // setelah token diverifikasi.
  const redirectUrl = `${origin}/auth/confirm?next=/reset-password`;

  console.log("Forgot Password Request:", email);
  console.log("Redirect URL:", redirectUrl);

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    console.error("Forgot Password Error:", error.message);
    return { error: error.message };
  }

  return { success: true };
}

// --- 6. Reset Password (Update Password Baru) ---
export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    return { error: "Password tidak cocok." };
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}
