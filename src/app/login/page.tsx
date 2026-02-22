"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, loginWithGoogle } from "../(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Komponen Icon Google (SVG)
function GoogleIcon() {
  return (
    <svg
      className="mr-2.5 h-4 w-4"
      aria-hidden="true"
      focusable="false"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 488 512"
    >
      <path
        fill="currentColor"
        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
      ></path>
    </svg>
  );
}

function LoginFormInner() {
  const searchParams = useSearchParams();
  // Mengambil parameter 'redirectTo' dari URL browser (contoh: /login?redirectTo=/checkout)
  const redirectTo = searchParams.get("redirectTo") || "";

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Handle Login Email/Password
  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  // Handle Login Google
  const handleGoogleLogin = () => {
    setError(null);
    startTransition(async () => {
      // Mengirim nilai 'redirectTo' ke server action agar Google tahu tujuan pulang
      const result = await loginWithGoogle(redirectTo || "/dashboard");
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Ornamen Halus */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-[400px] bg-background/95 backdrop-blur-xl border border-border/40 shadow-2xl rounded-3xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-500">
        {/* Glow Akses Dalam Box */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none -z-10" />

        <div className="text-center px-6 pt-10 pb-4">
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1.5">
            Selamat Datang Kembali
          </h1>
          <p className="text-sm text-muted-foreground">
            Masuk untuk mengakses koleksi Anda.
          </p>
        </div>

        <div className="px-6 pb-8 space-y-5">
          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-center text-destructive border border-destructive/20 animate-in fade-in zoom-in-95">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div className="space-y-1.5 text-left">
              <Label
                htmlFor="email"
                className="text-xs font-semibold text-muted-foreground ml-1"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
                className="h-11 rounded-xl border-border/50 bg-muted/30 focus:bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <Label
                htmlFor="password"
                className="text-xs font-semibold text-muted-foreground ml-1"
              >
                Kata Sandi
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="h-11 rounded-xl border-border/50 bg-muted/30 focus:bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm"
              />
            </div>

            <div className="flex items-center justify-between pt-1 pb-2">
              <div className="flex items-center gap-2 ml-1">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-border/50 h-3.5 w-3.5 focus:ring-primary text-primary bg-background cursor-pointer"
                />
                <Label
                  htmlFor="remember"
                  className="text-[11px] font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                >
                  Ingat Saya
                </Label>
              </div>

              <Link
                href="/forgot-password"
                className="text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Lupa Sandi?
              </Link>
            </div>

            <Button
              type="submit"
              variant="brand"
              className="w-full rounded-full h-11"
              disabled={isPending}
            >
              {isPending ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          {/* Minimalist Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background/95 px-3 text-muted-foreground text-[10px]">
                atau
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full h-11 rounded-full border-border/50 bg-transparent text-foreground hover:bg-muted/50 font-medium text-sm transition-all"
            onClick={handleGoogleLogin}
            disabled={isPending}
          >
            <GoogleIcon />
            Lanjutkan dengan Google
          </Button>

          <p className="text-xs text-muted-foreground text-center pt-2">
            Belum punya akun?{" "}
            <Link
              href={`/register${redirectTo ? `?redirectTo=${redirectTo}` : ""}`}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
