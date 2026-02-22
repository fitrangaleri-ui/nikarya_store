import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  // Mengambil parameter code dan next dari URL
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Jika ada parameter 'next', gunakan itu. Jika tidak, default ke '/dashboard'
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();

    // Tukar 'code' dari Google menjadi Session (Cookies) di aplikasi kita
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Jika berhasil, redirect user ke halaman tujuan (dashboard atau admin)
      // 'origin' akan otomatis menyesuaikan apakah sedang di localhost atau vercel
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Jika gagal atau code tidak valid, kembalikan ke halaman login dengan pesan error
  return NextResponse.redirect(
    `${origin}/login?error=Could not login with provider`,
  );
}
