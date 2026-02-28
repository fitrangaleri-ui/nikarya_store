import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  // Default ke /dashboard jika parameter next hilang
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("🔍 Confirm Route Hit:", {
    token_hash: token_hash ? "PRESENT" : "MISSING",
    type,
    code: code ? "PRESENT" : "MISSING",
    next,
  });

  const supabase = await createClient();

  // Flow 1: Token Hash (PKCE email template with token_hash)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      console.log("✅ Token Verified. Redirecting to:", next);
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = next;
      redirectUrl.searchParams.delete("token_hash");
      redirectUrl.searchParams.delete("type");
      redirectUrl.searchParams.delete("next");
      return NextResponse.redirect(redirectUrl);
    } else {
      console.error("❌ Verification Failed:", error.message);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(error.message)}`,
          request.url,
        ),
      );
    }
  }

  // Flow 2: Auth Code (PKCE code exchange — used when Supabase redirects with ?code=)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      console.log("✅ Code Exchanged. Redirecting to:", next);
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = next;
      redirectUrl.searchParams.delete("code");
      redirectUrl.searchParams.delete("next");
      return NextResponse.redirect(redirectUrl);
    } else {
      console.error("❌ Code Exchange Failed:", error.message);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(error.message)}`,
          request.url,
        ),
      );
    }
  }

  console.log("⚠️ Invalid Request (No Token or Code). Redirecting to Login.");
  return NextResponse.redirect(
    new URL("/login?error=Invalid%20Link", request.url),
  );
}
